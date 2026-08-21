import { useState } from "react";
import styles from "./ProductCarousel.module.css";

const IMAGES = [
  { src: "/product/box-open.webp", alt: "Open ESPRESSGO box with sachets on a desk" },
  { src: "/product/on-the-go.webp", alt: "Slipping an ESPRESSGO sachet into a bag on the go" },
  { src: "/product/desk.webp", alt: "ESPRESSGO box and sachet on a desk with coffee" },
  { src: "/product/sachet-jelly.webp", alt: "ESPRESSGO sachet with coffee jelly, beans, and a spoon" },
];

export default function ProductCarousel() {
  const [active, setActive] = useState(0);
  const count = IMAGES.length;

  const goTo = (i) => setActive(((i % count) + count) % count);

  return (
    <div className={styles.carousel}>
      <div className={styles.stage}>
        {IMAGES.map((img, i) => {
          const offset = (i - active + count) % count;
          const isActive = offset === 0;
          const side = offset % 2 === 1 ? 1 : -1;
          const rank = Math.ceil(offset / 2);
          const style = isActive
            ? { zIndex: count, transform: "translateX(0) rotate(0deg) scale(1)" }
            : {
                zIndex: count - offset,
                transform: `translateX(${side * rank * 15}%) rotate(${side * rank * 9}deg) scale(${1 - rank * 0.07})`,
                opacity: rank > 2 ? 0 : 1,
              };
          return (
            <button
              key={img.src}
              type="button"
              className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
              style={style}
              onClick={() => goTo(i)}
              tabIndex={isActive ? -1 : 0}
              aria-label={isActive ? undefined : `Show image ${i + 1} of ${count}`}
              aria-hidden={isActive ? undefined : rank > 2}
            >
              <img src={img.src} alt={img.alt} draggable="false" />
            </button>
          );
        })}
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.arrowBtn} onClick={() => goTo(active - 1)} aria-label="Previous image">
          ‹
        </button>
        <div className={styles.dots} role="tablist" aria-label="Product images">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
        <button type="button" className={styles.arrowBtn} onClick={() => goTo(active + 1)} aria-label="Next image">
          ›
        </button>
      </div>
    </div>
  );
}
