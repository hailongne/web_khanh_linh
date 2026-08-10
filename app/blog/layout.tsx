import { Suspense, type ReactNode } from "react";
import { BlogHeader } from "./BlogHeader";
import "./blog-reader.css";
import "./blog.css";

export const metadata = {
  title: "Khánh Linh Trans | Blog & Cẩm Nang Du Lịch",
  description: "Trang tin tức, cẩm nang du lịch và kinh nghiệm thuê xe từ Khánh Linh Trans.",
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="blog-reader-root">
      <Suspense fallback={
        <header className="blog-reader-header">
          <div className="blog-reader-header-inner">
            <span className="blog-reader-brand-title">Khánh Linh Trans Blog</span>
          </div>
        </header>
      }>
        <BlogHeader />
      </Suspense>

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
