"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { SiteHeader } from "./site-header";
import FleetSection from "./fleet-section";
import FloatingContactWidget from "./FloatingContactWidget";
import { translations } from "./translations";

type FontAwesomePrefix = "fas" | "fab";

const fontAwesomeIcons: Record<string, { prefix: FontAwesomePrefix; icon: string }> = {
  fleet: { prefix: "fas", icon: "fa-bus" },
  car: { prefix: "fas", icon: "fa-car" },
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

const testimonials = [
  { initials: "T" },
  { initials: "H" },
  { initials: "N" }
];

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", handleChange);
    else mq.addListener(handleChange as any);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handleChange);
      else mq.removeListener(handleChange as any);
    };
  }, [query]);
  return matches;
}

export default function HomePage() {
  const [lang, setLang] = useState<"vi" | "en">(() => {
    if (typeof window === "undefined") return "vi";
    return (localStorage.getItem("site_lang") as "vi" | "en") ?? "vi";
  });

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
      localStorage.setItem("site_lang", lang);
    } catch (e) {
      // noop
    }
  }, [lang]);

  const t = (translations as any)[lang] ?? translations.vi;
  const toggleLang = () => setLang((l) => (l === "vi" ? "en" : "vi"));
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => setShowScrollTop(window.scrollY > 320);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isTablet = useMediaQuery("(max-width: 1200px)");

  const heroBannerSlides = [
    { desktopSrc: "/images/banner.png", mobileSrc: "/images/banner.png", alt: "Banner dịch vụ 1" },
    { desktopSrc: "/images/banner+.png", mobileSrc: "/images/banner+.png", alt: "Banner dịch vụ 2" },
  ];

  const [bannerIndex, setBannerIndex] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => {
      setBannerIndex((current) => (current + 1) % heroBannerSlides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="page-shell" id="top">
      <SiteHeader links={t.header.links} lang={lang} onToggleLang={toggleLang} />
          <section className="hero-section hero-banner" id="services">
            <div className="hero-banner__slider">
              {heroBannerSlides.map((banner, index) => (
                <div
                  key={banner.desktopSrc}
                  className={`hero-banner__slide${index === bannerIndex ? " is-active" : ""}`}
                >
                  <div className="hero-banner__image">
                    <Image
                      src={isTablet ? banner.mobileSrc : banner.desktopSrc}
                      alt={banner.alt}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="hero-banner__img"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Fleet section moved up: place directly under hero kicker as requested */}
          <FleetSection lang={lang} />

          {/* Lý do khách hàng quay lại */}
          <section className="reasons-section" id="reasons">
            <div className="section-shell">
              <div className="reasons-section__header">
                <span className="section-kicker">{t.reasons.kicker}</span>
                <h2>{t.reasons.heading}</h2>
                <p className="reasons-section__lead">{t.reasons.lead}</p>
              </div>

              <div className="reasons-section__inner">
                <div className="reasons-section__visual">
                  <div className="visual-card">
                    <div className="visual-card__image">
                      <Image
                        src="/images/logo3D.png"
                        alt={t.hero.imageAlt}
                        fill
                        priority
                        sizes="(max-width: 900px) 100vw, 48vw"
                      />
                    </div>
                  </div>
                </div> 
            
                <div className="reasons-section__copy">
                  <div className="reasons-list">
                    {t.reasons.items.map((reason: any) => (
                      <article className="reason-card" key={reason.title}>
                        <div className="reason-card__icon">
                          <FontAwesomeIcon type={reason.icon} />
                        </div>
                        <div className="reason-card__body">
                          <h3>{reason.title}</h3>
                          <p>{reason.description}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quy trình đặt xe */}
          <section className="process-section">
            <div className="section-shell">
              <div className="process-section__heading">
                <span className="section-kicker">{t.booking.kicker}</span>
                <h2>{t.booking.heading}</h2>
                <p>{t.booking.lead}</p>
              </div>
              <div className="process-grid">
                {t.booking.steps.map((step: any) => (
                  <article className="process-card" key={step.title}>
                    <div className="process-card__icon">
                      <FontAwesomeIcon type={step.icon} />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Bảng giá */}
          <section className="pricing-section" id="pricing">
            <div className="section-shell">
              <div className="pricing-section__heading">
                <span className="section-kicker">{t.pricing.kicker}</span>
                <h2>{t.pricing.heading}</h2>
                <p>{t.pricing.lead}</p>
              </div>
              <div className="pricing-table-wrap">
                {!isMobile ? (
                  <table className="pricing-table">
                    <thead>
                      <tr>
                        {t.pricing.table.cols.map((c: string, idx: number) => (
                          <th scope="col" key={idx}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.pricing.rows.map((row: any) => {
                        const seatsMatch = String(row.vehicle).match(/(\d+)/);
                        const seats = seatsMatch ? Number(seatsMatch[1]) : 0;
                        const iconType = seats > 7 ? "fleet" : "car";
                        return (
                          <tr key={row.vehicle}>
                            <th scope="row">
                              <div className="pricing-left">
                                <div className="pricing-avatar" aria-hidden="true" />
                                <span className="pricing-vehicle">
                                  <FontAwesomeIcon type={iconType} />
                                  <span className="pricing-vehicle__label">{row.vehicle}</span>
                                </span>
                              </div>
                            </th>
                            <td data-label={t.pricing.table.cols[1]}>{row.cityTour}</td>
                            <td data-label={t.pricing.table.cols[2]}>{row.provinceTrip}</td>
                            <td data-label={t.pricing.table.cols[3]}>{row.airport}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="pricing-cards" role="list">
                    {t.pricing.rows.map((row: any) => {
                      const seatsMatch = String(row.vehicle).match(/(\d+)/);
                      const seats = seatsMatch ? Number(seatsMatch[1]) : 0;
                      const iconType = seats > 7 ? "fleet" : "car";
                      return (
                        <article className="pricing-card" role="listitem" key={row.vehicle}>
                          <div className="card-header">
                            <div className="vehicle">
                              <div className="pricing-avatar" aria-hidden="true" />
                              <span className="pricing-vehicle">
                                <FontAwesomeIcon type={iconType} />
                                <span className="pricing-vehicle__label">{row.vehicle}</span>
                              </span>
                            </div>
                            <div className="airport-price">{row.airport}</div>
                          </div>
                          <div className="price-row">
                            <div className="label">{t.pricing.table.cols[1]}</div>
                            <div className="value">{row.cityTour}</div>
                          </div>
                          <div className="price-row">
                            <div className="label">{t.pricing.table.cols[2]}</div>
                            <div className="value">{row.provinceTrip}</div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="pricing-section__note">{t.pricing.note}</p>
            </div>
          </section>

          {/* Sales / Liên hệ */}
          <section className="addons-section" id="sales">
            <div className="section-shell">
              <div className="addons-section__heading">
                <span className="section-kicker">{t.sales.kicker}</span>
                <h2>{t.sales.heading}</h2>
                <p>{t.sales.lead}</p>
              </div>

              <div className="addons-grid addons-grid--two">
                <article className="addon-card">
                  <div className="addon-card__icon">
                    <FontAwesomeIcon type="phone" />
                  </div>
                  <span className="addon-card__label">{t.sales.hotlineLabel}</span>
                  <h3>{t.sales.hotlineTitle}</h3>
                  <div className="contact-list"></div>
                    {t.sales.hotlines?.length > 0 && (
                      <div className="addon-card__sale-phones" aria-label="Hotlines">
                        {t.sales.hotlines.map((h: any) => (
                          <div className="addon-card__sale-phone" key={h.number} aria-label={`Hotline ${h.name}`}>
                            <a href={`tel:${h.number.replace(/\s+/g, "")}`}>
                              <span className="addon-card__sale-phone-icon"><FontAwesomeIcon type="phone" /></span>
                              <span className="addon-card__sale-phone-info">
                                <span className="addon-card__sale-phone-name">{h.name}</span>
                                <span className="addon-card__sale-phone-number">{h.number}</span>
                              </span>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                </article>

                <article className="addon-card">
                  <div className="addon-card__icon">
                    <FontAwesomeIcon type="chat" />
                  </div>
                  <span className="addon-card__label">{t.sales.zaloLabel}</span>
                  <h3>{t.sales.zaloTitle}</h3>
                  <div className="contact-list"></div>
                  {t.sales.zaloContacts?.length > 0 && (
                    <div className="addon-card__zalo-phones" aria-label="Zalo contacts">
                      {t.sales.zaloContacts.map((z: any) => (
                        <div className="addon-card__zalo" key={z.id} aria-label={`Zalo ${z.name}`}>
                          <a href={`https://zalo.me/${z.id}`} target="_blank" rel="noreferrer">
                            <span className="addon-card__zalo-icon"><FontAwesomeIcon type="chat" /></span>
                            <span className="addon-card__zalo-info">
                              <span className="addon-card__zalo-name">{z.name}</span>
                              <span className="addon-card__zalo-action">{t.sales.zaloAction}</span>
                            </span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              </div>
            </div>
          </section>

          {/* Đánh giá */}
          <section className="testimonials-section" aria-labelledby="testimonials-heading">
            <div className="section-shell testimonials-section__inner">
              <div className="testimonials-section__heading">
                <span className="section-kicker">{t.testimonials.kicker}</span>
                <h2 id="testimonials-heading">{t.testimonials.heading}</h2>
                <p>{t.testimonials.lead}</p>
              </div>

              <div className="testimonials-layout">
                <article className="testimonial-spotlight">
                  <div className="testimonial-spotlight__glow" aria-hidden="true" />
                  <div className="testimonial-spotlight__topline">
                    <span>{t.testimonials.items[0].badge}</span>
                    <span>{t.testimonials.items[0].tag}</span>
                  </div>
                  <blockquote>{t.testimonials.items[0].quote}</blockquote>
                  <div className="testimonial-spotlight__footer">
                    <div className="testimonial-person">
                      <div className="testimonial-person__avatar" aria-hidden="true">
                        <span>{testimonials[0].initials}</span>
                      </div>
                      <div className="testimonial-person__copy">
                        <strong>{t.testimonials.items[0].name}</strong>
                        <p>{t.testimonials.items[0].role}</p>
                      </div>
                    </div>
                    <div className="testimonial-spotlight__score">
                      <strong>5.0</strong>
                      <span>{t.testimonials.scoreLabel}</span>
                    </div>
                  </div>
                </article>

                <div className="testimonials-side">
                  <div className="testimonial-stats">
                    {t.testimonials.stats.map((item: any) => (
                      <article className="testimonial-stat" key={item.value}>
                        <strong>{item.value}</strong>
                        <p>{item.label}</p>
                      </article>
                    ))}
                  </div>
                  <div className="testimonial-list" aria-label="Phản hồi khác từ khách hàng">
                    {t.testimonials.items.slice(1).map((item: any, idx: number) => (
                      <article className="testimonial-mini" key={item.name}>
                        <div className="testimonial-mini__meta">
                          <span>{item.badge}</span>
                          <span>{item.tag}</span>
                        </div>
                        <p>{item.quote}</p>
                        <strong>{item.name}</strong>
                        <small>{item.role}</small>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="faq-section" aria-labelledby="faq-heading">
            <div className="section-shell faq-section__inner">
              <div className="faq-section__heading">
                <span className="section-kicker">{t.faq.kicker}</span>
                <h2 id="faq-heading">{t.faq.heading}</h2>
                <p>{t.faq.lead}</p>
              </div>
              <div className="faq-list">
                {t.faq.items.map((item: any) => (
                  <details className="faq-item" key={item.question}>
                    <summary className="faq-item__summary">
                      <span>{item.question}</span>
                      <span className="faq-item__icon" aria-hidden="true">
                        <FontAwesomeIcon type="faq" />
                      </span>
                    </summary>
                    <div className="faq-item__answer">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA liên hệ */}
          <section className="contact-cta-section" aria-labelledby="contact-cta-heading">
            <div className="section-shell contact-cta-section__inner">
              <span className="section-kicker section-kicker--light">{t.contactCta.kicker}</span>
              <h2 id="contact-cta-heading">{t.contactCta.heading}</h2>
              <p>{t.contactCta.lead}</p>
              <div className="contact-cta-section__actions">
                <a className="contact-cta-button contact-cta-button--solid" href="tel:0962992555">
                  <FontAwesomeIcon type="phone" />
                  <span>{t.contactCta.call}</span>
                </a>
                <a className="contact-cta-button contact-cta-button--outline" href="https://zalo.me/0962992555">
                  <FontAwesomeIcon type="chat" />
                  <span>{t.contactCta.chat}</span>
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="site-footer" id="contact">
            <div className="section-shell site-footer__inner">
              <div className="site-footer__logo-top">
                <a href="#top" aria-label={t.header.brand}>
                  <Image
                    className="site-footer__brand-logo"
                    src="/images/logoKhanhLinhFull.png"
                    alt={t.header.brand}
                    width={480}
                    height={144}
                    priority
                  />
                </a>
              </div>

              <div className="site-footer__grid">
                <div className="site-footer__brand-block">
                  <p className="site-footer__description">{t.footer.brandDescription}</p>
                  <div className="site-footer__social" aria-label="Brand channels">
                  </div>
                </div>

                <div className="site-footer__column">
                  <h2 className="site-footer__heading">{t.footer.servicesHeading}</h2>
                  <nav className="site-footer__nav" aria-label="Dịch vụ footer">
                    {t.footer.services.map((item: any) => (
                      <a key={item.label} href={item.href}>{item.label}</a>
                    ))}
                  </nav>
                </div>

                <div className="site-footer__column">
                  <h2 className="site-footer__heading">{t.footer.supportHeading}</h2>
                  <nav className="site-footer__nav" aria-label="Hỗ trợ footer">
                    {t.footer.supportLinks.map((item: any) => (
                      <a key={item.label} href={item.href}>{item.label}</a>
                    ))}
                  </nav>
                </div>

                <div className="site-footer__column">
                  <h2 className="site-footer__heading">{t.footer.contactHeading}</h2>
                  <div className="site-footer__contact-list">
                    <div className="site-footer__contact-item">
                      <span className="site-footer__contact-icon"><FontAwesomeIcon type="location" /></span>
                      <span>{t.footer.contactList.address}</span>
                    </div>
                    <div className="site-footer__contact-item">
                      <span className="site-footer__contact-icon"><FontAwesomeIcon type="phone" /></span>
                      <a href={`tel:${t.footer.contactList.phone.replace(/\s+/g, "")}`}>{t.footer.contactList.phone}</a>
                    </div>
                    <div className="site-footer__contact-item">
                      <span className="site-footer__contact-icon"><FontAwesomeIcon type="mail" /></span>
                      <a href={`mailto:${t.footer.contactList.email}`}>{t.footer.contactList.email}</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="site-footer__bottom">
                <p>{t.footer.copyright}</p>
              </div>
            </div>
      </footer>
      <FloatingContactWidget />
      <button
        type="button"
        className={showScrollTop ? "scroll-top-button is-visible" : "scroll-top-button"}
        onClick={scrollToTop}
        aria-label="Lên đầu trang"
      >
        <img src="/icon/muiTen.png" alt="" />
      </button>
    </main>
            
  );
}
