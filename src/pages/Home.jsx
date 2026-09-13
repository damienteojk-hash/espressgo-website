import { useState } from 'react'
import { supabase } from '../supabase'
import styles from './Home.module.css'
import ProductCarousel from '../components/ProductCarousel'

const CharacterSVG = ({ cls }) => (
  <img src="/Asset_1.svg" alt="" className={cls || styles.character} />
)

const WordmarkSVG = ({ cls }) => (
  <img src="/Asset_2.svg" alt="ESPRESSGO" className={cls || styles.heroWordmark} />
)

const LOCATIONS = [
  { name: 'NYP MakersNode Marketplace', mapsUrl: 'https://maps.app.goo.gl/NqVniNzX5TyruHR88' },
  { name: 'Soon Hock Mini Supermarket', mapsUrl: 'https://maps.app.goo.gl/LyChEURZdyo6atPp8' },
  { name: 'Rasa Bento', mapsUrl: 'https://maps.app.goo.gl/LrYSKCGs8igwXXFM9' },
]

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.6 5.82A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
  </svg>
)

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.05L2 22l5.13-1.32A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.3c-.22.62-1.28 1.2-1.77 1.24-.46.05-.9.24-3.03-.63-2.56-1.05-4.2-3.63-4.33-3.8-.13-.17-1.03-1.37-1.03-2.6 0-1.24.65-1.85.88-2.1.22-.24.5-.3.66-.3.17 0 .33 0 .48.01.15.01.36-.06.56.43.22.53.73 1.83.8 1.96.06.13.1.28.02.45-.08.17-.13.28-.25.43-.13.15-.27.34-.38.46-.13.13-.26.27-.11.53.15.26.68 1.12 1.46 1.81 1 .89 1.85 1.17 2.11 1.3.26.13.41.11.56-.07.15-.17.65-.76.82-1.02.17-.26.34-.22.56-.13.22.08 1.42.67 1.66.79.24.13.4.19.46.3.06.13.06.72-.16 1.34z" />
  </svg>
)

const BagIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8h12l1 12H5L6 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
)

const CupIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" />
    <path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17" />
    <path d="M8 3c-.5 1 .5 1.5 0 2.5" />
    <path d="M12 3c-.5 1 .5 1.5 0 2.5" />
  </svg>
)

const ClockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)

