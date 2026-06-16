"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useState, type SVGProps } from "react";
import { translations } from "./translations";
import { VNFlag, USFlag } from "./flag-icons";

const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
    <path d="M3 6h18" />
    <path d="M3 12h18" />
    <path d="M3 18h18" />
  </svg>
);

const XIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

type HeaderLink = {
  label: string;
  href: string;
  active?: boolean;
};

type SiteHeaderProps = {
  links: HeaderLink[];
  // current language code ('vi' | 'en') — used to render the flag icon
  lang?: string;
  // callback to toggle language (handled by parent)
  onToggleLang?: () => void;
};

export function SiteHeader({ links, lang = "vi", onToggleLang }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useLayoutEffect(() => {
    if (window.innerWidth > 640) {
      document.documentElement.classList.remove("is-menu-open");
      document.body.classList.remove("is-menu-open");
      return;
    }

    document.documentElement.classList.toggle("is-menu-open", isMenuOpen);
    document.body.classList.toggle("is-menu-open", isMenuOpen);

    return () => {
      document.documentElement.classList.remove("is-menu-open");
      document.body.classList.remove("is-menu-open");
    };
  }, [isMenuOpen]);

  const handleToggleMenu = () => {
    setIsMenuOpen((currentState) => !currentState);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const t = (translations as any)[lang] ?? translations.vi;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__brand" href="#top" aria-label={t.header.brand} onClick={handleCloseMenu}>
          <Image
            className="site-header__logo"
            src="/images/logoKhanhLinhFull.png"
            alt="Khanh Linh Trans"
            width={320}
            height={64}
            priority
          />
        </a>

        <nav className="site-header__nav" aria-label="Main navigation">
          {links.map((item) => {
            const isExternal = item.href.startsWith("http");
            return (
              <a
                key={item.label}
                href={item.href}
                className={item.active ? "is-active" : undefined}
                aria-current={item.active ? "page" : undefined}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="site-header__actions">
          <a className="site-header__phone" href={`tel:${t.header.phone.replace(/\s+/g, "")}`}>
            {t.header.phone}
          </a>
          <a className="site-header__cta" href="#contact">
            {t.header.cta}
          </a>
          {/* Language toggle button: shows target flag (🇬🇧 when current is 'vi', 🇻🇳 when current is 'en') */}
          <button
            type="button"
            className="site-header__lang-toggle"
            aria-label={lang === "vi" ? "Chuyển sang Tiếng Anh" : "Switch to Vietnamese"}
            onClick={() => onToggleLang?.()}
            style={{ padding: "4px", background: "transparent", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
            {lang === "vi" ? <USFlag width={60} height={31.5} /> : <VNFlag width={60} height={40} />}
          </button>
        </div>

        <button
          type="button"
          className={`site-header__menu-toggle${isMenuOpen ? " is-open" : ""}`}
          aria-expanded={isMenuOpen}
          aria-controls="site-header-menu"
          aria-label={isMenuOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
          onClick={handleToggleMenu}
        >
          {isMenuOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      <button
        type="button"
        className={`site-header__menu-backdrop${isMenuOpen ? " is-open" : ""}`}
        aria-label="Dong menu dieu huong"
        aria-hidden={!isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={handleCloseMenu}
      />

      <aside
        className={`site-header__menu-panel${isMenuOpen ? " is-open" : ""}`}
        id="site-header-menu"
        aria-hidden={!isMenuOpen}
      >
        <div className="site-header__menu-head">
          <a className="site-header__menu-brand" href="#top" aria-label={t.header.brand} onClick={handleCloseMenu}>
            <Image className="site-header__logo" src="/images/logoKhanhLinh.png" alt="Khanh Linh Trans" width={220} height={44} priority />
          </a>

          <button
            type="button"
            className="site-header__menu-close"
            aria-label="Đóng menu điều hướng"
            onClick={handleCloseMenu}
          >
            <XIcon />
          </button>
        </div>

        <nav className="site-header__drawer-nav" aria-label="Mobile navigation">
          {links.map((item) => {
            const isExternal = item.href.startsWith("http");
            return (
              <a
                key={`mobile-${item.label}`}
                href={item.href}
                className={item.active ? "is-active" : undefined}
                aria-current={item.active ? "page" : undefined}
                onClick={handleCloseMenu}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="site-header__drawer-actions">
          <a className="site-header__phone" href={`tel:${t.header.phone.replace(/\s+/g, "")}`} onClick={handleCloseMenu}>
            {t.header.phone}
          </a>
          <a className="site-header__cta" href="#contact" onClick={handleCloseMenu}>
            {t.header.cta}
          </a>
        </div>
      </aside>
    </header>
  );
}
