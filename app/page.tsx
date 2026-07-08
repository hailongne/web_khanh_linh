"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import db from "../db.json";
import { SiteHeader } from "./site-header";
import FleetSection from "./fleet-section";
import FloatingContactWidget from "./FloatingContactWidget";
import { translations } from "./translations";

type FontAwesomePrefix = "fas" | "fab";

type SalesPerson = {
  name: string;
  phone: string;
  zalo: string;
  avatar: string;
};

type ContactInfo = {
  phone: string;
  zalo: string;
  email: string;
  address: string;
};

type PricingRow = {
  vehicle: string;
  cityTour: string;
  provinceTrip: string;
  airport: string;
};

type PricingData = {
  heading: string;
  lead: string;
  note: string;
  cols: string[];
  rows: PricingRow[];
};

type TestimonialsItem = {
  quote: string;
  name: string;
  role: string;
  badge: string;
  tag: string;
  initials: string;
};

type TestimonialsStat = {
  value: string;
  label: string;
};

type TestimonialsData = {
  heading: string;
  lead: string;
  scoreLabel: string;
  items: TestimonialsItem[];
  stats: TestimonialsStat[];
};

type FaqItem = {
  question: string;
  answer: string;
};

type FaqData = {
  heading: string;
  lead: string;
  items: FaqItem[];
};

