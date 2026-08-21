import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { orderId, trackingNumber, trackingUrl } = req.body

    if (!orderId || !trackingNumber || !trackingUrl) {
      return res.status(400).json({ error: 'orderId, trackingNumber and trackingUrl are required' })
    }

    const { data: order, error: fetchError } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (fetchError || !order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const { error: updateError } = await supabase.from('orders').update({
      status: 'shipped',
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
    }).eq('id', orderId)

    if (updateError) {
      console.error('Mark shipped update failed:', updateError)
      return res.status(500).json({ error: updateError.message })
    }

    const items = Array.isArray(order.items) ? order.items : []
    const windowText = order.estimated_delivery_earliest && order.estimated_delivery_latest
      ? `${new Date(order.estimated_delivery_earliest + 'T00:00:00').toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })} – ${new Date(order.estimated_delivery_latest + 'T00:00:00').toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}`
      : null

    try {
      await resend.emails.send({
        from: 'ESPRESSGO <orders@espressgo.sg>',
        reply_to: 'damienteo@espressgo.sg',
        to: order.email,
        subject: 'Your ESPRESSGO order is on its way!',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #653a17;">Your order has shipped!</h2>
            <p>Hi ${order.name},</p>
            <p>Your order is on its way:</p>
            ${items.map((i) => `<p><strong>${i.label}</strong> x${i.qty}</p>`).join('')}
            <p>Delivering to: <strong>${order.delivery_address}, Singapore ${order.delivery_postal_code}</strong></p>
            ${windowText ? `<p>Estimated delivery: <strong>${windowText}</strong></p>` : ''}
            <p><a href="${trackingUrl}" style="display:inline-block; background:#653a17; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none; font-weight:600;">Track your order</a></p>
            <p>Tracking number: ${trackingNumber}</p>
            <p>Thanks for supporting ESPRESSGO!</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Shipped email failed:', emailErr)
    }

    res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
