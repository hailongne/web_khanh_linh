"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { SiteHeader } from "./site-header";
import FleetSection from "./fleet-section";
import { translations } from "./translations";

const headerLinks = [
  { label: "Trang chủ", href: "#top", active: true },
  { label: "Đội xe", href: "#fleet" },
  { label: "Bảng giá", href: "#pricing" },
  { label: "Liên hệ", href: "#sales" },
  { label: "Vé máy bay", href: "https://klfly.com" }
];

const heroHighlights = [
  "Dàn xe 4 đến 45 chỗ phục vụ linh hoạt",
  "Lái xe chuyên nghiệp, đúng giờ, đúng lộ trình",
  "Báo giá rõ ràng, hỗ trợ nhanh 24/7"
];

const reasons = [
  {
    title: "100% Xe Đời Mới",
    description:
      "Đội xe liên tục được nâng cấp và bảo dưỡng định kỳ, đảm bảo khoang nội thất sạch sẽ, tiện nghi và ổn định trên mọi cung đường.",
    icon: "fleet"
  },
  {
    title: "Tài Xế Chuyên Nghiệp",
    description:
      "Đội ngũ lái xe giàu kinh nghiệm, tác phong chỉn chu, phục vụ lịch sự và luôn chủ động hỗ trợ khách trong suốt hành trình.",
    icon: "driver"
  },
  {
    title: "Giá Minh Bạch",
    description:
      "Báo giá chi tiết theo lịch trình và loại xe, cam kết không phát sinh chi phí mập mờ sau khi đã chốt dịch vụ.",
    icon: "pricing",
  },
  {
    title: "Hỗ Trợ 24/7",
    description:
      "Bộ phận điều phối và chăm sóc khách hàng luôn sẵn sàng tiếp nhận yêu cầu, điều chỉnh lịch và phản hồi nhanh khi cần.",
    icon: "support"
  }
];

// Fleet data and interactive UI moved to a client component: ./fleet-section

const pricingRows = [
  {
    vehicle: "Xe 4 Chỗ",
    cityTour: "Từ 1.500.000đ",
    provinceTrip: "Liên hệ",
    airport: "250.000đ"
  },
  {
    vehicle: "Xe 7 Chỗ",
    cityTour: "Từ 2.500.000đ",
    provinceTrip: "Liên hệ",
    airport: "350.000đ"
  },
  {
    vehicle: "Xe 16 Chỗ",
    cityTour: "Từ 3.500.000đ",
    provinceTrip: "Liên hệ",
    airport: "500.000đ"
  },
  {
    vehicle: "Xe 29 Chỗ",
    cityTour: "Từ 4.500.000đ",
    provinceTrip: "Liên hệ",
    airport: "800.000đ"
  },
  {
    vehicle: "Xe 45 Chỗ",
    cityTour: "Từ 6.000.000đ",
    provinceTrip: "Liên hệ",
    airport: "1.500.000đ"
  }
];



const salesHotlines = [
  { name: "Hà Nội - Sales 1", number: "+84 916 012 589" },
  { name: "Hà Nội - Sales 2", number: "+84 912 345 678" },
  { name: "Hồ Chí Minh - Sales 1", number: "+84 909 876 543" },
  { name: "Hồ Chí Minh - Sales 2", number: "+84 908 765 432" },
  { name: "Đà Nẵng - Sales", number: "+84 905 123 456" },
  { name: "Tổng đài (24/7)", number: "+84 800 123 456" },
  { name: "Bán hàng VIP", number: "+84 987 654 321" },
  { name: "Hỗ trợ nhanh", number: "+84 903 210 987" }
];

const salesZaloContacts = [
  { name: "Dũng (GĐ)", id: "84916012589" },
  { name: "Minh", id: "84912345678" },
  { name: "Hằng", id: "84909876543" },
  { name: "Tú", id: "84900111222" },
  { name: "Bộ phận B2B", id: "84988123456" },
  { name: "Hỗ trợ 24/7", id: "84800123456" },
  { name: "Đặt xe nhanh", id: "84800123457" },
  { name: "Kinh doanh", id: "84987654321" }
];

