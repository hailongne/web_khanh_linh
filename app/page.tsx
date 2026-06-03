import Image from "next/image";
import { SiteHeader } from "./site-header";

const headerLinks = [
  { label: "Trang chủ", href: "#top", active: true },
  { label: "Lý do chọn", href: "#reasons" },
  { label: "Đội xe", href: "#fleet" },
  { label: "Bảng giá", href: "#pricing" },
  { label: "Liên hệ", href: "#contact" }
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

const fleetCategories = ["Tất cả", "Xe 4-7 chỗ", "Xe 16 chỗ", "Xe 29 chỗ", "Xe 45 chỗ"];

const fleetItems = [
  {
    name: "Hyundai Universe",
    badge: "45 chỗ",
    description:
      "Dòng xe khách cao cấp cỡ lớn, không gian rộng rãi, ghế ngả êm ái và phù hợp cho những hành trình du lịch hoặc đưa đón đoàn đông.",
    price: "Liên hệ",
    image: "/coach.svg",
    specs: [
      { label: "45 ghế ngả", icon: "seat" },
      { label: "Có A/C", icon: "comfort" },
      { label: "Khoang lớn", icon: "storage" }
    ]
  },
  {
    name: "Ford Transit",
    badge: "16 chỗ",
    description:
      "Lựa chọn cân bằng cho gia đình, doanh nghiệp nhỏ và các chuyến đi ngắn với khả năng vận hành êm, điều hòa tốt và chi phí hợp lý.",
    price: "1.200k/ngày",
    image: "/minibus.svg",
    specs: [
      { label: "16 ghế", icon: "seat" },
      { label: "2 dàn lạnh", icon: "comfort" },
      { label: "Vừa phải", icon: "storage" }
    ]
  }
];

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

const addOnServices = [
  {
    title: "Cho Thuê Xe Cưới",
    description: "Các dòng xe hoa cao cấp, trang trí đẹp mắt và phù hợp concept lễ cưới sang trọng.",
    label: "Setup theo concept",
    icon: "wedding"
  },
  {
    title: "Hướng Dẫn Viên",
    description: "Cung cấp HDV du lịch chuyên nghiệp, am hiểu văn hóa vùng miền và lịch trình đoàn.",
    label: "Đi cùng đoàn",
    icon: "guide"
  },
  {
    title: "Bảo Hiểm Du Lịch",
    description: "Hỗ trợ mua bảo hiểm du lịch trọn gói, tăng an tâm cho cá nhân, gia đình và doanh nghiệp.",
    label: "An tâm hành trình",
    icon: "insurance"
  },
  {
    title: "Cho Thuê Lái Xe",
    description: "Cung cấp lái xe riêng chuyên nghiệp theo ngày, theo giờ hoặc theo lịch trình linh hoạt.",
    label: "Linh hoạt thời gian",
    icon: "chauffeur"
  }
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
  return (
    <main className="page-shell" id="top">
      <SiteHeader links={headerLinks} />
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
            <span className="section-kicker section-kicker--light">Khánh Linh Trans</span>
            <h1>Dịch Vụ Cho Thuê Xe Du Lịch &amp; Tự Lái Uy Tín Hàng Đầu</h1>
            <p>
              Trải nghiệm hành trình trọn vẹn với dàn xe đời mới, tài xế chuyên nghiệp và quy
              trình điều phối chỉn chu cho khách doanh nghiệp, gia đình và khách đoàn.
            </p>

            <div className="hero-section__actions">
              <a className="button button--primary" href="#fleet">
                Khám Phá Đội Xe
              </a>
              <a className="button button--ghost" href="#contact">
                Nhận Báo Giá Nhanh
              </a>
            </div>
 
          </div>

          <aside className="consult-card" id="contact">
            <div className="consult-card__avatar" aria-hidden="true">
              <i className="fas fa-user-headset consult-card__avatar-icon" />
            </div>
            <h2>Tư Vấn Miễn Phí</h2>
            <p className="consult-card__role">Mr. Dũng - Giám đốc điều hành</p>

            <a className="consult-card__primary" href="tel:+84916012589">
              Hotline: 0916 012 589
            </a>
            <a className="consult-card__secondary" href="https://zalo.me/84916012589">
              Chat Zalo Ngay
            </a>

            <p className="consult-card__note">Hỗ trợ 24/7. Phản hồi trong vòng 5 phút.</p>
          </aside>
        </div>
      </section>

      <section className="reasons-section" id="reasons">
        <div className="section-shell reasons-section__inner">
          <div className="reasons-section__copy">
            <span className="section-kicker">Lý do khách hàng quay lại</span>
            <h2>Tại Sao Chọn Khánh Linh Trans?</h2>
            <p className="reasons-section__lead">
              Chúng tôi cam kết mang đến trải nghiệm di chuyển an toàn, thoải mái và chuyên nghiệp
              cho từng chuyến công tác, du lịch hay đưa đón sân bay.
            </p>

            <div className="reasons-list">
              {reasons.map((reason) => (
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
                  src="/hero-fleet.svg"
                  alt="Đội xe Khánh Linh Trans"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 48vw"
                />
              </div>
            </div>
 
          </div>
        </div>
      </section>

      <section className="fleet-section" id="fleet">
        <div className="section-shell">
          <div className="fleet-section__header">
            <div className="fleet-section__intro">
              <span className="section-kicker">Đội xe linh hoạt</span>
              <h2>Dòng Xe Nổi Bật</h2>
              <p>Khám phá các dòng xe đa dạng, đáp ứng linh hoạt cho mọi nhu cầu di chuyển.</p>
            </div>

            <div className="fleet-section__filters" aria-label="Danh mục đội xe">
              {fleetCategories.map((category, index) => (
                <span key={category} className={index === 0 ? "is-active" : undefined}>
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="fleet-grid">
            {fleetItems.map((item) => (
              <article className="fleet-card" key={item.name}>
                <div className="fleet-card__media">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                  />
                </div>

                <div className="fleet-card__content">
                  <div className="fleet-card__headline">
                    <h3>{item.name}</h3>
                    <span>{item.badge}</span>
                  </div>

                  <p>{item.description}</p>

                  <div className="fleet-card__specs">
                    {item.specs.map((spec) => (
                      <div className="fleet-card__spec" key={spec.label}>
                        <FontAwesomeIcon type={spec.icon} />
                        <span>{spec.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="fleet-card__footer">
                    <div className="fleet-card__price">
                      <small>Giá từ</small>
                      <strong>{item.price}</strong>
                    </div>

                    <a className="fleet-card__cta" href="#contact">
                      Đặt Xe
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="process-section">
        <div className="section-shell">
          <div className="process-section__heading">
            <span className="section-kicker">Đặt xe đơn giản</span>
            <h2>Quy Trình Đặt Xe</h2>
            <p>Đơn giản, nhanh chóng và chuyên nghiệp chỉ với 4 bước rõ ràng.</p>
          </div>

          <div className="process-grid">
            {bookingSteps.map((step) => (
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
            <span className="section-kicker">Chi phí minh bạch</span>
            <h2>Bảng Giá Tham Khảo Nhanh</h2>
            <p>
              Giá cước có thể thay đổi tùy theo thời điểm và yêu cầu cụ thể. Vui lòng liên hệ để
              có báo giá chính xác nhất.
            </p>
          </div>

          <div className="pricing-table-wrap">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th scope="col">Loại xe</th>
                  <th scope="col">City Tour (1 ngày)</th>
                  <th scope="col">Đi tỉnh (từ 100km)</th>
                  <th scope="col">Sân bay (1 chiều)</th>
                </tr>
              </thead>
              <tbody>
                {pricingRows.map((row) => (
                  <tr key={row.vehicle}>
                    <th scope="row">{row.vehicle}</th>
                    <td data-label="City Tour (1 ngày)">{row.cityTour}</td>
                    <td data-label="Đi tỉnh (từ 100km)">{row.provinceTrip}</td>
                    <td data-label="Sân bay (1 chiều)">{row.airport}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="pricing-section__note">
            * Bảng giá chỉ mang tính chất tham khảo. Đã bao gồm lương lái xe, chi phí cầu đường,
            xăng xe.
          </p>
        </div>
      </section>

      <section className="addons-section">
        <div className="section-shell">
          <div className="addons-section__heading">
            <span className="section-kicker">Tiện ích đi kèm</span>
            <h2>Dịch Vụ Thêm</h2>
            <p>Các tiện ích đi kèm giúp chuyến đi của bạn thêm phần trọn vẹn và chủ động hơn.</p>
          </div>

          <div className="addons-grid">
            {addOnServices.map((service) => (
              <article className="addon-card" key={service.title}>
                <div className="addon-card__icon">
                  <FontAwesomeIcon type={service.icon} />
                </div>
                <span className="addon-card__label">{service.label}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-section" aria-labelledby="testimonials-heading">
        <div className="section-shell testimonials-section__inner">
          <div className="testimonials-section__heading">
            <span className="section-kicker">Cảm nhận khách hàng</span>
            <h2 id="testimonials-heading">Khách Hàng Nói Gì</h2>
            <p>
              Những phản hồi thực tế sau các chuyến công tác, du lịch gia đình và hợp đồng đưa đón
              dài hạn.
            </p>
          </div>

          <div className="testimonials-layout">
            <article className="testimonial-spotlight">
              <div className="testimonial-spotlight__glow" aria-hidden="true" />
              <div className="testimonial-spotlight__topline">
                <span>{testimonials[0].badge}</span>
                <span>{testimonials[0].tag}</span>
              </div>

              <div className="testimonial-spotlight__quote-mark" aria-hidden="true">
                “
              </div>

              <blockquote>{testimonials[0].quote}</blockquote>

              <div className="testimonial-spotlight__footer">
                <div className="testimonial-person">
                  <div className="testimonial-person__avatar" aria-hidden="true">
                    <span>{testimonials[0].initials}</span>
                  </div>

                  <div className="testimonial-person__copy">
                    <strong>{testimonials[0].name}</strong>
                    <p>{testimonials[0].role}</p>
                  </div>
                </div>

                <div className="testimonial-spotlight__score">
                  <strong>5.0</strong>
                  <span>Trải nghiệm được đánh giá xuất sắc</span>
                </div>
              </div>
            </article>

            <div className="testimonials-side">
              <div className="testimonial-stats">
                {trustStats.map((item) => (
                  <article className="testimonial-stat" key={item.value}>
                    <strong>{item.value}</strong>
                    <p>{item.label}</p>
                  </article>
                ))}
              </div>

              <div className="testimonial-list" aria-label="Phản hồi khác từ khách hàng">
                {testimonials.slice(1).map((item) => (
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
            <span className="section-kicker">Giải đáp nhanh</span>
            <h2 id="faq-heading">Câu Hỏi Thường Gặp</h2>
            <p>Giải đáp những thắc mắc phổ biến của khách hàng khi thuê xe.</p>
          </div>

          <div className="faq-list">
            {faqItems.map((item) => (
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
          <span className="section-kicker section-kicker--light">Sẵn sàng khởi hành</span>
          <h2 id="contact-cta-heading">Bạn Cần Thuê Xe Cho Chuyến Đi Sắp Tới?</h2>
          <p>
            Hãy liên hệ ngay với chúng tôi để nhận được tư vấn tận tình và báo giá tốt nhất.
          </p>

          <div className="contact-cta-section__actions">
            <a className="contact-cta-button contact-cta-button--solid" href="tel:+84916012589">
              <FontAwesomeIcon type="phone" />
              <span>Gọi Hotline: 0916 012 589</span>
            </a>

            <a
              className="contact-cta-button contact-cta-button--outline"
              href="https://zalo.me/84916012589"
            >
              <FontAwesomeIcon type="chat" />
              <span>Chat Zalo</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div className="section-shell site-footer__inner">
          <div className="site-footer__grid">
            <div className="site-footer__brand-block">
              <a className="site-footer__brand" href="#top" aria-label="Khánh Linh Trans">
                Khánh Linh Trans
              </a>
              <p className="site-footer__description">
                Premium Tourist Transportation Services. Mang đến giải pháp di chuyển an toàn, tiện
                lợi và đẳng cấp.
              </p>

              <div className="site-footer__social" aria-label="Kênh thương hiệu">
                {footerSocialLinks.map((item) => (
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
              <h2 className="site-footer__heading">DỊCH VỤ</h2>
              <nav className="site-footer__nav" aria-label="Dịch vụ footer">
                {footerServices.map((item) => (
                  <a key={item.label} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="site-footer__column">
              <h2 className="site-footer__heading">HỖ TRỢ</h2>
              <nav className="site-footer__nav" aria-label="Hỗ trợ footer">
                {footerSupportLinks.map((item) => (
                  <a key={item.label} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="site-footer__column">
              <h2 className="site-footer__heading">LIÊN HỆ</h2>
              <div className="site-footer__contact-list">
                <div className="site-footer__contact-item">
                  <span className="site-footer__contact-icon">
                    <FontAwesomeIcon type="location" />
                  </span>
                  <span>Hà Nội, Việt Nam</span>
                </div>

                <div className="site-footer__contact-item">
                  <span className="site-footer__contact-icon">
                    <FontAwesomeIcon type="phone" />
                  </span>
                  <a href="tel:+84916012589">+84 916 012 589</a>
                </div>

                <div className="site-footer__contact-item">
                  <span className="site-footer__contact-icon">
                    <FontAwesomeIcon type="mail" />
                  </span>
                  <a href="mailto:contact@khanhlinhtrans.com">contact@khanhlinhtrans.com</a>
                </div>
              </div>
            </div>
          </div>

          <div className="site-footer__bottom">
            <p>© 2024 Khánh Linh Trans. Premium Tourist Transportation Services.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
