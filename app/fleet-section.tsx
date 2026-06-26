"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { translations } from "./translations";

type FleetCategory = { id: string; label: string };

type Spec = { label: string; icon: string };

type FleetItem = {
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
    default: { prefix: "fas", icon: "fa-check-circle" }
  };

  function FontAwesomeIcon({ type, className = "fa-fw" }: { type: string; className?: string }) {
    const icon = fontAwesomeIcons[type] ?? fontAwesomeIcons.default;

    return <i className={["fa-icon", icon.prefix, icon.icon, className].filter(Boolean).join(" ")} aria-hidden="true" />;
  }

  export default function FleetSection({ lang = "vi" }: { lang?: string }) {
    const t = translations[lang] ?? translations.vi;
    const fleetCategories: FleetCategory[] = t.fleet?.categories ?? [];
    const fleetItems: FleetItem[] = t.fleet?.items ?? [];

    const [active, setActive] = useState<string>(fleetCategories[0]?.id ?? "all");

    const filteredItems = active === "all" ? fleetItems : fleetItems.filter((item) => item.categoryId === active);

    if (process.env.NODE_ENV === "development") {
      console.debug("[FleetSection] active state:", {
        active,
        totalItems: fleetItems.length,
        filteredCount: filteredItems.length,
        filteredCategories: Array.from(new Set(filteredItems.map((i) => i.category)))
      });
    }

    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      let paused = false;

      const interval = window.setInterval(() => {
        if (paused) return;
        const maxScrollLeft = el.scrollWidth - el.clientWidth;
        // nếu đã tới cuối thì quay về đầu, ngược lại cuộn sang phải một trang
        if (el.scrollLeft >= maxScrollLeft - 1) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: el.clientWidth, behavior: "smooth" });
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
    }, [active, filteredItems.length]);

    return (
      <section className="fleet-section" id="fleet">
        <div className="section-shell">
          <div className="fleet-section__header">
            <div className="fleet-section__intro">
              <span className="section-kicker">{t.fleet?.kicker}</span>
              <p>{t.fleet?.intro}</p>
            </div>

            <div className="fleet-section__filters" role="tablist" aria-label={t.fleet?.filtersAriaLabel}>
              {fleetCategories.map((category) => (
                <button
                  key={category.id}
                  role="tab"
                  type="button"
                  className={category.id === active ? "is-active" : undefined}
                  aria-selected={category.id === active}
                  onClick={() => setActive(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

            {( ["all", "4-7", "16", "29", "45"].includes(active) ) ? (
            <div className="fleet-scroll" aria-live="polite" ref={scrollRef}>
              {filteredItems.length === 0 ? (
                <div className="fleet-empty">{t.fleet?.empty}</div>
              ) : (
                filteredItems.map((item) => (
                  <article className="fleet-card" key={item.name}>
                    <div className="fleet-card__media">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 900px) 100vw, 50vw"
                        style={{ objectFit: "contain", objectPosition: "center center" }}
                      />
                    </div>

                    <div className="fleet-card__content">
                      <div className="fleet-card__headline">
                        <h3>{item.name}</h3>
                        <span>{item.badge}</span>
                      </div>

                      <div className="fleet-card__specs">
                          <small>{t.fleet?.priceFromLabel}</small>
                      </div>

                      <div className="fleet-card__footer">
                        <div className="fleet-card__price">
                          <strong>{item.price}</strong>
                        </div>

                        <a className="fleet-card__cta" href="#contact-cta-heading">
                          {t.fleet?.bookCta}
                        </a>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          ) : (
            <div className="fleet-grid" aria-live="polite">
              {filteredItems.length === 0 ? (
                <div className="fleet-empty">{t.fleet?.empty}</div>
              ) : (
                filteredItems.map((item) => (
                  <article className="fleet-card" key={item.name}>
                    <div className="fleet-card__media">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 900px) 100vw, 50vw"
                        style={{ objectFit: "contain", objectPosition: "center center" }}
                      />
                    </div>

                    <div className="fleet-card__content">
                      <div className="fleet-card__headline">
                        <h3>{item.name}</h3>
                        <span>{item.badge}</span>
                      </div>

                      <div className="fleet-card__specs">
                        {item.specs && item.specs.length
                          ? item.specs.map((spec) => spec.label).join(" • ")
                          : null}
                      </div>

                      <div className="fleet-card__footer">
                        <div className="fleet-card__price">
                            <small>{t.fleet?.priceFromLabel}</small>
                            <strong>{item.price}</strong>
                          </div>

                          <a className="fleet-card__cta" href="#contact-cta-heading">
                            {t.fleet?.bookCta}
                          </a>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    );
  }
