import { useMemo, useState } from "react";
import styles from "./DeliveryOrderForm.module.css";

const MAX_QTY_PER_BUNDLE = 20;
const DELIVERY_FEE = 3.9;

const BUNDLES = [
  { id: "pack-5", label: "Pack of 5", price: 18.9, sachets: 5 },
  { id: "box-12", label: "Box of 12", price: 44.9, sachets: 12 },
];

const POSTAL_CODE_RE = /^\d{6}$/;

export default function DeliveryOrderForm({ onDeliveryCheckout }) {
  const [quantities, setQuantities] = useState({ "pack-5": 1 });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setQty = (id, qty) => {
    const clamped = Math.max(0, Math.min(MAX_QTY_PER_BUNDLE, qty));
    setQuantities((prev) => ({ ...prev, [id]: clamped }));
  };

  const cart = useMemo(
    () =>
      BUNDLES.filter((b) => (quantities[b.id] || 0) > 0).map((b) => ({
        bundle: b.id,
        qty: quantities[b.id],
      })),
    [quantities]
  );

  const subtotal = useMemo(
    () => BUNDLES.reduce((sum, b) => sum + b.price * (quantities[b.id] || 0), 0),
    [quantities]
  );

  const total = subtotal > 0 ? subtotal + DELIVERY_FEE : 0;

  const canSubmit =
    cart.length > 0 &&
    name &&
    email &&
    phone &&
    addressLine &&
    POSTAL_CODE_RE.test(postalCode) &&
    !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onDeliveryCheckout({ cart, name, email, phone, addressLine, postalCode });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <div className={styles.bundleList} role="group" aria-label="Choose bundles and quantities">
        {BUNDLES.map((b) => {
          const qty = quantities[b.id] || 0;
          return (
            <div className={`${styles.bundleRow} ${qty > 0 ? styles.bundleRowActive : ""}`} key={b.id}>
              <div className={styles.bundleInfo}>
                <span className={styles.bundleLabel}>{b.label}</span>
                <span className={styles.bundlePrice}>${b.price.toFixed(2)}</span>
              </div>
              <div className={styles.stepper}>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setQty(b.id, qty - 1)}
                  disabled={qty === 0}
                  aria-label={`Decrease ${b.label} quantity`}
                >
                  −
                </button>
                <span className={styles.stepperValue}>{qty}</span>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setQty(b.id, qty + 1)}
                  disabled={qty >= MAX_QTY_PER_BUNDLE}
                  aria-label={`Increase ${b.label} quantity`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className={styles.totals}>
          <div className={styles.totalsRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className={styles.totalsRow}><span>Delivery</span><span>${DELIVERY_FEE.toFixed(2)}</span></div>
          <div className={`${styles.totalsRow} ${styles.totalsRowFinal}`}><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>
      )}

      <div className={styles.fields}>
        <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input type="text" placeholder="Delivery address (block/street, unit number)" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
        <input
          type="text"
          inputMode="numeric"
          placeholder="Postal code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
        />
        <p className={styles.hint}>Singapore delivery only. We'll email your tracking link once your order ships.</p>
      </div>

      <button type="submit" className={styles.confirmBtn} disabled={!canSubmit}>
        {submitting ? "Redirecting to payment…" : "Continue to payment"}
      </button>
    </form>
  );
}
