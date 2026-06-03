"use client";

import { useEffect, useLayoutEffect, useState } from "react";

type HeaderLink = {
  label: string;
  href: string;
  active?: boolean;
};

type SiteHeaderProps = {
  links: HeaderLink[];
};

export function SiteHeader({ links }: SiteHeaderProps) {
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

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__brand" href="#top" aria-label="Khanh Linh Trans" onClick={handleCloseMenu}>
          <span className="site-header__brand-name">Khanh Linh Trans</span>
        </a>

        <nav className="site-header__nav" aria-label="Main navigation">
          {links.map((item) => (
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

        <button
          type="button"
          className={`site-header__menu-toggle${isMenuOpen ? " is-open" : ""}`}
          aria-expanded={isMenuOpen}
          aria-controls="site-header-menu"
          aria-label={isMenuOpen ? "Dong menu dieu huong" : "Mo menu dieu huong"}
          onClick={handleToggleMenu}
        >
          <span />
          <span />
          <span />
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
          <a className="site-header__menu-brand" href="#top" aria-label="Khanh Linh Trans" onClick={handleCloseMenu}>
            <span className="site-header__menu-brand-name">Khanh Linh Trans</span>
          </a>

          <button
            type="button"
            className="site-header__menu-close"
            aria-label="Dong menu dieu huong"
            onClick={handleCloseMenu}
          >
            <i className="fa-icon fas fa-times" aria-hidden="true" />
          </button>
        </div>

        <nav className="site-header__drawer-nav" aria-label="Mobile navigation">
          {links.map((item) => (
            <a
              key={`mobile-${item.label}`}
              href={item.href}
              className={item.active ? "is-active" : undefined}
              aria-current={item.active ? "page" : undefined}
              onClick={handleCloseMenu}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-header__drawer-actions">
          <a className="site-header__phone" href="tel:+84916012589" onClick={handleCloseMenu}>
            0916012589
          </a>
          <a className="site-header__cta" href="#contact" onClick={handleCloseMenu}>
            Đặt xe ngay
          </a>
        </div>
      </aside>
    </header>
  );
}
