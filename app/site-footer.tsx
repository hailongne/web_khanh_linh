"use client";

import Image from "next/image";
import Link from "next/link";
import { translations } from "./translations";

type SiteFooterProps = {
  lang?: "vi" | "en";
};

export function SiteFooter({ lang = "vi" }: SiteFooterProps) {
  const t = translations[lang] || translations.vi;

  const siteContacts = {
    phone: "0962 992 555",
    email: "khanhlinhtrans@gmail.com",
    address: "368 Đường Bưởi, Ba Đình, Hà Nội",
  };

  return (
    <footer className="site-footer" id="contact">
      <div className="section-shell site-footer__inner">
        <div className="site-footer__logo-top">
          <Link href="/" aria-label={t.header?.brand || "Khánh Linh Trans"}>
            <Image
              className="site-footer__brand-logo"
              src="/images/logoKhanhLinhFull.png"
              alt={t.header?.brand || "Khánh Linh Trans"}
              width={480}
              height={144}
              priority
            />
          </Link>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__brand-block">
            <p className="site-footer__description">{t.footer?.brandDescription}</p>
          </div>

          <div className="site-footer__column">
            <h2 className="site-footer__heading">{t.footer?.servicesHeading}</h2>
            <nav className="site-footer__nav" aria-label="Dịch vụ footer">
              {t.footer?.services?.map((item: { label: string; href: string }) => (
                <a key={item.label} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="site-footer__column">
            <h2 className="site-footer__heading">{t.footer?.supportHeading}</h2>
            <nav className="site-footer__nav" aria-label="Hỗ trợ footer">
              {t.footer?.supportLinks?.map((item: { label: string; href: string }) => (
                <a key={item.label} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="site-footer__column">
            <h2 className="site-footer__heading">{t.footer?.contactHeading}</h2>
            <div className="site-footer__contact-list">
              <div className="site-footer__contact-item">
                <span className="site-footer__contact-icon">📍</span>
                <span>{siteContacts.address}</span>
              </div>
              <div className="site-footer__contact-item">
                <span className="site-footer__contact-icon">📞</span>
                <a href={`tel:${siteContacts.phone.replace(/\s+/g, "")}`}>{siteContacts.phone}</a>
              </div>
              <div className="site-footer__contact-item">
                <span className="site-footer__contact-icon">✉️</span>
                <a href={`mailto:${siteContacts.email}`}>{siteContacts.email}</a>
              </div>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>{t.footer?.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
