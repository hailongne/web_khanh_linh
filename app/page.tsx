"use client";
import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import "./user.css";
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

type TypedDb = {
  sales?: SalesPerson[];
  contacts?: ContactInfo;
  pricing?: Record<string, PricingData>;
  testimonials?: Record<string, TestimonialsData>;
  faq?: Record<string, FaqData>;
};

type ReasonItem = { icon: string; title: string; description: string };
type BookingStep = { icon: string; title: string; description: string };
type FooterLink = { label: string; href: string };
type PublicReview = {
  id: string;
  displayName: string;
  rating: number;
  content: string;
  createdAt: string;
};

const siteContacts = {
  phone: "0962 992 555",
  zalo: "https://zalo.me/0962992555",
  email: "info@khanhlinhtrans.com",
  address: "11a Nguyễn Hoàng Tôn, Tây Hồ, Hà Nội, Việt Nam"
};

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

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia(query);
      if (mq.addEventListener) mq.addEventListener("change", callback);
      else mq.addListener(callback);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", callback);
        else mq.removeListener(callback);
      };
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function HomePage() {
  const [lang, setLang] = useState<"vi" | "en">("vi");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("site_lang") as "vi" | "en";
      if (savedLang === "vi" || savedLang === "en") {
        queueMicrotask(() => setLang(savedLang));
      }
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
      localStorage.setItem("site_lang", lang);
    } catch {
      // noop
    }
  }, [lang]);

  const t = (translations as Record<string, typeof translations.vi>)[lang] ?? translations.vi;

  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loadingPricing, setLoadingPricing] = useState<boolean>(true);

  const [faqData, setFaqData] = useState<FaqData | null>(null);
  const [loadingFaq, setLoadingFaq] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/data?type=pricing&lang=${lang}`)
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success && json.data) {
          setPricing(json.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingPricing(false);
      });

    fetch(`/api/admin/data?type=faq&lang=${lang}`)
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success && json.data) {
          setFaqData(json.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingFaq(false);
      });

    return () => {
      active = false;
    };
  }, [lang]);

  const toggleLang = () => {
    setLoadingPricing(true);
    setLoadingFaq(true);
    setLang((l) => (l === "vi" ? "en" : "vi"));
  };
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const reasonsListRef = useRef<HTMLDivElement | null>(null);
  const processGridRef = useRef<HTMLDivElement | null>(null);

  // Reviews System States
  const [publicReviews, setPublicReviews] = useState<PublicReview[]>([]);
  const [reviewStats, setReviewStats] = useState<{
    totalReviews: number;
    averageRating: number;
    ratingBreakdown: Record<number, number>;
  }>({
    totalReviews: 0,
    averageRating: 5.0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const [formDisplayName, setFormDisplayName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formContent, setFormContent] = useState("");
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState("");
  const [submitErrorMsg, setSubmitErrorMsg] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Pagination for public reviews (max 6 per page)
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 6;
  const totalReviewPages = Math.ceil(publicReviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = publicReviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);

  const fetchPublicReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews");
      const json = await res.json();
      if (json.success) {
        setPublicReviews(json.reviews || []);
        if (json.stats) {
          setReviewStats(json.stats);
        }
      }
    } catch {
      // noop
    }
  }, []);

  const [salesContacts, setSalesContacts] = useState<SalesPerson[]>([]);

  const fetchSalesContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/sales");
      const json = await res.json();
      if (json.items && Array.isArray(json.items) && json.items.length > 0) {
        setSalesContacts(json.items);
      }
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(fetchSalesContacts);
  }, [fetchSalesContacts]);

  useEffect(() => {
    Promise.resolve().then(fetchPublicReviews);
  }, [fetchPublicReviews]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccessMsg("");
    setSubmitErrorMsg("");

    if (!formDisplayName.trim() || !formContent.trim()) {
      setSubmitErrorMsg("Vui lòng điền đầy đủ tên và nội dung đánh giá.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formDisplayName,
          rating: formRating,
          content: formContent
        })
      });

      const json = await res.json();
      if (json.success) {
        setSubmitSuccessMsg("Cảm ơn bạn. Đánh giá sẽ được kiểm duyệt trước khi hiển thị.");
        setFormDisplayName("");
        setFormContent("");
        setFormRating(5);
      } else {
        setSubmitErrorMsg(json.error || "Không thể gửi đánh giá.");
      }
    } catch {
      setSubmitErrorMsg("Có lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

  const heroBannerSlides = [
    { desktopSrc: "/images/banner.png", mobileSrc: "/images/mobile.png", alt: "Khánh Linh Trans Banner 1" },
    { desktopSrc: "/images/banner1.png", mobileSrc: "/images/_mobile.jpg", alt: "Khánh Linh Trans Banner 2" },
  ];

  const [bannerIndex, setBannerIndex] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => {
      setBannerIndex((current) => (current + 1) % heroBannerSlides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [heroBannerSlides.length]);

  // Auto-scroll reasons list on mobile & tablet (1s interval)
  useEffect(() => {
    const el = reasonsListRef.current;
    if (!el || !isTablet) return;

    let paused = false;
    const interval = window.setInterval(() => {
      if (paused) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScrollLeft - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const firstCard = el.children[0] as HTMLElement;
        const step = firstCard ? firstCard.offsetWidth + 16 : 280;
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 1000);

    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onEnter, { passive: true });
    el.addEventListener("touchend", onLeave, { passive: true });

    return () => {
      window.clearInterval(interval);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onEnter);
      el.removeEventListener("touchend", onLeave);
    };
  }, [isTablet]);

  // Auto-scroll process grid on mobile & tablet (1s interval)
  useEffect(() => {
    const el = processGridRef.current;
    if (!el || !isTablet) return;

    let paused = false;
    const interval = window.setInterval(() => {
      if (paused) return;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScrollLeft - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const firstCard = el.children[0] as HTMLElement;
        const step = firstCard ? firstCard.offsetWidth + 16 : 280;
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 1000);

    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onEnter, { passive: true });
    el.addEventListener("touchend", onLeave, { passive: true });

    return () => {
      window.clearInterval(interval);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onEnter);
      el.removeEventListener("touchend", onLeave);
    };
  }, [isTablet]);

  const homepageSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Khánh Linh Trans",
      "url": "https://khanhlinhtrans.vn",
      "logo": "https://khanhlinhtrans.vn/images/logoKhanhLinhFull.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": siteContacts.phone || "",
        "contactType": "customer service"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Khánh Linh Trans",
      "url": "https://khanhlinhtrans.vn",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://khanhlinhtrans.vn/blog?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "AutoRental",
      "name": "Khánh Linh Trans",
      "image": "https://khanhlinhtrans.vn/images/logoKhanhLinhFull.png",
      "telephone": siteContacts.phone || "",
      "email": siteContacts.email || "",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": siteContacts.address || "",
        "addressCountry": "VN"
      },
      "url": "https://khanhlinhtrans.vn"
    },
    ...(faqData?.items && faqData.items.length > 0 ? [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData.items.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    }] : [])
  ];

  return (
    <main className="page-shell" id="top">
      {homepageSchemas.map((schema, index) => (
        <script
          key={`ld-json-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
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
                <div className="reasons-list" ref={reasonsListRef}>
                  {t.reasons.items.map((reason: ReasonItem) => (
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
                {t.booking.steps.map((step: BookingStep) => (
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
              {loadingPricing ? (
                <div className="pricing-loading-skeleton" style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ display: "inline-block", width: "44px", height: "44px", border: "4px solid rgba(0, 150, 255, 0.15)", borderTopColor: "#0096ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ marginTop: "16px", color: "#64748b", fontWeight: 500, fontSize: "0.95rem" }}>
                    {lang === "en" ? "Loading price list..." : "Đang tải bảng giá..."}
                  </p>
                </div>
              ) : pricing ? (
                <>
                  <div className="pricing-section__heading title-luxury">
                    <h2>{pricing.heading || (lang === "en" ? "Indicative Price List" : "Bảng Giá Tham Khảo Nhanh")}</h2>
                    <p>{pricing.lead}</p>
                  </div>
                  <div className="pricing-table-wrap">
                    {!isMobile ? (
                      <table className="pricing-table">
                        <thead>
                          <tr>
                            {(pricing.cols || []).map((c: string, idx: number) => (
                              <th scope="col" key={idx}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(pricing.rows || []).map((row: PricingRow) => {
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
                                <td data-label={pricing.cols?.[1]}>{row.cityTour}</td>
                                <td data-label={pricing.cols?.[2]}>{row.provinceTrip}</td>
                                <td data-label={pricing.cols?.[3]}>{row.airport}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="pricing-cards" role="list">
                        {(pricing.rows || []).map((row: PricingRow) => {
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
                                <div className="label">{pricing.cols?.[1]}</div>
                                <div className="value">{row.cityTour}</div>
                              </div>
                              <div className="price-row">
                                <div className="label">{pricing.cols?.[2]}</div>
                                <div className="value">{row.provinceTrip}</div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <p className="pricing-section__note">{pricing.note}</p>
                </>
              ) : null}
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
                        const normalizedPhone = (staff.phone || "").replace(/\s+/g, "");
                        const zaloLink = staff.zalo?.startsWith("http")
                          ? staff.zalo
                          : `https://zalo.me/${(staff.zalo || "").replace(/\s+/g, "")}`;

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

          {/* ĐÁNH GIÁ KHÁCH HÀNG SYSTEM */}
          <section className="reviews-section" id="reviews" aria-labelledby="reviews-heading">
            <div className="section-shell">
              <div className="title-luxury">
                <h2 id="reviews-heading">{lang === "en" ? "Customer Reviews" : "Đánh Giá Khách Hàng"}</h2>
                <p>{lang === "en" ? "Real experiences and feedback from our valued customers" : "Phản hồi thực tế từ các chuyến đi của khách hàng cá nhân và doanh nghiệp"}</p>
              </div>

              <div className="reviews-grid">
                {/* 1. Thống kê điểm số & Breakdown */}
                <div className="reviews-overview-card">
                  <div className="reviews-score-hero">
                    <div className="reviews-score-number">
                      {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : "5.0"}
                    </div>
                    <div className="reviews-score-meta">
                      <div className="reviews-stars-row">
                        {"★".repeat(Math.round(reviewStats.averageRating || 5))}
                        {"☆".repeat(5 - Math.round(reviewStats.averageRating || 5))}
                      </div>
                      <div className="reviews-total-text">
                        {reviewStats.totalReviews} {lang === "en" ? "reviews" : "đánh giá"}
                      </div>
                    </div>
                  </div>

                  <div className="reviews-breakdown">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewStats.ratingBreakdown[star] || 0;
                      const pct = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                      return (
                        <div className="breakdown-row" key={star}>
                          <span>{star} sao</span>
                          <div className="breakdown-bar-track">
                            <div className="breakdown-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="breakdown-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Form gửi đánh giá */}
                <div className="review-form-card">
                  <h3 className="review-form-title">{lang === "en" ? "Write a Review" : "Gửi Đánh Giá Của Bạn"}</h3>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="review-form-group">
                      <label className="review-form-label">{lang === "en" ? "Your Name" : "Tên hiển thị"}</label>
                      <input
                        type="text"
                        className="review-form-input"
                        placeholder={lang === "en" ? "e.g. Mr. John / Ms. Lan" : "Ví dụ: Anh Minh / Chị Lan"}
                        value={formDisplayName}
                        onChange={(e) => setFormDisplayName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="review-form-group">
                      <label className="review-form-label">{lang === "en" ? "Rating" : "Số sao đánh giá"}</label>
                      <div className="review-star-picker" role="radiogroup" aria-label="Chọn số sao">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            className={`star-pick-btn ${star <= formRating ? "active" : ""}`}
                            onClick={() => setFormRating(star)}
                            aria-label={`${star} sao`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="review-form-group">
                      <label className="review-form-label">{lang === "en" ? "Your Feedback" : "Nội dung đánh giá"}</label>
                      <textarea
                        className="review-form-textarea"
                        rows={3}
                        placeholder={lang === "en" ? "Share your experience with our vehicle & driver..." : "Chia sẻ trải nghiệm của bạn về chất lượng xe, tài xế..."}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        required
                      />
                    </div>

                    {submitErrorMsg && (
                      <div style={{ color: "#d93025", fontSize: "0.9rem", marginBottom: "12px", fontWeight: 500 }}>
                        {submitErrorMsg}
                      </div>
                    )}

                    <button type="submit" className="review-submit-btn" disabled={isSubmittingReview}>
                      {isSubmittingReview ? (lang === "en" ? "Sending..." : "Đang gửi...") : (lang === "en" ? "Submit Review" : "Gửi Đánh Giá")}
                    </button>

                    {submitSuccessMsg && (
                      <div className="review-success-msg">
                        {submitSuccessMsg}
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* 3. Danh sách Đánh giá (approved=true, max 6 per page) */}
              {publicReviews.length > 0 && (
                <div className="reviews-list-wrapper">
                  <div className="reviews-list-grid">
                    {paginatedReviews.map((rev) => (
                      <article className="review-item-card" key={rev.id}>
                        <div className="review-item-header">
                          <div className="review-author-info">
                            <div className="review-author-avatar">
                              {rev.displayName ? rev.displayName.charAt(0).toUpperCase() : "K"}
                            </div>
                            <div>
                              <div className="review-author-name">{rev.displayName}</div>
                              <div className="review-item-stars" style={{ display: "inline-flex", gap: 1 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span key={star} style={{ color: star <= rev.rating ? "#ffb400" : "#cbd5e1" }}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="review-item-date">
                            {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <p className="review-item-content">{rev.content}</p>
                      </article>
                    ))}
                  </div>

                  {/* Phân trang đánh giá (tối đa 6 review / trang) */}
                  {totalReviewPages > 1 && (
                    <div className="reviews-pagination">
                      <button
                        type="button"
                        className="reviews-page-btn"
                        disabled={reviewPage === 1}
                        onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                        aria-label="Trang trước"
                      >
                        ‹
                      </button>

                      {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          className={`reviews-page-btn ${pageNum === reviewPage ? "active" : ""}`}
                          onClick={() => setReviewPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        type="button"
                        className="reviews-page-btn"
                        disabled={reviewPage === totalReviewPages}
                        onClick={() => setReviewPage((p) => Math.min(totalReviewPages, p + 1))}
                        aria-label="Trang sau"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* FAQ */}
          <section className="faq-section" aria-labelledby="faq-heading">
            <div className="section-shell faq-section__inner">
              {loadingFaq ? (
                <div className="faq-loading-skeleton" style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ display: "inline-block", width: "44px", height: "44px", border: "4px solid rgba(0, 150, 255, 0.15)", borderTopColor: "#0096ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ marginTop: "16px", color: "#64748b", fontWeight: 500, fontSize: "0.95rem" }}>
                    {lang === "en" ? "Loading FAQ..." : "Đang tải câu hỏi thường gặp..."}
                  </p>
                </div>
              ) : faqData ? (
                <>
                  <div className="faq-section__heading title-luxury">
                    <h2 id="faq-heading">{faqData.heading || (lang === "en" ? "Frequently Asked Questions" : "Câu Hỏi Thường Gặp")}</h2>
                    <p>{faqData.lead}</p>
                  </div>
                  <div className="faq-list">
                    {(faqData.items || []).map((item: FaqItem) => (
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
                </>
              ) : null}
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
                    {t.footer.services.map((item: FooterLink) => (
                      <a key={item.label} href={item.href}>{item.label}</a>
                    ))}
                  </nav>
                </div>

                <div className="site-footer__column">
                  <h2 className="site-footer__heading">{t.footer.supportHeading}</h2>
                  <nav className="site-footer__nav" aria-label="Há»— trá»£ footer">
                    {t.footer.supportLinks.map((item: FooterLink) => (
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
        <Image src="/icon/muiTen.png" alt="Lên đầu trang" width={20} height={20} />
      </button>
    </main>
            
  );
}

