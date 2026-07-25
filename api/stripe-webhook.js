import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

export const config = {
  api: {
    bodyParser: false,
  },
}

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

const BUNDLE_QUANTITIES = {
  'pack-5': 5,
  'box-12': 12,
}

const BUNDLE_LABELS = {
  'pack-5': 'Pack of 5',
  'box-12': 'Box of 12',
}

function formatPickupDate(isoDate) {
  if (!isoDate) return null
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })
}

function buildWhatsAppLink(phone, { name, bundle, formattedDate, location }) {
  if (!phone) return null
  // Strip anything that isn't a digit (spaces, dashes, +, brackets)
  const digitsOnly = phone.replace(/\D/g, '')
  // Singapore numbers are 8 digits; prepend the 65 country code if not already present
  const withCountryCode = digitsOnly.startsWith('65') ? digitsOnly : `65${digitsOnly}`

  const firstName = (name || '').split(' ')[0] || 'there'
  const bundleLabel = BUNDLE_LABELS[bundle] || bundle
  const dateLine = formattedDate ? ` on ${formattedDate}` : ''
  const message = `Hi ${firstName}, this is Damien, founder of ESPRESSGO! Thank you so much for your order (${bundleLabel}). Just a reminder that your pickup is at ${location}${dateLine}. Let me know if you have any questions!`

  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { bundle, name, phone, pickupDate, pickupLocation } = session.metadata
    const email = session.customer_email
    const sachetCount = BUNDLE_QUANTITIES[bundle] || 1
    const location = pickupLocation || 'NYP MakersNode Marketplace'
    const formattedDate = formatPickupDate(pickupDate)
    const whatsappLink = buildWhatsAppLink(phone, { name, bundle, formattedDate, location })

    console.log('Attempting order insert:', { name, email, sachetCount, bundle, pickupDate })

    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      name,
      email,
      quantity: sachetCount,
      status: 'paid',
      pickup_date: pickupDate || null,
      pickup_location: location,
    }).select()

    if (orderError) {
      console.error('Order insert failed:', JSON.stringify(orderError))
    } else {
      console.log('Order insert succeeded:', JSON.stringify(orderData))
    }

    const { data: stockRow, error: stockFetchError } = await supabase.from('settings').select('*').eq('key', 'stock_count').single()
    if (stockFetchError) {
      console.error('Stock fetch failed:', JSON.stringify(stockFetchError))
    }
    if (stockRow) {
      const newStock = Math.max(0, parseInt(stockRow.value) - sachetCount)
      const { error: stockUpdateError } = await supabase.from('settings').upsert({ key: 'stock_count', value: String(newStock) }, { onConflict: 'key' })
      if (stockUpdateError) {
        console.error('Stock update failed:', JSON.stringify(stockUpdateError))
      }
    }

    try {
      await resend.emails.send({
        from: 'ESPRESSGO <orders@espressgo.sg>',
        reply_to: 'damienteo@espressgo.sg',
        to: email,
        subject: 'Your ESPRESSGO order is confirmed',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #653a17;">Order Confirmed!</h2>
            <p>Hi ${name},</p>
            <p>Thanks for your order. Here are the details:</p>
            <p><strong>${BUNDLE_LABELS[bundle] || bundle}</strong></p>
            <p>Pickup location: <strong>${location}</strong></p>
            ${formattedDate ? `<p>Pickup date: <strong>${formattedDate}</strong></p>` : ''}
            <p>We'll notify you once your order is ready for collection.</p>
            <p>Thanks for supporting ESPRESSGO!</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Customer email failed:', emailErr)
    }

    try {
      await resend.emails.send({
        from: 'ESPRESSGO Orders <orders@espressgo.sg>',
        to: ['damienteo@espressgo.sg', 'espressgosg@gmail.com'],
        subject: `New pickup order — ${BUNDLE_LABELS[bundle] || bundle} (${formattedDate || pickupDate || 'no date'})`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #653a17;">New Pickup Order</h2>
            <p><strong>Bundle:</strong> ${BUNDLE_LABELS[bundle] || bundle} (${sachetCount} sachets)</p>
            <p><strong>Customer:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            ${whatsappLink ? `<p><a href="${whatsappLink}" style="display:inline-block; background:#25D366; color:#fff; padding:8px 16px; border-radius:6px; text-decoration:none; font-weight:600;">Message ${name} on WhatsApp</a></p>` : ''}
            <p><strong>Pickup date:</strong> ${formattedDate || pickupDate || 'Not specified'}</p>
            <p><strong>Pickup location:</strong> ${location}</p>
            <p><strong>Stripe session:</strong> ${session.id}</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Owner notification email failed:', emailErr)
    }

  }

  res.status(200).json({ received: true })
}