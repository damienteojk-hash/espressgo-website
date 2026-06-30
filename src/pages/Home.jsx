import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import styles from './Home.module.css'

const CharacterSVG = ({ cls }) => (
  <img src="/Asset_1.svg" alt="" className={cls || styles.character} />
)

const WordmarkSVG = ({ cls }) => (
  <img src="/Asset_2.svg" alt="ESPRESSGO" className={cls || styles.heroWordmark} />
)

const BUNDLES = [
  { id: '1-pack', label: '1 Pack', price: 2.50, qty: 1 },
  { id: '5-pack', label: '5 Pack', price: 12.00, qty: 5 },
  { id: '10-pack', label: '10 Pack', price: 23.00, qty: 10 },
  { id: '20-pack', label: '20 Pack', price: 45.00, qty: 20 },
]

export default function Home({ onAdminNav }) {
  const [stock, setStock] = useState(null)
  const [mode, setMode] = useState('preorder')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [selectedBundle, setSelectedBundle] = useState(null)
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => { fetchStockInfo() }, [])

  async function fetchStockInfo() {
    const { data } = await supabase.from('settings').select('*')
    if (data) {
      const modeRow = data.find(s => s.key === 'store_mode')
      const stockRow = data.find(s => s.key === 'stock_count')
      if (modeRow) setMode(modeRow.value)
      if (stockRow) setStock(parseInt(stockRow.value))
    }
  }

  async function handleNotify(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await supabase.from('notify_list').insert({ email })
    setSubmitted(true)
    setLoading(false)
  }

  async function handleCheckout(e) {
    e.preventDefault()
    if (!selectedBundle || !buyerName || !buyerEmail) return
    setCheckoutLoading(true)
    setCheckoutError('')
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundle: selectedBundle,
          name: buyerName,
          email: buyerEmail,
          phone: buyerPhone,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutError('Something went wrong. Please try again.')
      }
    } catch (err) {
      setCheckoutError('Something went wrong. Please try again.')
    }
    setCheckoutLoading(false)
  }

  const soldOut = mode === 'soldout' || (mode === 'live' && stock <= 0)

  const StoreStatusBadge = () => {
    if (mode === 'preorder') return <span className={styles.badge}>Pre-order Open</span>
    if (mode === 'live' && stock > 0) return <span className={styles.badge}>{stock} sachets left</span>
    return <span className={styles.badgeSoldOut}>Sold Out</span>
  }

  const HeroCTA = () => (
    <div className={styles.ctaBlock}>
      <StoreStatusBadge />
      {!soldOut ? (
        <>
          <p className={styles.ctaNote}>
            {mode === 'preorder' ? 'First batch dropping soon. Reserve yours now.' : 'Pick your bundle below.'}
          </p>
          <a href="#order" className={styles.ctaBtn}>
            {mode === 'preorder' ? 'Pre-order Now' : 'Order Now'}
          </a>
        </>
      ) : (
        submitted ? (
          <p className={styles.ctaNote}>You're on the list. We'll notify you.</p>
        ) : (
          <form onSubmit={handleNotify} className={styles.notifyForm}>
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className={styles.notifyInput} required />
            <button type="submit" className={styles.notifyBtn} disabled={loading}>{loading ? '...' : 'Notify Me'}</button>
          </form>
        )
      )}
    </div>
  )

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <WordmarkSVG cls={styles.navWordmark} />
        <div className={styles.navLinks}>
          <a href="#product">Product</a>
          <a href="#about">About</a>
          <a href="#order">Order</a>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <p className={styles.eyebrow}>1 Shot of Espresso</p>
            <WordmarkSVG cls={styles.heroWordmark} />
            <p className={styles.tagline}>Coffee takes time, ESPRESSGO doesn't.</p>
            <HeroCTA />
          </div>
          <div className={styles.heroRight}>
            <CharacterSVG cls={styles.character} />
          </div>
        </div>
        <div className={styles.heroFooter}>
          <span>Shelf-stable</span><span className={styles.dot}>·</span>
          <span>No refrigeration needed</span><span className={styles.dot}>·</span>
          <span>~70mg caffeine</span><span className={styles.dot}>·</span>
          <span>Zero sugar</span>
        </div>
      </section>

      <section className={styles.product} id="product">
        <div className={styles.sectionInner}>
          <div className={styles.productGrid}>
            <div className={styles.productInfo}>
              <p className={styles.sectionLabel}>The Product</p>
              <h2 className={styles.sectionTitle}>Espresso Coffee Jelly in a Squeeze Pouch</h2>
              <p className={styles.body}>No cups. No spills. No waiting. ESPRESSGO is a shelf-stable espresso coffee jelly you squeeze straight into your mouth — the same caffeine hit as a shot of espresso, pocket-sized and ready anywhere.</p>
              <div className={styles.pillRow}>
                <span className={styles.pill}>Arabica Soluble Coffee</span>
                <span className={styles.pill}>Erythritol</span>
                <span className={styles.pill}>Konnyaku Jelly</span>
                <span className={styles.pill}>Monk Fruit Extract</span>
              </div>
            </div>
            <div className={styles.packagingCol}>
              <img src="/ESPRESSGO Packaging.svg" alt="ESPRESSGO Packaging" className={styles.packagingImg} />
              <div className={styles.nutritionCard}>
                <p className={styles.nipLabel}>Nutrition Information</p>
                <p className={styles.nipServing}>Per sachet (approximately 50g)</p>
                <div className={styles.nipRow}><span>Energy</span><span>12 kcal</span></div>
                <div className={styles.nipRow}><span>Protein</span><span>0g</span></div>
                <div className={styles.nipRow}><span>Total Fat</span><span>0g</span></div>
                <div className={styles.nipRow}><span>Total Carbohydrate</span><span>10g</span></div>
                <div className={`${styles.nipRow} ${styles.nipIndent}`}><span>of which sugars</span><span>0g</span></div>
                <div className={`${styles.nipRow} ${styles.nipHighlight}`}><span>Caffeine</span><span>~70mg</span></div>
                <p className={styles.nipNote}>Contains no allergens. Suitable for vegans.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.about} id="about">
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabelLight}>Our Story</p>
          <h2 className={styles.sectionTitleLight}>Built for people who move fast</h2>
          <div className={styles.aboutGrid}>
            <p className={styles.bodyLight}>ESPRESSGO started from a simple observation: people needed caffeine on the go but had no convenient format. Not a drink that spills, not a pill that feels clinical — something in between.</p>
            <p className={styles.bodyLight}>Developed in Singapore through the NYP Food Science and Nutrition programme and produced at SIT FoodPlant, every sachet is retort-sterilised for a 9-month shelf life at room temperature.</p>
          </div>
        </div>
      </section>

      <section className={styles.orderSection} id="order">
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Get Yours</p>
          <h2 className={styles.sectionTitle}>Order ESPRESSGO</h2>
          <p className={styles.pickupNote}>Pickup at Nanyang Polytechnic, Blk E North Canteen, N2 No Nonsense Stall</p>

          {soldOut ? (
            <div className={styles.soldOutBlock}>
              <span className={styles.badgeSoldOut}>Sold Out</span>
              {submitted ? (
                <p className={styles.ctaNote}>You're on the list. We'll notify you.</p>
              ) : (
                <form onSubmit={handleNotify} className={styles.notifyForm}>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className={styles.notifyInput} required />
                  <button type="submit" className={styles.notifyBtn} disabled={loading}>{loading ? '...' : 'Notify Me'}</button>
                </form>
              )}
            </div>
          ) : (
            <>
              <div className={styles.bundleGrid}>
                {BUNDLES.map(b => (
                  <button
                    key={b.id}
                    className={`${styles.bundleCard} ${selectedBundle === b.id ? styles.bundleCardActive : ''}`}
                    onClick={() => setSelectedBundle(b.id)}
                    type="button"
                  >
                    <span className={styles.bundleLabel}>{b.label}</span>
                    <span className={styles.bundlePrice}>S${b.price.toFixed(2)}</span>
                    <span className={styles.bundleQty}>{b.qty} sachet{b.qty > 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>

              {selectedBundle && (
                <form onSubmit={handleCheckout} className={styles.checkoutForm}>
                  <p className={styles.checkoutFormTitle}>Your Details</p>
                  <div className={styles.checkoutFormGrid}>
                    <input type="text" placeholder="Full name" value={buyerName} onChange={e => setBuyerName(e.target.value)} className={styles.checkoutInput} required />
                    <input type="email" placeholder="Email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} className={styles.checkoutInput} required />
                    <input type="tel" placeholder="Phone (optional)" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} className={styles.checkoutInput} />
                  </div>
                  {checkoutError && <p className={styles.checkoutError}>{checkoutError}</p>}
                  <button type="submit" className={styles.ctaBtn} disabled={checkoutLoading}>
                    {checkoutLoading ? 'Redirecting to payment...' : 'Proceed to Payment'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </section>

      <footer className={styles.footer}>
        <WordmarkSVG cls={styles.footerWordmark} />
        <p className={styles.footerText}>ESPRESSGO Pte. Ltd. · Singapore</p>
        <button className={styles.adminLink} onClick={onAdminNav}>Admin</button>
      </footer>
    </div>
  )
}