const testimonials = [
  {
    quote:
      "Dịch vụ rất chuyên nghiệp, xe mới và sạch sẽ. Bác tài vui tính, hỗ trợ đoàn trong suốt chuyến đi Sapa. Lịch trình thay đổi vẫn được điều phối rất nhanh.",
    name: "Anh Tuấn",
    role: "Giám đốc Công ty TNHH ABC",
    badge: "Chuyến Sapa 3N2Đ",
    tag: "Doanh nghiệp",
    initials: "T"
  },
  {
    quote:
      "Nhà mình đặt xe 16 chỗ đi sân bay và Hạ Long. Tài xế đến đúng giờ, xe thơm sạch, hỗ trợ người lớn tuổi rất chu đáo nên cả nhà yên tâm.",
    name: "Chị Minh Hà",
    role: "Khách gia đình",
    badge: "Đưa đón gia đình",
    tag: "16 chỗ",
    initials: "H"
  },
  {
    quote:
      "Khâu báo giá rõ ràng, hợp đồng nhanh gọn và đội điều phối phản hồi gần như ngay lập tức. Đây là bên hiếm hoi giữ chất lượng ổn định qua nhiều lần đặt.",
    name: "Anh Hoàng Nam",
    role: "Điều hành tour nội địa",
    badge: "Đối tác tour",
    tag: "29 chỗ",
    initials: "N"
  }
];

const trustStats = [
  { value: "4.9/5", label: "điểm hài lòng trung bình từ khách đoàn và khách lẻ" },
  { value: "200+", label: "hợp đồng doanh nghiệp đã phục vụ trong năm" },
  { value: "24/7", label: "điều phối hỗ trợ thay đổi lịch trình khẩn" }
];

const faqItems = [
  {
    question: "Giá thuê xe đã bao gồm các chi phí nào?",
    answer:
      "Chi phí cơ bản thường đã bao gồm xe, tài xế, xăng dầu và phí cầu đường theo lịch trình đã chốt. Các khoản phát sinh như lưu đêm, bến bãi hoặc thay đổi tuyến sẽ được báo lại rõ trước khi xác nhận."
  },
  {
    question: "Chính sách hủy xe và hoàn tiền như thế nào?",
    answer:
      "Lịch hủy và mức hoàn tiền phụ thuộc vào thời điểm thông báo và loại xe đã giữ chỗ. Đội ngũ tư vấn sẽ ghi rõ điều khoản trong báo giá hoặc hợp đồng để khách hàng chủ động trước khi đặt cọc."
  },
  {
    question: "Công ty có xuất hóa đơn VAT không?",
    answer:
      "Có. Khánh Linh Trans hỗ trợ xuất hóa đơn VAT cho khách doanh nghiệp và khách đoàn. Bạn chỉ cần gửi thông tin xuất hóa đơn khi xác nhận booking để bộ phận kế toán xử lý cùng hồ sơ thanh toán."
  }
];

const bookingSteps = [
  {
    title: "1. Chọn Xe",
    description: "Lựa chọn dòng xe phù hợp với nhu cầu di chuyển và số lượng hành khách.",
    icon: "choose"
  },
  {
    title: "2. Nhận Báo Giá",
    description: "Nhân viên tư vấn liên hệ xác nhận lộ trình và gửi báo giá chi tiết.",
    icon: "quote"
  },
  {
    title: "3. Ký Hợp Đồng",
    description: "Thống nhất điều khoản, lịch trình và hoàn tất đặt cọc để giữ xe.",
    icon: "contract"
  },
  {
    title: "4. Khởi Hành",
    description: "Tài xế đón đúng giờ, hỗ trợ tận nơi và bắt đầu hành trình an toàn.",
    icon: "departure"
  }
];

const footerServices = [
  { label: "Vehicle Rental", href: "#fleet" },
  { label: "Airport Transfer", href: "#pricing" },
  { label: "Corporate Travel", href: "#contact-cta-heading" }
];