const FollowUs = ({ className, iconClassName }) => (
  <div className={className}>
    <span>Follow Us</span>
    <a href="/ig" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon className={iconClassName || styles.socialIcon} /></a>
    <a href="/tiktok" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TikTokIcon className={iconClassName || styles.socialIcon} /></a>
  </div>
)

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
      <span className={styles.badge}>In Stock Now</span>
      <p className={styles.ctaNoteDark}>Available on Shopee — delivered island-wide.</p>
      <div className={styles.heroCtaRow}>
        <a href="/shopee" target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
          Buy on Shopee
        </a>
      </div>
      <FollowUs className={styles.heroFollowUs} iconClassName={styles.heroSocialIcon} />
    </div>
  )

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <WordmarkSVG cls={styles.navWordmark} />
        <div className={styles.navLinks}>
          <a href="#product">Product</a>
          <a href="#about">About</a>
          <a href="/shopee" target="_blank" rel="noopener noreferrer" className={styles.navBuyNow}>Buy Now</a>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <p className={styles.eyebrow}>1 Shot of Espresso</p>
            <WordmarkSVG cls={styles.heroWordmark} />
            <p className={styles.tagline}>Coffee. Anytime. Anywhere.</p>
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

      <section className={styles.hook}>
        <div className={styles.sectionInner}>
          <h2 className={styles.hookQuestion}>Ever wanted a coffee but couldn't get one?</h2>
          <p className={styles.hookPain}>You're mid-shift, no break in sight. This fits in your pocket.</p>
          <div className={styles.stepsRow}>
            <span className={styles.step}>Tear</span>
            <span className={styles.stepArrow}>→</span>
            <span className={styles.step}>Squeeze</span>
            <span className={styles.stepArrow}>→</span>
            <span className={styles.step}>Go</span>
          </div>
          <p className={styles.hookTagline}>Coffee. Anytime. Anywhere.</p>
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
              <ProductCarousel />
              <div className={styles.benefitsCard}>
                <p className={styles.nipLabel}>Why ESPRESSGO</p>
                <div className={styles.benefitItem}>
                  <BagIcon className={styles.benefitIcon} />
                  <div>
                    <p className={styles.benefitTitle}>Fits in your pocket or bag</p>
                    <p className={styles.benefitDesc}>Shelf-stable, no refrigeration required — take it anywhere.</p>
                  </div>
                </div>
                <div className={styles.benefitItem}>
                  <CupIcon className={styles.benefitIcon} />
                  <div>
                    <p className={styles.benefitTitle}>~70mg caffeine</p>
                    <p className={styles.benefitDesc}>The same caffeine hit as one cup of espresso, in a squeeze.</p>
                  </div>
                </div>
                <div className={styles.benefitItem}>
                  <ClockIcon className={styles.benefitIcon} />
                  <div>
                    <p className={styles.benefitTitle}>Coffee, anytime</p>
                    <p className={styles.benefitDesc}>Even stuck in a meeting or halfway through a conference.</p>
                  </div>
                </div>
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

      <section className={styles.founder} id="founder">
        <div className={styles.sectionInner}>
          <div className={styles.founderGrid}>
            <img src="/founder/damien.webp" alt="Damien Teo, Founder of ESPRESSGO" className={styles.founderPhoto} />
            <div>
              <p className={styles.sectionLabel}>The Founder</p>
              <h2 className={styles.sectionTitle}>Built by someone who needed it too</h2>
              <p className={styles.body}>I'm Damien — I studied Food Science and Nutrition at Nanyang Polytechnic. The idea for ESPRESSGO came from my internship: my colleagues and I would hit a wall in the middle of a work session, but never had time to get up for a proper coffee. We'd reach for candy or snacks instead, and they never gave us the boost we actually needed. So I built ESPRESSGO — the same caffeine hit as an espresso, ready in seconds, wherever you are.</p>
              <div className={styles.founderLinks}>
                <a href="/whatsapp" target="_blank" rel="noopener noreferrer" className={styles.founderLinkBtn}>
                  <WhatsAppIcon className={styles.btnIcon} /> WhatsApp Me
                </a>
                <a href="/linkedin" target="_blank" rel="noopener noreferrer" className={styles.founderLinkBtn}>LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.awards} id="awards">
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Recognition</p>
          <h2 className={styles.sectionTitle}>2026 World Food Innovation Awards Finalist</h2>
          <div className={styles.awardsRow}>
            <div className={styles.awardCard}>
              <img src="/awards/wfia-drink-innovation.webp" alt="World Food Innovation Awards 2026 Finalist — Drink Innovation" />
            </div>
            <div className={styles.awardCard}>
              <img src="/awards/wfia-health-innovation.webp" alt="World Food Innovation Awards 2026 Finalist — Health Innovation" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.orderSection} id="order">
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Get Yours</p>
          <h2 className={styles.sectionTitle}>Buy ESPRESSGO on Shopee</h2>
          <div className={styles.soldOutBlock}>
            <a href="/shopee" target="_blank" rel="noopener noreferrer" className={styles.ctaBtnDark}>
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

      <section className={styles.availability}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Where To Find Us</p>
          <h2 className={styles.sectionTitle}>Also available at</h2>
          <div className={styles.availabilityGrid}>
            <div className={styles.availabilityCol}>
              <p className={styles.availabilityColLabel}>In Person</p>
              {LOCATIONS.map((loc) => (
                <div className={styles.availabilityRow} key={loc.name}>
                  <span>{loc.name}</span>
                  <a href={loc.mapsUrl} target="_blank" rel="noopener noreferrer">Get Directions</a>
                </div>
              ))}
            </div>
            <div className={styles.availabilityCol}>
              <p className={styles.availabilityColLabel}>Online</p>
              <div className={styles.availabilityRow}>
                <span>Shopee</span>
                <a href="/shopee" target="_blank" rel="noopener noreferrer">Visit Store</a>
              </div>
              <div className={styles.availabilityRow}>
                <span>TikTok</span>
                <a href="/tiktok" target="_blank" rel="noopener noreferrer">Visit Page</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.wholesale}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionLabel}>Bulk & Wholesale</p>
          <h2 className={styles.sectionTitle}>Stocking a cafe, office, or event?</h2>
          <p className={styles.body}>ESPRESSGO is available for wholesale enquiries. Get in touch and we'll sort out pricing and quantities.</p>
          <div className={styles.founderLinks}>
            <a href="mailto:damienteo@espressgo.sg" className={styles.founderLinkBtn}>Email Us</a>
            <a href="/whatsapp" target="_blank" rel="noopener noreferrer" className={styles.founderLinkBtn}>
              <WhatsAppIcon className={styles.btnIcon} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <WordmarkSVG cls={styles.footerWordmark} />
        <p className={styles.footerText}>ESPRESSGO Pte. Ltd. · Singapore</p>
        <div className={styles.footerLinks}>
          <FollowUs className={styles.footerFollowUs} />
          <button className={styles.adminLink} onClick={onAdminNav}>Admin</button>
        </div>
      </footer>
    </div>
  )
}