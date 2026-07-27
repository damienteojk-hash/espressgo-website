import { useState } from "react";
import PickupDatePicker from "./PickupDatePicker";

const SHOPEE_URL = "https://shopee.sg/product/1885673461/47463818262/";

const BUNDLES = [
  { id: "single", label: "Single Sachet", price: "$3.90" },
  { id: "pack-5", label: "Pack of 5", price: "$18.90" },
  { id: "box-12", label: "Box of 12", price: "$44.90" },
];

export default function FulfillmentSelector({ onPickupCheckout }) {
  const [mode, setMode] = useState(null); // null | 'pickup' | 'delivery'
  const [bundle, setBundle] = useState("pack-5");
  const [pickupDate, setPickupDate] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDeliveryClick = () => {
    window.location.href = SHOPEE_URL;
  };

  const canSubmit = pickupDate && name && email && phone && !submitting;

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onPickupCheckout({ bundle, pickupDate, name, email, phone });
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
          <div className="bundle-row" role="radiogroup" aria-label="Choose bundle size">
            {BUNDLES.map((b) => (
              <button
                type="button"
                key={b.id}
                className={`bundle-option ${bundle === b.id ? "is-selected" : ""}`}
                aria-pressed={bundle === b.id}
                onClick={() => setBundle(b.id)}
              >
                <span className="bundle-label">{b.label}</span>
                <span className="bundle-price">{b.price}</span>
              </button>
            ))}
          </div>

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