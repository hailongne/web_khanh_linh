"use client";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useState, type SVGProps } from "react";
import db from "../db.json";
import { translations } from "./translations";
import { VNFlag, USFlag } from "./flag-icons";

const GlobeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const ChevronDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchMoved, setTouchMoved] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // If viewport is wide, ensure classes/styles are cleared.
    if (window.innerWidth > 900) {
      html.classList.remove("is-menu-open");
      body.classList.remove("is-menu-open");
      html.style.paddingRight = "";
      body.style.paddingRight = "";
      return;
    }

    // When opening the menu, reserve scrollbar width to avoid layout shift.
    if (isMenuOpen) {
      const prevHtmlPad = html.style.paddingRight || "";
      const prevBodyPad = body.style.paddingRight || "";
      const scrollbarWidth = window.innerWidth - html.clientWidth;
      if (scrollbarWidth > 0) {
        html.style.paddingRight = `${scrollbarWidth}px`;
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
      html.classList.add("is-menu-open");
      body.classList.add("is-menu-open");

      return () => {
        html.classList.remove("is-menu-open");
        body.classList.remove("is-menu-open");
        html.style.paddingRight = prevHtmlPad;
        body.style.paddingRight = prevBodyPad;
      };
    }

    // Ensure menu classes/styles are removed when closed.
    html.classList.remove("is-menu-open");
    body.classList.remove("is-menu-open");
    html.style.paddingRight = "";
    body.style.paddingRight = "";
    return;
  }, [isMenuOpen]);

  const handleToggleMenu = () => {
    setIsMenuOpen((currentState) => !currentState);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const handleTouchStart = (e: any) => {
    if (!isMenuOpen) return;
    const t = e.touches[0];
    setTouchStartX(t.clientX);
    setTouchStartY(t.clientY);
    setTouchMoved(false);
  };

  const handleTouchMove = (e: any) => {
    if (touchStartX === null || touchStartY === null) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    // if horizontal movement greater than vertical, mark moved
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      setTouchMoved(true);
    }
  };

  const handleTouchEnd = (e: any) => {
    if (!touchMoved || touchStartX === null) {
      setTouchStartX(null);
      setTouchStartY(null);
      setTouchMoved(false);
      return;
    }
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    // swipe right to close (user drags from right to left? for right-panel drawer, swipe right-to-left closes?)
    // Our drawer is on the right; closing swipe is to the right-to-left? We'll close on left swipe (dx < -50) or right swipe (dx > 50) conservatively.
    if (dx > 50 || dx < -50) {
      handleCloseMenu();
    }
    setTouchStartX(null);
    setTouchStartY(null);
    setTouchMoved(false);
  };

  type ContactInfo = {
    phone: string;
    zalo: string;
    email: string;
    address: string;
  };

  const contacts = (db as any).contacts as ContactInfo;
  const t = (translations as any)[lang] ?? translations.vi;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

        <div className="site-header__right">
          <div className="site-header__actions">
            <a className="site-header__cta" href="#contact-cta-heading">
              {t.header.cta}
            </a>
            {/* Language toggle button */}
            <button
              type="button"
              className="site-header__lang-toggle"
              aria-label={lang === "vi" ? "Chuyển sang Tiếng Anh" : "Switch to Vietnamese"}
              onClick={() => onToggleLang?.()}
            >
              {lang === "vi" ? (
                <>
                  <span className="site-header__lang-icon site-header__lang-icon--flag">
                    <VNFlag width={24} height={24} />
                  </span>
                  <span className="site-header__lang-label"> Tiếng Việt</span>
                </>
              ) : (
                <>
                  <span className="site-header__lang-icon">
                    <GlobeIcon />
                  </span>
                  <span className="site-header__lang-label"> English</span>
                </>
              )}
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
      </div>

      {mounted && createPortal(
        <>
          <button
            type="button"
            className={`site-header__menu-backdrop${isMenuOpen ? " is-open" : ""}`}
            aria-label="Đóng menu điều hướng"
            aria-hidden={!isMenuOpen}
            tabIndex={isMenuOpen ? 0 : -1}
            onClick={handleCloseMenu}
          />

          <aside
            className={`site-header__menu-panel${isMenuOpen ? " is-open" : ""}`}
            id="site-header-menu"
            aria-hidden={!isMenuOpen}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="site-header__menu-head">
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
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="site-header__drawer-actions">
              <a className="site-header__phone" href={`tel:${contacts.phone.replace(/\s+/g, "")}`}>
                {contacts.phone}
              </a>
              <a className="site-header__cta" href="#contact-cta-heading">
                {t.header.cta}
              </a>
              <button
                type="button"
                className="site-header__drawer-lang-toggle"
                aria-label={lang === "vi" ? "Chuyển sang Tiếng Anh" : "Switch to Vietnamese"}
                onClick={() => onToggleLang?.()}
              >
                {lang === "vi" ? (
                  <>
                    <span className="site-header__lang-icon site-header__lang-icon--flag">
                      <VNFlag width={24} height={24} />
                    </span>
                    <span className="site-header__lang-label"> Tiếng Việt</span>
                  </>
                ) : (
                  <>
                    <span className="site-header__lang-icon">
                      <GlobeIcon />
                    </span>
                    <span className="site-header__lang-label"> English</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </>,
        document.body
      )}
    </header>
  );
}
