import { useState } from 'react'
import { supabase } from '../supabase'
import styles from './Home.module.css'

const CharacterSVG = ({ cls }) => (
  <img src="/Asset_1.svg" alt="" className={cls || styles.character} />
)

const WordmarkSVG = ({ cls }) => (
  <img src="/Asset_2.svg" alt="ESPRESSGO" className={cls || styles.heroWordmark} />
)

const SHOPEE_URL = 'https://shopee.sg/product/1885673461/47463818262/'

export default function Home({ onAdminNav }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleNotify(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await supabase.from('notify_list').insert({ email })
    setSubmitted(true)
    setLoading(false)
  }

  const HeroCTA = () => (
    <div className={styles.ctaBlock}>
      <span className={styles.badge}>Available Now on Shopee</span>
      <p className={styles.ctaNoteDark}>Grab your sachets, delivered straight to your door.</p>
      <a href={SHOPEE_URL} target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
        Buy on Shopee
      </a>
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
          <div className={styles.soldOutBlock}>
            <a href={SHOPEE_URL} target="_blank" rel="noopener noreferrer" className={styles.ctaBtnDark}>
              Buy on Shopee
            </a>

            {submitted ? (
              <p className={styles.ctaNote}>You're on the list. We'll keep you posted.</p>
            ) : (
              <form onSubmit={handleNotify} className={styles.notifyForm}>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className={styles.notifyInputDark} required />
                <button type="submit" className={styles.notifyBtnDark} disabled={loading}>{loading ? '...' : 'Get Updates'}</button>
              </form>
            )}
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