const footerSupportLinks = [
  { label: "Booking Guide", href: "#faq-heading" },
  { label: "Privacy Policy", href: "#faq-heading" },
  { label: "Terms of Service", href: "#faq-heading" }
];

const footerSocialLinks = [
  { label: "Tripadvisor", href: "https://www.tripadvisor.com", icon: "tripadvisor" },
  { label: "YouTube", href: "https://www.youtube.com", icon: "youtube" }
];

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
      // ignore on server
    }
  }, [lang]);

  const t = (translations as any)[lang] ?? translations.vi;

  const toggleLang = () => setLang((l) => (l === "vi" ? "en" : "vi"));

  return (
    <main className="page-shell" id="top">
      <SiteHeader links={t.header.links} lang={lang} onToggleLang={toggleLang} />
      {false && <header className="site-header">
        <div className="site-header__inner">
          <a className="site-header__brand" href="#top" aria-label="Khánh Linh Trans">
            <span className="site-header__brand-name">Khánh Linh Trans</span>
          </a>

          <nav className="site-header__nav" aria-label="Main navigation">
            {headerLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={item.active ? "is-active" : undefined}
                aria-current={item.active ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="site-header__actions">
            <a className="site-header__phone" href="tel:+84916012589">
              +84 916 012 589
            </a>
            <a className="site-header__cta" href="#contact">
              Đặt xe ngay
            </a>
          </div>
        </div>
      </header>}

      <section className="hero-section" id="services">
        <div className="section-shell hero-section__inner">
          <div className="hero-section__copy">
            <span className="section-kicker section-kicker--light">{t.hero.kicker}</span>
            <h1>{t.hero.title}</h1>
            <p>{t.hero.description}</p>

            <div className="hero-section__actions">
              <a className="button button--primary" href="#fleet">
                {t.hero.primaryCta}
              </a>
              <a className="button button--ghost" href="#contact">
                {t.hero.secondaryCta}
              </a>
            </div>
 
          </div>

          <aside className="consult-card" id="contact">
            <div className="consult-card__avatar" aria-hidden="true">
              <i className="fas fa-user-headset consult-card__avatar-icon" />
            </div>
            <h2>{t.consultCard.title}</h2>
            <p className="consult-card__role">{t.consultCard.role}</p>

            <a className="consult-card__primary" href="tel:+84916012589">
              {t.consultCard.hotlineLabel} {t.consultCard.hotline}
            </a>
            <a className="consult-card__secondary" href="https://zalo.me/84916012589">
              {t.consultCard.chatZalo}
            </a>

            <p className="consult-card__note">{t.consultCard.note}</p>
          </aside>
        </div>
      </section>

      <section className="reasons-section" id="reasons">
        <div className="section-shell">
          <div className="reasons-section__header">
            <span className="section-kicker">{t.reasons.kicker}</span>
            <h2>{t.reasons.heading}</h2>
            <p className="reasons-section__lead">{t.reasons.lead}</p>
          </div>

          <div className="reasons-section__inner">
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
          </div>
        </div>
      </section>

      <FleetSection lang={lang} />

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

      <section className="pricing-section" id="pricing">
        <div className="section-shell">
          <div className="pricing-section__heading">
            <span className="section-kicker">{t.pricing.kicker}</span>
            <h2>{t.pricing.heading}</h2>
            <p>{t.pricing.lead}</p>
          </div>

          <div className="pricing-table-wrap">
            <table className="pricing-table">
              <thead>
                <tr>
                  {t.pricing.table.cols.map((c: string, idx: number) => (
                    <th scope="col" key={idx}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.pricing.rows.map((row: any) => (
                  <tr key={row.vehicle}>
                    <th scope="row">{row.vehicle}</th>
                    <td data-label={t.pricing.table.cols[1]}>{row.cityTour}</td>
                    <td data-label={t.pricing.table.cols[2]}>{row.provinceTrip}</td>
                    <td data-label={t.pricing.table.cols[3]}>{row.airport}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pricing-section__note">{t.pricing.note}</p>
        </div>
      </section>

      <section className="addons-section" id="sales">
        <div className="section-shell">
          <div className="addons-section__heading">
            <span className="section-kicker">{t.sales.kicker}</span>
            <h2>{t.sales.heading}</h2>
            <p>{t.sales.lead}</p>
          </div>

          <div className="addons-grid addons-grid--two">
            <article className="addon-card" key="hotline">
              <div className="addon-card__icon">
                <FontAwesomeIcon type="phone" />
              </div>
              <span className="addon-card__label">{t.sales.hotlineLabel}</span>
              <h3>{t.sales.hotlineTitle}</h3> (sẽ thay sau khi có thông tin)
              <div className="contact-list">
                {salesHotlines.map((h) => (
                  <p key={h.number}>
                    <a href={`tel:${h.number.split(' ').join('')}`}>{h.name}: {h.number}</a>
                  </p>
                ))}
              </div>
            </article>

            <article className="addon-card" key="zalo">
              <div className="addon-card__icon">
                <FontAwesomeIcon type="chat" />
              </div>
              <span className="addon-card__label">{t.sales.zaloLabel}</span>
              <h3>{t.sales.zaloTitle}</h3> (sẽ thay sau khi có thông tin)
              <div className="contact-list">
                {salesZaloContacts.map((z) => (
                  <p key={z.id}>
                    <a href={`https://zalo.me/${z.id}`} target="_blank" rel="noreferrer">{z.name}: {z.id}</a>
                  </p>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

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

              <div className="testimonial-spotlight__quote-mark" aria-hidden="true">
                “
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
                {t.testimonials.items.slice(1).map((item: any) => (
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

      <section className="contact-cta-section" aria-labelledby="contact-cta-heading">
        <div className="section-shell contact-cta-section__inner">
          <span className="section-kicker section-kicker--light">{t.contactCta.kicker}</span>
          <h2 id="contact-cta-heading">{t.contactCta.heading}</h2>
          <p>{t.contactCta.lead}</p>

          <div className="contact-cta-section__actions">
            <a className="contact-cta-button contact-cta-button--solid" href="tel:+84916012589">
              <FontAwesomeIcon type="phone" />
              <span>{t.contactCta.call}</span>
            </a>

            <a
              className="contact-cta-button contact-cta-button--outline"
              href="https://zalo.me/84916012589"
            >
              <FontAwesomeIcon type="chat" />
              <span>{t.contactCta.chat}</span>
            </a>
          </div>
        </div>
      </section>

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
                {t.footer.social.map((item: any) => (
                  <a
                    key={item.label}
                    className="site-footer__social-link"
                    href={item.href}
                    aria-label={item.label}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FontAwesomeIcon type={item.icon} />
                  </a>
                ))}
              </div>
            </div>

            <div className="site-footer__column">
              <h2 className="site-footer__heading">{t.footer.servicesHeading}</h2>
              <nav className="site-footer__nav" aria-label="Dịch vụ footer">
                {t.footer.services.map((item: any) => (
                  <a key={item.label} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="site-footer__column">
              <h2 className="site-footer__heading">{t.footer.supportHeading}</h2>
              <nav className="site-footer__nav" aria-label="Hỗ trợ footer">
                {t.footer.supportLinks.map((item: any) => (
                  <a key={item.label} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="site-footer__column">
              <h2 className="site-footer__heading">{t.footer.contactHeading}</h2>
              <div className="site-footer__contact-list">
                <div className="site-footer__contact-item">
                  <span className="site-footer__contact-icon">
                    <FontAwesomeIcon type="location" />
                  </span>
                  <span>{t.footer.contactList.address}</span>
                </div>

                <div className="site-footer__contact-item">
                  <span className="site-footer__contact-icon">
                    <FontAwesomeIcon type="phone" />
                  </span>
                  <a href={`tel:${t.footer.contactList.phone.replace(/\s+/g, "")}`}>{t.footer.contactList.phone}</a>
                </div>

                <div className="site-footer__contact-item">
                  <span className="site-footer__contact-icon">
                    <FontAwesomeIcon type="mail" />
                  </span>
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
    </main>
  );
}
