"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { translations } from "./translations";

type Spec = { label: string; icon: string };

type FleetItem = {
  id: string;
  categoryId: string;
  category?: string;
  name: string;
  badge: string;
  description: string;
  price: string;
  image: string;
  specs: Spec[];
};

type FontAwesomePrefix = "fas" | "fab";

const fontAwesomeIcons: Record<string, { prefix: FontAwesomePrefix; icon: string }> = {
  fleet: { prefix: "fas", icon: "fa-bus" },
  driver: { prefix: "fas", icon: "fa-user-tie" },
  pricing: { prefix: "fas", icon: "fa-money-bill-wave" },
  support: { prefix: "fas", icon: "fa-headset" },
  seat: { prefix: "fas", icon: "fa-chair" },
  comfort: { prefix: "fas", icon: "fa-snowflake" },
  storage: { prefix: "fas", icon: "fa-suitcase" },
  choose: { prefix: "fas", icon: "fa-bus" },
  quote: { prefix: "fas", icon: "fa-comments" },
  contract: { prefix: "fas", icon: "fa-file-signature" },
  departure: { prefix: "fas", icon: "fa-route" },
  wedding: { prefix: "fas", icon: "fa-glass-cheers" },
  guide: { prefix: "fas", icon: "fa-map-marked-alt" },
  insurance: { prefix: "fas", icon: "fa-shield-alt" },
  chauffeur: { prefix: "fas", icon: "fa-car-side" },
  location: { prefix: "fas", icon: "fa-map-marker-alt" },
  phone: { prefix: "fas", icon: "fa-phone-alt" },
  mail: { prefix: "fas", icon: "fa-envelope" },
  chat: { prefix: "fas", icon: "fa-comments" },
  faq: { prefix: "fas", icon: "fa-chevron-down" },
  close: { prefix: "fas", icon: "fa-times" },
  tripadvisor: { prefix: "fas", icon: "fa-compass" },
  youtube: { prefix: "fab", icon: "fa-youtube" },
  favorite: { prefix: "fas", icon: "fa-heart" },
  bag: { prefix: "fas", icon: "fa-shopping-bag" },
  default: { prefix: "fas", icon: "fa-check-circle" }
};

function FontAwesomeIcon({ type, className = "fa-fw" }: { type: string; className?: string }) {
  const icon = fontAwesomeIcons[type] ?? fontAwesomeIcons.default;
  return <i className={["fa-icon", icon.prefix, icon.icon, className].filter(Boolean).join(" ")} aria-hidden="true" />;
}

export default function FleetSection({ lang = "vi" }: { lang?: string }) {
  const t = translations[lang] ?? translations.vi;
  const [items, setItems] = useState<FleetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/vehicles?lang=${encodeURIComponent(lang)}`)
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [lang]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || items.length === 0) return;

    let paused = false;
    const cardWidth = 260; // fleet card width
    const gap = 28; // fleet scroll gap
    const cardAndGap = cardWidth + gap;

    const interval = window.setInterval(() => {
      if (paused) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScrollLeft - 1) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardAndGap, behavior: "smooth" });
      }
    }, 2000);

    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      window.clearInterval(interval);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [items.length]);

  return (
    <section className="fleet-section" id="fleet">
      <div className="section-shell">
        <div className="fleet-section__header">
          <div className="fleet-section__intro title-luxury">
            <h2>{t.fleet?.heading}</h2>
            <p>{t.fleet?.intro}</p>
          </div>
        </div>

        <div className="fleet-scroll" aria-live="polite" ref={scrollRef}>
          {loading ? (
            <div className="fleet-empty">{t.fleet?.loading}</div>
          ) : items.length === 0 ? (
            <div className="fleet-empty">{t.fleet?.empty}</div>
          ) : (
            items.map((item) => (
              <article className="fleet-card" key={item.id}>
                <div className="fleet-card__media">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    style={{ objectFit: "contain", objectPosition: "center center" }}
                  />
                  <span className="fleet-card__subtitle">{item.badge}</span>
                </div>

                <div className="fleet-card__content">
                  <h3>{item.name}</h3>
                  <div className="fleet-card__price">
                    {item.price}
                  </div>
                  <a className="fleet-card__cta" href="#contact-cta-heading" aria-label={`${t.fleet?.bookCta} ${item.name}`}>
                    {t.fleet?.bookCta}
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
