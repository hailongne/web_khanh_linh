"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function BlogHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [searchValue, setSearchValue] = useState(searchParams?.get("search") || "");

  // Sync search input with URL search param
  useEffect(() => {
    const initialSearch = searchParams?.get("search") || "";
    Promise.resolve().then(() => setSearchValue(initialSearch));
  }, [searchParams]);

  // Fetch official categories list from Single Source of Truth (/api/categories)
  useEffect(() => {
    let isMounted = true;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch((err) => console.error("Error loading blog categories:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Lock body scroll when sidebar drawer is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const activeCategory = searchParams?.get("category") || "all";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }

    startTransition(() => {
      router.push(`/blog?${params.toString()}`);
    });
  };

  const handleSelectCategory = (catName: string) => {
    setIsSidebarOpen(false);
    const params = new URLSearchParams();
    if (catName !== "all") {
      params.set("category", catName);
    }
    const currentSearch = searchParams?.get("search");
    if (currentSearch) {
      params.set("search", currentSearch);
    }

    startTransition(() => {
      router.push(`/blog?${params.toString()}`);
    });
  };

  const handleClearFilter = () => {
    setIsSidebarOpen(false);
    setSearchValue("");
    startTransition(() => {
      router.push("/blog");
    });
  };

  return (
    <>
      <header className="blog-reader-header">
        <div className="blog-reader-header-inner">
          {/* Logo & Brand */}
          <Link href="/blog" className="blog-reader-brand" onClick={() => setIsSidebarOpen(false)}>
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

          {/* Search Box on Header */}
          <form className="blog-header-search" onSubmit={handleSearchSubmit}>
            <svg
              className="blog-header-search-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="blog-header-search-input"
              placeholder="Tìm kiếm bài viết..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <button
                type="button"
                className="blog-header-search-clear"
                onClick={() => {
                  setSearchValue("");
                  const params = new URLSearchParams(searchParams?.toString() || "");
                  params.delete("search");
                  router.push(pathname === "/blog" ? `/blog?${params.toString()}` : "/blog");
                }}
                aria-label="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </form>

          {/* Header Action Buttons */}
          <div className="blog-reader-header-actions">
            <Link href="/" className="blog-reader-back-site">
              ← <span className="blog-reader-back-text">Trang chủ</span>
            </Link>

            {/* Subtle Minimal 3-Bar Hamburger Menu Button */}
            <button
              type="button"
              className={`blog-reader-menu-btn ${isSidebarOpen ? "is-active" : ""}`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Mở danh mục bài viết"
              title="Danh mục bài viết"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Drawer Modal */}
      {isSidebarOpen && (
        <div className="blog-sidebar-overlay">
          <div className="blog-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
          <aside className="blog-sidebar-drawer" aria-label="Menu bài viết">
            <div className="blog-sidebar-header">
              <div className="blog-sidebar-title-group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E5CAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <h3>Danh Mục Bài Viết</h3>
              </div>
              <button
                type="button"
                className="blog-sidebar-close-btn"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Đóng menu"
              >
                ✕
              </button>
            </div>

            <div className="blog-sidebar-body">
              {/* Mobile Search inside Drawer */}
              <form className="blog-sidebar-search" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button type="submit" className="blog-sidebar-search-btn">
                  Tìm
                </button>
              </form>

              {/* Main Categories Section (Official Categories from Single Source of Truth) */}
              <div className="blog-sidebar-section">
                <h4 className="blog-sidebar-heading">CHỦ ĐỀ BÀI VIẾT</h4>
                <nav className="blog-sidebar-nav">
                  <Link
                    href="/blog"
                    className={`blog-sidebar-item ${pathname === "/blog" && !searchParams?.get("category") && !searchParams?.get("filter") ? "is-active" : ""}`}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span className="blog-sidebar-item-label">Tất cả bài viết</span>
                  </Link>

                  {categories.map((cat) => {
                    const isCatActive =
                      pathname === `/blog/category/${cat.slug}` ||
                      searchParams?.get("category") === cat.name ||
                      searchParams?.get("category") === cat.slug;

                    return (
                      <Link
                        key={cat.id || cat.slug}
                        href={`/blog/category/${cat.slug}`}
                        className={`blog-sidebar-item ${isCatActive ? "is-active" : ""}`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        <span className="blog-sidebar-item-label">{cat.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Links Section */}
              <div className="blog-sidebar-section">
                <h4 className="blog-sidebar-heading">LIÊN KẾT NHANH</h4>
                <nav className="blog-sidebar-nav">
                  <Link
                    href="/blog/latest"
                    className={`blog-sidebar-item ${pathname === "/blog/latest" || searchParams?.get("filter") === "latest" ? "is-active" : ""}`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="blog-sidebar-item-label">Bài viết mới nhất</span>
                  </Link>
                  <Link href="/" className="blog-sidebar-item" onClick={() => setIsSidebarOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span className="blog-sidebar-item-label">Trang chủ Khánh Linh Trans</span>
                  </Link>
                  <Link href="/#sales" className="blog-sidebar-item" onClick={() => setIsSidebarOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span className="blog-sidebar-item-label">Báo giá & Liên hệ đặt xe</span>
                  </Link>
                </nav>
              </div>
            </div>

            <div className="blog-sidebar-footer">
              <p>© Khánh Linh Trans Blog</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
