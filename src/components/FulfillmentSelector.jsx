import { useMemo, useState } from "react";
import PickupDatePicker from "./PickupDatePicker";

const SHOPEE_URL = "https://shopee.sg/product/1885673461/47463818262/";

const MAX_QTY_PER_BUNDLE = 20;

const BUNDLES = [
  { id: "single", label: "Single Sachet", price: 3.9, sachets: 1 },
  { id: "pack-2", label: "Pack of 2", price: 7.5, sachets: 2 },
  { id: "pack-5", label: "Pack of 5", price: 18.9, sachets: 5 },
  { id: "box-12", label: "Box of 12", price: 44.9, sachets: 12 },
];

export default function FulfillmentSelector({ onPickupCheckout }) {
  const [mode, setMode] = useState(null); // null | 'pickup' | 'delivery'
  const [quantities, setQuantities] = useState({ "pack-5": 1 });
  const [pickupDate, setPickupDate] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDeliveryClick = () => {
    window.location.href = SHOPEE_URL;
  };

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

  const totalPrice = useMemo(
    () =>
      BUNDLES.reduce(
        (sum, b) => sum + b.price * (quantities[b.id] || 0),
        0
      ),
    [quantities]
  );

  const totalSachets = useMemo(
    () =>
      BUNDLES.reduce(
        (sum, b) => sum + b.sachets * (quantities[b.id] || 0),
        0
      ),
    [quantities]
  );

  const canSubmit =
    cart.length > 0 && pickupDate && name && email && phone && !submitting;

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onPickupCheckout({ cart, pickupDate, name, email, phone });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fulfillment-selector">
      <div className="fulfillment-options" role="radiogroup" aria-label="Choose how to receive your order">
        <button
          type="button"
          className={`fulfillment-option ${mode === "pickup" ? "is-selected" : ""}`}
          onClick={() => setMode("pickup")}
          aria-pressed={mode === "pickup"}
        >
          <span className="option-title">Order for Pickup — Free</span>
          <span className="option-subtitle">
            Collect in person at <strong>NYP MakersNode Marketplace</strong>
          </span>
          <span className="option-hint">Too far? Use Delivery instead →</span>
        </button>

        <button
          type="button"
          className={`fulfillment-option ${mode === "delivery" ? "is-selected" : ""}`}
          onClick={() => setMode("delivery")}
          aria-pressed={mode === "delivery"}
        >
          <span className="option-title">Order for Delivery</span>
          <span className="option-subtitle">Shipped to your address via Shopee</span>
        </button>
      </div>

      {mode === "pickup" && (
        <form className="pickup-panel" onSubmit={handlePickupSubmit}>
          <div className="bundle-list" role="group" aria-label="Choose bundles and quantities">
            {BUNDLES.map((b) => {
              const qty = quantities[b.id] || 0;
              return (
                <div className={`bundle-row-item ${qty > 0 ? "is-active" : ""}`} key={b.id}>
                  <div className="bundle-row-info">
                    <span className="bundle-row-label">{b.label}</span>
                    <span className="bundle-row-price">${b.price.toFixed(2)}</span>
                  </div>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setQty(b.id, qty - 1)}
                      disabled={qty === 0}
                      aria-label={`Decrease ${b.label} quantity`}
                    >
                      −
                    </button>
                    <span className="qty-value">{qty}</span>
                    <button
                      type="button"
                      className="qty-btn"
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
            <div className="cart-total">
              <span>Total ({totalSachets} sachet{totalSachets !== 1 ? "s" : ""})</span>
              <span className="cart-total-price">${totalPrice.toFixed(2)}</span>
            </div>
          )}

          <PickupDatePicker value={pickupDate} onChange={setPickupDate} />

          <div className="contact-fields">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <p className="phone-note">We'll WhatsApp you order updates on this number.</p>
          </div>

          <button type="submit" className="pickup-confirm-btn" disabled={!canSubmit}>
            {submitting ? "Redirecting to payment…" : "Continue to payment"}
          </button>
        </form>
      )}

      {mode === "delivery" && (
        <div className="delivery-panel">
          <p className="delivery-note">
            Delivery orders are fulfilled through our Shopee store, where you can also
            track your shipment.
          </p>
          <button type="button" className="delivery-confirm-btn" onClick={handleDeliveryClick}>
            Continue on Shopee
          </button>
        </div>
      )}
    </div>
  );
}