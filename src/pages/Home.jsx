import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import styles from './Home.module.css'

const CharacterSVG = ({ cls }) => (
  <img src="/Asset_1.svg" alt="" className={cls || styles.character} />
)

const WordmarkSVG = ({ cls }) => (
  <img src="/Asset_2.svg" alt="ESPRESSGO" className={cls || styles.heroWordmark} />
)

export default function Home({ onAdminNav }) {
  const [stock, setStock] = useState(null)
  const [mode, setMode] = useState('preorder')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const CTASection = () => {
    if (mode === 'preorder') return (
      <div className={styles.ctaBlock}>
        <span className={styles.badge}>Pre-order Open</span>
        <p className={styles.ctaNote}>First batch dropping soon. Reserve yours now.</p>
        <a href="#order" className={styles.ctaBtn}>Pre-order Now</a>
      </div>
    )
    if (mode === 'live' && stock > 0) return (
      <div className={styles.ctaBlock}>
        <span className={styles.badge}>{stock} sachets left</span>
        <a href="#order" className={styles.ctaBtn}>Order Now</a>
      </div>
    )
    return (
      <div className={styles.ctaBlock}>
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
    )
  }

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
            <CTASection />
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
          <div className={styles.orderCard}>
            <div className={styles.orderInfo}><CharacterSVG cls={styles.orderCharacter} /></div>
            <div className={styles.orderDetails}>
              <p className={styles.productName}>ESPRESSGO Espresso Coffee Jelly</p>
              <p className={styles.productSub}>1 Sachet · ~50g · ~70mg Caffeine</p>
              <p className={styles.productPrice}>Coming Soon</p>
              <CTASection />
            </div>
          </div>
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