import { useMemo } from "react";

/**
 * PickupDatePicker
 * Generates selectable weekday pickup slots starting 2 business days
 * from now, skipping weekends and any dates in BLACKOUT_DATES.
 *
 * Edit BLACKOUT_DATES to block specific days (holidays, NS-related
 * unavailability, etc.) without touching the logic below.
 */

// Add ISO dates (YYYY-MM-DD) here to block them from being selectable.
const BLACKOUT_DATES = [
  // "2026-08-09", // e.g. National Day
];

// How many pickup slots to show at once.
const SLOTS_TO_SHOW = 6;

// Minimum lead time in calendar days before the earliest pickup date.
const MIN_LEAD_DAYS = 2;

function isWeekday(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6; // exclude Sun (0) and Sat (6)
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(date) {
  return date.toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function generateSlots() {
  const slots = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + MIN_LEAD_DAYS);

  // Walk forward day by day until we have enough valid weekday slots.
  let guard = 0;
  while (slots.length < SLOTS_TO_SHOW && guard < 60) {
    const candidate = new Date(cursor);
    const iso = toISODate(candidate);
    if (isWeekday(candidate) && !BLACKOUT_DATES.includes(iso)) {
      slots.push({ iso, label: formatDisplayDate(candidate) });
    }
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  return slots;
}

export default function PickupDatePicker({ value, onChange }) {
  const slots = useMemo(() => generateSlots(), []);

  return (
    <div className="pickup-date-picker">
      <p className="pickup-instructions">
        Choose a weekday to collect your order at MakersNode, NYP. Orders need
        at least {MIN_LEAD_DAYS} days to prepare.
      </p>
      <div className="pickup-slot-grid" role="radiogroup" aria-label="Pickup date">
        {slots.map((slot) => (
          <button
            key={slot.iso}
            type="button"
            className={`pickup-slot ${value === slot.iso ? "is-selected" : ""}`}
            aria-pressed={value === slot.iso}
            onClick={() => onChange(slot.iso)}
          >
            {slot.label}
          </button>
        ))}
      </div>
    </div>
  );
}