"use client";

import React, { useState } from "react";
import Image from "next/image";

type FleetCategory = { id: string; label: string };

const fleetCategories: FleetCategory[] = [
  { id: "all", label: "Tất cả" },
  { id: "4-7", label: "Xe 4-7 chỗ" },
  { id: "16", label: "Xe 16 chỗ" },
  { id: "29", label: "Xe 29 chỗ" },
  { id: "45", label: "Xe 45 chỗ" }
];

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

  const fleetItems: FleetItem[] = [
    // Xe 4-7 chỗ
    {
      categoryId: "4-7",
      category: "Xe 4-7 chỗ",
      name: "Xe 7 chỗ",
      badge: "7 chỗ",
      description: "Xe gia đình, tiện nghi, phù hợp di chuyển nhóm nhỏ.",
      price: "Từ 800k/ngày",
      image: "/images/7.png",
      specs: [
        { label: "7 ghế", icon: "seat" },
        { label: "A/C", icon: "comfort" },
        { label: "Hành lý vừa", icon: "storage" }
      ]
    },
    {
      categoryId: "4-7",
      category: "Xe 4-7 chỗ",
      name: "Xe 4 chỗ",
      badge: "4 chỗ",
      description: "Xe 4 chỗ cao cấp, thoải mái cho gia đình và đối tác.",
      price: "Từ 900k/ngày",
      image: "/images/4.png",
      specs: [
        { label: "4 ghế", icon: "seat" },
        { label: "A/C", icon: "comfort" },
        { label: "Khoang rộng", icon: "storage" }
      ]
    },
    {
      categoryId: "4-7",
      category: "Xe 4-7 chỗ",
      name: "Xe 7 chỗ (Ảnh đính kèm)",
      badge: "7 chỗ",
      description: "Mẫu 7 chỗ tiện nghi (ảnh đính kèm).",
      price: "Từ 850k/ngày",
      image: "/images/7.webp",
      specs: [
        { label: "7 ghế", icon: "seat" },
        { label: "A/C", icon: "comfort" },
        { label: "Hành lý vừa", icon: "storage" }
      ]
    },

    // Xe 16 chỗ
    {
      categoryId: "16",
      category: "Xe 16 chỗ",
      name: "Ford Transit",
      badge: "16 chỗ",
      description:
        "Lựa chọn cân bằng cho gia đình, doanh nghiệp nhỏ và các chuyến đi ngắn với khả năng vận hành êm, điều hòa tốt.",
      price: "1.200k/ngày",
      image: "/images/16.png",
      specs: [
        { label: "16 ghế", icon: "seat" },
        { label: "2 dàn lạnh", icon: "comfort" },
        { label: "Khoang vừa", icon: "storage" }
      ]
    },
    {
      categoryId: "16",
      category: "Xe 16 chỗ",
      name: "Mercedes Sprinter",
      badge: "16 chỗ",
      description: "Xe ghế da, phù hợp hành trình dài và khách doanh nghiệp.",
      price: "Từ 1.500k/ngày",
      image: "/images/16-2.png",
      specs: [
        { label: "16 ghế", icon: "seat" },
        { label: "A/C", icon: "comfort" },
        { label: "Tiện nghi cao", icon: "storage" }
      ]
    },

    // Xe 29 chỗ
    {
      categoryId: "29",
      category: "Xe 29 chỗ",
      name: "Hyundai County",
      badge: "29 chỗ",
      description: "Xe trung bình, phù hợp cho đoàn vừa và nhỏ.",
      price: "Từ 2.500k/ngày",
      image: "/images/29.png",
      specs: [
        { label: "29 ghế", icon: "seat" },
        { label: "A/C", icon: "comfort" },
        { label: "Khoang lớn", icon: "storage" }
      ]
    },
    {
      categoryId: "29",
      category: "Xe 29 chỗ",
      name: "Thaco Town",
      badge: "29 chỗ",
      description: "Xe phục vụ đoàn vừa, kinh tế và ổn định.",
      price: "Từ 2.300k/ngày",
      image: "/images/29-2.png",
      specs: [
        { label: "29 ghế", icon: "seat" },
        { label: "A/C", icon: "comfort" },
        { label: "Khoang đồ vừa", icon: "storage" }
      ]
    },

    // Xe 45 chỗ
    {
      categoryId: "45",
      category: "Xe 45 chỗ",
      name: "Hyundai Universe",
      badge: "45 chỗ",
      description:
        "Dòng xe khách cao cấp cỡ lớn, không gian rộng rãi, ghế ngả êm ái và phù hợp cho những hành trình du lịch hoặc đưa đón đoàn đông.",
      price: "Liên hệ",
      image: "/images/45.png",
      specs: [
        { label: "45 ghế ngả", icon: "seat" },
        { label: "Có A/C", icon: "comfort" },
        { label: "Khoang lớn", icon: "storage" }
      ]
    },
    {
      categoryId: "45",
      category: "Xe 45 chỗ",
      name: "Xe 45 chỗ",
      badge: "45 chỗ",
      description: "Xe lớn, phù hợp đoàn đông, an toàn cho tuyến dài.",
      price: "Liên hệ",
      image: "/images/45-2.png",
      specs: [
        { label: "45 ghế", icon: "seat" },
        { label: "A/C", icon: "comfort" },
        { label: "Khoang rộng", icon: "storage" }
      ]
    }
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

  export default function FleetSection() {
    const [active, setActive] = useState<string>(fleetCategories[0].id);

    const filteredItems = active === "all" ? fleetItems : fleetItems.filter((item) => item.categoryId === active);

    if (process.env.NODE_ENV === "development") {
      console.debug("[FleetSection] active state:", {
        active,
        totalItems: fleetItems.length,
        filteredCount: filteredItems.length,
        filteredCategories: Array.from(new Set(filteredItems.map((i) => i.category)))
      });
    }

    return (
      <section className="fleet-section" id="fleet">
        <div className="section-shell">
          <div className="fleet-section__header">
            <div className="fleet-section__intro">
              <span className="section-kicker">Đội xe linh hoạt</span>
              <h2>Dòng Xe Nổi Bật</h2>
              <p>Khám phá các dòng xe đa dạng, đáp ứng linh hoạt cho mọi nhu cầu di chuyển.</p>
            </div>

            <div className="fleet-section__filters" role="tablist" aria-label="Danh mục đội xe">
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

          {(active === "all" || active === "4-7") ? (
            <div className="fleet-scroll" aria-live="polite">
              {filteredItems.length === 0 ? (
                <div className="fleet-empty">Không có xe phù hợp</div>
              ) : (
                filteredItems.map((item) => (
                  <article className="fleet-card" key={item.name}>
                    <div className="fleet-card__media">
                      <Image src={item.image} alt={item.name} fill sizes="(max-width: 900px) 100vw, 50vw" />
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
                ))
              )}
            </div>
          ) : (
            <div className="fleet-grid" aria-live="polite">
              {filteredItems.length === 0 ? (
                <div className="fleet-empty">Không có xe phù hợp</div>
              ) : (
                filteredItems.map((item) => (
                  <article className="fleet-card" key={item.name}>
                    <div className="fleet-card__media">
                      <Image src={item.image} alt={item.name} fill sizes="(max-width: 900px) 100vw, 50vw" />
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
                ))
              )}
            </div>
          )}
        </div>
      </section>
    );
  }
