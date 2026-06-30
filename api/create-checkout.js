import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICES = {
  '1-pack': { amount: 250, name: '1 Pack ESPRESSGO' },
  '5-pack': { amount: 1200, name: '5 Pack ESPRESSGO' },
  '10-pack': { amount: 2300, name: '10 Pack ESPRESSGO' },
  '20-pack': { amount: 4500, name: '20 Pack ESPRESSGO' },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { bundle, name, email, phone } = req.body

    const product = PRICES[bundle]
    if (!product) {
      return res.status(400).json({ error: 'Invalid bundle' })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paynow'],
      line_items: [
        {
          price_data: {
            currency: 'sgd',
            product_data: {
              name: product.name,
              description: 'ESPRESSGO Espresso Coffee Jelly - Pickup at NYP North Canteen',
            },
            unit_amount: product.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?cancelled=true`,
      customer_email: email,
      metadata: {
        bundle,
        name,
        phone,
      },
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}