import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICES = {
  'pack-5': { amount: 1390, name: 'Pack of 5' },
  'box-12': { amount: 3120, name: 'Box of 12' },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { bundle, name, email, phone, pickupDate } = req.body

    const product = PRICES[bundle]
    if (!product) {
      return res.status(400).json({ error: 'Invalid bundle' })
    }
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paynow'],
      line_items: [
        {
          price_data: {
            currency: 'sgd',
            product_data: {
              name: product.name,
              description: 'ESPRESSGO Espresso Coffee Jelly - Pickup at NYP MakersNode Marketplace',
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
        pickupDate,
        pickupLocation: 'NYP MakersNode Marketplace',
      },
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}