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
  '1-pack': 1,
  '5-pack': 5,
  '10-pack': 10,
  '20-pack': 20,
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
    const { bundle, name, phone } = session.metadata
    const email = session.customer_email
    const sachetCount = BUNDLE_QUANTITIES[bundle] || 1

    await supabase.from('orders').insert({
      name,
      email,
      quantity: sachetCount,
      status: 'paid',
    })

    const { data: stockRow } = await supabase.from('settings').select('*').eq('key', 'stock_count').single()
    if (stockRow) {
      const newStock = Math.max(0, parseInt(stockRow.value) - sachetCount)
      await supabase.from('settings').upsert({ key: 'stock_count', value: String(newStock) }, { onConflict: 'key' })
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
            <p><strong>${bundle.replace('-', ' ')}</strong></p>
            <p>Pickup location: <strong>Nanyang Polytechnic, Blk E North Canteen, N2 No Nonsense Stall</strong></p>
            <p>We'll notify you once your order is ready for collection.</p>
            <p>Thanks for supporting ESPRESSGO!</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Email failed:', emailErr)
    }
  }

  res.status(200).json({ received: true })
}