const salesContacts = (db as any).sales as SalesPerson[];
const siteContacts = (db as any).contacts as ContactInfo;
const dbPricing = (db as any).pricing as Record<string, PricingData>;
const dbTestimonials = (db as any).testimonials as Record<string, TestimonialsData>;
const dbFaq = (db as any).faq as Record<string, FaqData>;

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
  const [lang, setLang] = useState<"vi" | "en">("vi");

  useEffect(() => {
    try {
      // Read from localStorage after hydration
      const savedLang = (localStorage.getItem("site_lang") as "vi" | "en") ?? "vi";
      if (savedLang !== lang) {
        setLang(savedLang);
      }
      document.documentElement.lang = savedLang;
    } catch (e) {
      // noop
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
      localStorage.setItem("site_lang", lang);
    } catch (e) {
      // noop
    }
  }, [lang]);

  const t = (translations as any)[lang] ?? translations.vi;
  const defaultPricing: PricingData = dbPricing?.vi ?? { heading: "", lead: "", note: "", cols: [], rows: [] };
  const defaultTestimonialsData: TestimonialsData = dbTestimonials?.vi ?? { heading: "", lead: "", scoreLabel: "", items: [], stats: [] };
  const defaultFaqData: FaqData = dbFaq?.vi ?? { heading: "", lead: "", items: [] };

  const pricing: PricingData = dbPricing?.[lang] ?? defaultPricing;
  const testimonialsData: TestimonialsData = dbTestimonials?.[lang] ?? defaultTestimonialsData;
  const faqData: FaqData = dbFaq?.[lang] ?? defaultFaqData;
  const toggleLang = () => setLang((l) => (l === "vi" ? "en" : "vi"));
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const processGridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => setShowScrollTop(window.scrollY > 320);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewAvatar(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isTablet = useMediaQuery("(max-width: 1200px)");

  const heroBannerSlides = [
    { desktopSrc: "/images/banner.png", mobileSrc: "/images/banner.png", alt: "Banner dá»‹ch vá»¥ 1" },
    { desktopSrc: "/images/banner+.png", mobileSrc: "/images/banner+.png", alt: "Banner dá»‹ch vá»¥ 2" },
  ];

  const [bannerIndex, setBannerIndex] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => {
      setBannerIndex((current) => (current + 1) % heroBannerSlides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  // Auto-scroll process grid on mobile
  useEffect(() => {
    const el = processGridRef.current;
    if (!el || !isMobile) return;

    let paused = false;
    const cardWidth = 280; // process-card width on mobile
    const gap = 16; // process-grid gap on mobile
    const cardAndGap = cardWidth + gap;

    const interval = window.setInterval(() => {
      if (paused) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScrollLeft - 1) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardAndGap, behavior: "smooth" });
      }
    }, 2500);

    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      window.clearInterval(interval);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [isMobile]);

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

          <FleetSection lang={lang} />

          <section className="reasons-section" id="reasons">
            <div className="section-shell">
              <div className="reasons-section__header title-luxury">
                <h2>{t.reasons.heading}</h2>
                <p className="reasons-section__lead">{t.reasons.lead}</p>
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
          </section>

          {/* Quy trình đặt xe */}
          <section className="process-section">
            <div className="section-shell">
              <div className="process-section__heading title-luxury">
                <h2>{t.booking.heading}</h2>
                <p>{t.booking.lead}</p>
              </div>
              <div className="process-grid" ref={processGridRef}>
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
              <div className="pricing-section__heading title-luxury">
                <h2>{pricing.heading}</h2>
                <p>{pricing.lead}</p>
              </div>
              <div className="pricing-table-wrap">
                {!isMobile ? (
                  <table className="pricing-table">
                    <thead>
                      <tr>
                        {pricing.cols.map((c: string, idx: number) => (
                          <th scope="col" key={idx}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pricing.rows.map((row: any) => {
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
                            <td data-label={pricing.cols[1]}>{row.cityTour}</td>
                            <td data-label={pricing.cols[2]}>{row.provinceTrip}</td>
                            <td data-label={pricing.cols[3]}>{row.airport}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="pricing-cards" role="list">
                    {pricing.rows.map((row: any) => {
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
                            <div className="label">{pricing.cols[1]}</div>
                            <div className="value">{row.cityTour}</div>
                          </div>
                          <div className="price-row">
                            <div className="label">{pricing.cols[2]}</div>
                            <div className="value">{row.provinceTrip}</div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="pricing-section__note">{pricing.note}</p>
            </div>
          </section>

          {/* Sales / Liên hệ */}
          <section className="addons-section" id="sales">
            <div className="section-shell">
              <div className="addons-section__heading title-luxury">
                <h2>{t.sales.heading}</h2>
                <p>{t.sales.lead}</p>
              </div>

              <div className="addons-grid addons-grid--one">
                <article className="addon-card addon-card--sales">
                  {salesContacts.length > 0 && (
                    <div className="addon-card__sales-list" aria-label="Danh sách Sales">
                      {salesContacts.map((staff) => {
                        const normalizedPhone = staff.phone.replace(/\s+/g, "");
                        const zaloLink = staff.zalo?.startsWith("http")
                          ? staff.zalo
                          : `https://zalo.me/${staff.zalo.replace(/\s+/g, "")}`;

                        return (
                          <div className="addon-card__sales-item" key={`${staff.name}-${staff.phone}`}>
                            <div className="addon-card__sales-meta">
                              <button
                                type="button"
                                className="addon-card__sale-avatar-wrap addon-card__sale-avatar-button"
                                onClick={() => setPreviewAvatar(staff.avatar || "/images/avatar/no-avt.png")}
                                aria-label={`Xem áº£nh Ä‘áº¡i diá»‡n ${staff.name}`}
                              >
                                <Image
                                  src={staff.avatar || "/images/avatar/no-avt.png"}
                                  width={64}
                                  height={64}
                                  alt={`${staff.name} avatar`}
                                  className="addon-card__sale-avatar"
                                />
                              </button>
                              <div className="addon-card__sales-copy">
                                <span className="addon-card__sale-phone-name">{staff.name}</span>
                                <span className="addon-card__sale-phone-number">{staff.phone}</span>
                              </div>
                            </div>

                            <div className="addon-card__sales-actions">
                              <a
                                className="addon-card__sales-action addon-card__sales-action--call"
                                href={`tel:${normalizedPhone}`}
                                aria-label={`Liên hệ ${staff.name}`}
                              >
                                <FontAwesomeIcon type="phone" />
                                <span>{t.sales.hotlineTitle}</span>
                              </a>
                              <a
                                className="addon-card__sales-action addon-card__sales-action--zalo"
                                href={zaloLink}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Chat Zalo vá»›i ${staff.name}`}
                              >
                                <FontAwesomeIcon type="chat" />
                                <span>{t.sales.zaloAction}</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              </div>
            </div>
          </section>

          {previewAvatar && (
            <div className="avatar-preview-overlay" role="dialog" aria-modal="true" aria-label="Xem áº£nh Ä‘áº¡i diá»‡n">
              <button
                type="button"
                className="avatar-preview-overlay__close"
                onClick={() => setPreviewAvatar(null)}
                aria-label="ÄÃ³ng" 
              >
                <FontAwesomeIcon type="close" />
              </button>
              <div className="avatar-preview-overlay__backdrop" onClick={() => setPreviewAvatar(null)} />
              <div className="avatar-preview-overlay__panel">
                <Image
                  src={previewAvatar}
                  alt="áº¢nh Ä‘áº¡i diá»‡n Ä‘áº§y Ä‘á»§"
                  width={640}
                  height={640}
                  className="avatar-preview-overlay__image"
                  priority
                />
              </div>
            </div>
          )}

          <section className="testimonials-section" aria-labelledby="testimonials-heading">
            <div className="section-shell testimonials-section__inner">
              <div className="testimonials-section__heading title-luxury">
                <h2 id="testimonials-heading">{testimonialsData.heading}</h2>
                <p>{testimonialsData.lead}</p>
              </div>

              <div className="testimonials-layout">
                <article className="testimonial-spotlight">
                  <div className="testimonial-spotlight__glow" aria-hidden="true" />
                  <div className="testimonial-spotlight__topline">
                    <span>{testimonialsData.items[0].badge}</span>
                    <span>{testimonialsData.items[0].tag}</span>
                  </div>
                  <blockquote>{testimonialsData.items[0].quote}</blockquote>
                  <div className="testimonial-spotlight__footer">
                    <div className="testimonial-person">
                      <div className="testimonial-person__avatar" aria-hidden="true">
                        <span>{testimonials[0].initials}</span>
                      </div>
                      <div className="testimonial-person__copy">
                        <strong>{testimonialsData.items[0].name}</strong>
                        <p>{testimonialsData.items[0].role}</p>
                      </div>
                    </div>
                    <div className="testimonial-spotlight__score">
                      <strong>5.0</strong>
                      <span>{testimonialsData.scoreLabel}</span>
                    </div>
                  </div>
                </article>

                <div className="testimonials-side">
                  <div className="testimonial-stats">
                    {testimonialsData.stats.map((item: any) => (
                      <article className="testimonial-stat" key={item.value}>
                        <strong>{item.value}</strong>
                        <p>{item.label}</p>
                      </article>
                    ))}
                  </div>
                  <div className="testimonial-list" aria-label="Pháº£n há»“i khÃ¡c tá»« khÃ¡ch hÃ ng">
                    {testimonialsData.items.slice(1).map((item: any, idx: number) => (
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
              <div className="faq-section__heading title-luxury">
                <h2 id="faq-heading">{faqData.heading}</h2>
                <p>{faqData.lead}</p>
              </div>
              <div className="faq-list">
                {faqData.items.map((item: any) => (
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
              <h2 id="contact-cta-heading">{t.contactCta.heading}</h2>
              <p>{t.contactCta.lead}</p>
              <div className="contact-cta-section__actions">
                <a className="contact-cta-button contact-cta-button--solid" href={`tel:${siteContacts.phone.replace(/\s+/g, "")}`}>
                  <FontAwesomeIcon type="phone" />
                  <span>{t.contactCta.call}</span>
                </a>
                <a className="contact-cta-button contact-cta-button--outline" href={siteContacts.zalo} target="_blank" rel="noreferrer">
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
                  <nav className="site-footer__nav" aria-label="Dá»‹ch vá»¥ footer">
                    {t.footer.services.map((item: any) => (
                      <a key={item.label} href={item.href}>{item.label}</a>
                    ))}
                  </nav>
                </div>

                <div className="site-footer__column">
                  <h2 className="site-footer__heading">{t.footer.supportHeading}</h2>
                  <nav className="site-footer__nav" aria-label="Há»— trá»£ footer">
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
                      <span>{siteContacts.address}</span>
                    </div>
                    <div className="site-footer__contact-item">
                      <span className="site-footer__contact-icon"><FontAwesomeIcon type="phone" /></span>
                      <a href={`tel:${siteContacts.phone.replace(/\s+/g, "")}`}>{siteContacts.phone}</a>
                    </div>
                    <div className="site-footer__contact-item">
                      <span className="site-footer__contact-icon"><FontAwesomeIcon type="mail" /></span>
                      <a href={`mailto:${siteContacts.email}`}>{siteContacts.email}</a>
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

