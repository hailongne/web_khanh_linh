import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import "./blog-reader.css";

export const metadata = {
  title: "Khánh Linh Trans | Blog & Cẩm Nang Du Lịch",
  description: "Trang tin tức, cẩm nang du lịch và kinh nghiệm thuê xe từ Khánh Linh Trans.",
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="blog-reader-root">
      {/* Clean Minimal Blog Header (Un-broken Layout) */}
      <header className="blog-reader-header">
        <div className="blog-reader-header-inner">
          <Link href="/blog" className="blog-reader-brand">
            <Image
              src="/images/logoKhanhLinh.png"
              alt="Khánh Linh Trans Logo"
              width={28}
              height={28}
              className="blog-reader-brand-logo"
            />
            <span className="blog-reader-brand-title">Khánh Linh Trans</span>
            <span className="blog-reader-brand-badge">Blog</span>
          </Link>

          <div className="blog-reader-header-actions">
            <Link href="/" className="blog-reader-back-site">
              ← <span className="blog-reader-back-text">Trang chủ</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Reading Viewport */}
      {children}

      {/* Minimal Clean Reader Footer */}
      <footer className="blog-reader-footer">
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} Khánh Linh Trans Blog — Chế độ đọc tập trung.
        </p>
      </footer>
    </div>
  );
}
