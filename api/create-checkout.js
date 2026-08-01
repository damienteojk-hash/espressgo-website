import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICES = {
  'single': { amount: 390, name: 'Single Sachet' },
  'pack-2': { amount: 750, name: 'Pack of 2' },
  'pack-5': { amount: 1890, name: 'Pack of 5' },
  'box-12': { amount: 4490, name: 'Box of 12' },
}

const MAX_QTY_PER_ITEM = 20

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { cart, name, email, phone, pickupDate } = req.body

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' })
    }

    const line_items = []
    for (const item of cart) {
      const product = PRICES[item?.bundle]
      const qty = Number(item?.qty)
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
        return res.status(400).json({ error: 'Invalid cart item' })
      }
      line_items.push({
        price_data: {
          currency: 'sgd',
          product_data: {
            name: product.name,
            description: 'ESPRESSGO Espresso Coffee Jelly - Pickup at NYP MakersNode Marketplace',
          },
          unit_amount: product.amount,
        },
        quantity: qty,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paynow'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?cancelled=true`,
      customer_email: email,
      metadata: {
        cart: JSON.stringify(cart),
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