"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BlockEditor from "./BlockEditor";
import { BlogBlock, LocalizedBlocks } from "../../components/blog/types";
import "./blog-admin.css";

type LocalizedText = {
  vi: string;
  en: string;
};

type NewsItem = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  thumbnail: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
};

type NewsFormData = {
  slug?: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  blocks: LocalizedBlocks;
  thumbnail: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
};

export default function AdminBlogPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCardFilters, setActiveCardFilters] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  function toggleCardFilter(filterKey: string) {
    if (filterKey === "all") {
      if (activeCardFilters.includes("all") || activeCardFilters.length === 0) {
        setActiveCardFilters([]);
      } else {
        setActiveCardFilters(["all"]);
      }
      return;
    }

    let newFilters = activeCardFilters.filter((f) => f !== "all");
    if (newFilters.includes(filterKey)) {
      newFilters = newFilters.filter((f) => f !== filterKey);
    } else {
      newFilters.push(filterKey);
    }
    setActiveCardFilters(newFilters);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<"vi" | "en">("vi");
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<NewsFormData>({
    title: { vi: "", en: "" },
    excerpt: { vi: "", en: "" },
    blocks: { vi: [], en: [] },
    thumbnail: "",
    category: "Kinh nghiệm du lịch",
    status: "published",
    featured: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("admin_username") || "";
    const savedPass = localStorage.getItem("admin_password") || "";
    if (savedUser && savedPass) {
      setUsername(savedUser);
      setPassword(savedPass);
      setIsLoggedIn(true);
      fetchAdminPosts(savedUser, savedPass);
    }
  }, []);

  function getHeaders(user = username, pass = password) {
    return {
      "Content-Type": "application/json",
      "x-admin-username": user,
      "x-admin-password": pass,
    };
  }

  async function fetchAdminPosts(user = username, pass = password) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", {
        headers: getHeaders(user, pass),
      });
      const json = await res.json();
      if (json.success) {
        setPosts(json.data || []);
      } else {
        if (res.status === 401) {
          setIsLoggedIn(false);
        }
      }
    } catch (err) {
      console.error("Error fetching admin blog posts:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;
    localStorage.setItem("admin_username", username);
    localStorage.setItem("admin_password", password);
    setIsLoggedIn(true);
    fetchAdminPosts(username, password);
  }

  function openNewModal() {
    setEditingSlug(null);
    setFormData({
      title: { vi: "", en: "" },
      excerpt: { vi: "", en: "" },
      blocks: { vi: [], en: [] },
      thumbnail: "",
      category: "Kinh nghiệm du lịch",
      status: "published",
      featured: false,
    });
    setActiveFormTab("vi");
    setIsModalOpen(true);
  }

  async function openEditModal(slug: string) {
    setEditingSlug(slug);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog/${slug}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const item = json.data;
        setFormData({
          slug: item.slug,
          title: item.title || { vi: "", en: "" },
          excerpt: item.excerpt || { vi: "", en: "" },
          blocks: item.blocks || { vi: [], en: [] },
          thumbnail: item.thumbnail || "",
          category: item.category || "Kinh nghiệm du lịch",
          status: item.status || "published",
          featured: Boolean(item.featured),
        });
        setActiveFormTab("vi");
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Error fetching post detail:", err);
      alert("Không thể tải thông tin bài viết.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/admin/blog/upload", {
        method: "POST",
        headers: {
          "x-admin-username": username,
          "x-admin-password": password,
        },
        body,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setFormData((prev) => ({ ...prev, thumbnail: json.url }));
      } else {
        alert(json.error || "Tải ảnh thất bại.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Lỗi khi tải ảnh lên.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.vi && !formData.title.en) {
      alert("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    try {
      const isEdit = Boolean(editingSlug);
      const url = isEdit ? `/api/admin/blog/${editingSlug}` : "/api/admin/blog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        alert(isEdit ? "Cập nhật bài viết thành công!" : "Tạo bài viết mới thành công!");
        setIsModalOpen(false);
        fetchAdminPosts();
      } else {
        alert(json.error || "Lưu bài viết thất bại.");
      }
    } catch (err) {
      console.error("Error saving post:", err);
      alert("Lỗi hệ thống khi lưu bài viết.");
    }
  }

  async function handleDeletePost(slug: string, titleStr: string) {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${titleStr}"?`)) return;

    try {
      const res = await fetch(`/api/admin/blog/${slug}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        fetchAdminPosts();
      } else {
        alert(json.error || "Xóa bài viết thất bại.");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Lỗi khi xóa bài viết.");
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="admin-blog-login">
        <form className="admin-blog-login-card" onSubmit={handleLogin}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🔐</div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Quản Trị Blog CMS
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: 4 }}>
              Vui lòng đăng nhập để quản lý bài viết
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">Tài khoản Admin</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập..."
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>
          <button type="submit" className="admin-btn-primary" style={{ width: "100%", marginTop: 10 }}>
            Đăng Nhập Quản Trị
          </button>
        </form>
      </div>
    );
  }

  const filteredPosts = posts
    .filter((p) => {
      const titleVi = p.title.vi || "";
      const titleEn = p.title.en || "";
      const matchesSearch =
        titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeCardFilters.length === 0 || activeCardFilters.includes("all")) {
        return true;
      }

      const hasPublished = activeCardFilters.includes("published");
      const hasDraft = activeCardFilters.includes("draft");
      const hasFeatured = activeCardFilters.includes("featured");

      let statusMatch = true;
      if (hasPublished && !hasDraft) {
        statusMatch = p.status === "published";
      } else if (hasDraft && !hasPublished) {
        statusMatch = p.status === "draft";
      } else if (hasPublished && hasDraft) {
        statusMatch = p.status === "published" || p.status === "draft";
      }

      let featuredMatch = true;
      if (hasFeatured) {
        featuredMatch = p.featured === true;
      }

      return statusMatch && featuredMatch;
    })
    .sort((a, b) => {
      const timeA = new Date(a.publishedAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.publishedAt || b.updatedAt || 0).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const draftPosts = posts.filter((p) => p.status === "draft").length;
  const featuredPosts = posts.filter((p) => p.featured).length;

  const isAllActive = activeCardFilters.includes("all") || activeCardFilters.length === 0;
  const isPublishedActive = activeCardFilters.includes("published");
  const isDraftActive = activeCardFilters.includes("draft");
  const isFeaturedActive = activeCardFilters.includes("featured");

  return (
    <div className="admin-blog-page">
      {/* Header Bar */}
      <header className="admin-blog-header">
        <div className="admin-blog-header-inner">
          <div>
            <div className="admin-blog-title-badge">🚀 CMS Block Notion / Gutenberg</div>
            <h1 className="admin-blog-title">Hệ Thống Quản Trị Blog</h1>
            <p className="admin-blog-sub">
              Soạn thảo bài viết chuẩn Notion / Gutenberg chuyên nghiệp (Đa ngôn ngữ VI / EN)
            </p>
          </div>
          <div className="admin-header-actions">
            <Link href="/blog" target="_blank" className="admin-btn-secondary">
              👁️ Xem Blog User
            </Link>
            <Link href="/admin" className="admin-btn-secondary">
              ⚙️ Dashboard Chính
            </Link>
            <button type="button" className="admin-btn-primary" onClick={openNewModal}>
              ➕ Viết Bài Mới
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-blog-container">
        {/* Stats Filter Cards */}
        <div className="admin-blog-stats">
          <div
            className={`admin-stat-card ${
              isAllActive ? "admin-stat-card--active admin-stat-card--active-all" : ""
            }`}
            onClick={() => toggleCardFilter("all")}
            title="Click để hiển thị tất cả bài viết"
          >
            {isAllActive && <span className="admin-stat-badge-check">✓</span>}
            <div>
              <div className="admin-stat-label">Tổng bài viết</div>
              <div className="admin-stat-value">{totalPosts}</div>
            </div>
            <div className="admin-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
              📝
            </div>
          </div>

          <div
            className={`admin-stat-card ${
              isPublishedActive ? "admin-stat-card--active admin-stat-card--active-published" : ""
            }`}
            onClick={() => toggleCardFilter("published")}
            title="Click để bật/tắt lọc bài viết Đã xuất bản"
          >
            {isPublishedActive && (
              <span className="admin-stat-badge-check" style={{ background: "#16a34a" }}>
                ✓
              </span>
            )}
            <div>
              <div className="admin-stat-label">Đã xuất bản</div>
              <div className="admin-stat-value">{publishedPosts}</div>
            </div>
            <div className="admin-stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              ✅
            </div>
          </div>

          <div
            className={`admin-stat-card ${
              isDraftActive ? "admin-stat-card--active admin-stat-card--active-draft" : ""
            }`}
            onClick={() => toggleCardFilter("draft")}
            title="Click để bật/tắt lọc bài viết Bản nháp"
          >
            {isDraftActive && (
              <span className="admin-stat-badge-check" style={{ background: "#d97706" }}>
                ✓
              </span>
            )}
            <div>
              <div className="admin-stat-label">Bản nháp</div>
              <div className="admin-stat-value">{draftPosts}</div>
            </div>
            <div className="admin-stat-icon" style={{ background: "#fffbeb", color: "#d97706" }}>
              ✏️
            </div>
          </div>

          <div
            className={`admin-stat-card ${
              isFeaturedActive ? "admin-stat-card--active admin-stat-card--active-featured" : ""
            }`}
            onClick={() => toggleCardFilter("featured")}
            title="Click để bật/tắt lọc bài viết Nổi bật"
          >
            {isFeaturedActive && (
              <span className="admin-stat-badge-check" style={{ background: "#ca8a04" }}>
                ✓
              </span>
            )}
            <div>
              <div className="admin-stat-label">Nổi bật</div>
              <div className="admin-stat-value">{featuredPosts}</div>
            </div>
            <div className="admin-stat-icon" style={{ background: "#fefce8", color: "#eab308" }}>
              ⭐
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="admin-blog-toolbar">
          <div className="admin-search-wrapper">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              className="admin-blog-search"
              placeholder="Tìm kiếm bài viết theo tiêu đề, slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Sort Controls */}
            <div className="admin-sort-group">
              <button
                type="button"
                className={`admin-sort-btn ${sortOrder === "newest" ? "admin-sort-btn--active" : ""}`}
                onClick={() => setSortOrder("newest")}
                title="Sắp xếp bài viết mới nhất lên đầu"
              >
                ⚡ Mới nhất
              </button>
              <button
                type="button"
                className={`admin-sort-btn ${sortOrder === "oldest" ? "admin-sort-btn--active" : ""}`}
                onClick={() => setSortOrder("oldest")}
                title="Sắp xếp bài viết cũ nhất lên đầu"
              >
                ⌛ Cũ nhất
              </button>
            </div>

            {activeCardFilters.length > 0 && !activeCardFilters.includes("all") && (
              <button
                type="button"
                className="admin-btn-secondary"
                style={{ fontSize: "0.8rem", padding: "6px 14px", height: 36 }}
                onClick={() => setActiveCardFilters([])}
              >
                🔄 Bỏ lọc ({activeCardFilters.length})
              </button>
            )}
          </div>
        </div>

        {/* Posts Table Card */}
        <div className="admin-table-card">
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: "1.2rem", marginBottom: 8 }}>⏳</div>
              Đang tải danh sách bài viết...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🔍</div>
              Không tìm thấy bài viết nào phù hợp.
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Ảnh</th>
                    <th>Tiêu đề (VI / EN)</th>
                    <th style={{ width: 160 }}>Danh mục</th>
                    <th style={{ width: 130 }}>Trạng thái</th>
                    <th style={{ width: 110 }}>Nổi bật</th>
                    <th style={{ width: 110 }}>Ngày đăng</th>
                    <th style={{ width: 140, textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <img
                          src={post.thumbnail || "/images/news/default.jpg"}
                          alt="thumb"
                          className="admin-table-thumb"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80";
                          }}
                        />
                      </td>
                      <td>
                        <div className="admin-post-title-cell">
                          <div className="admin-post-title">{post.title.vi || post.title.en}</div>
                          <div className="admin-post-slug">/{post.slug}</div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-category-badge">{post.category}</span>
                      </td>
                      <td>
                        <span
                          className={`admin-status-badge ${
                            post.status === "published"
                              ? "admin-status-badge--published"
                              : "admin-status-badge--draft"
                          }`}
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-featured-badge ${
                            post.featured ? "admin-featured-badge--active" : "admin-featured-badge--inactive"
                          }`}
                        >
                          {post.featured ? "⭐ Nổi bật" : "—"}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.85rem", color: "#64748b", whiteSpace: "nowrap" }}>
                        {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="admin-action-btns" style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="admin-btn-action"
                            onClick={() => openEditModal(post.slug)}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            type="button"
                            className="admin-btn-action admin-btn-action--delete"
                            onClick={() => handleDeletePost(post.slug, post.title.vi || post.title.en)}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-panel">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingSlug ? "Chỉnh Sửa Bài Viết (Block CMS)" : "Tạo Bài Viết Mới (Block CMS)"}
              </h2>
              <button type="button" className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSavePost} className="admin-modal-form">
              <div className="admin-modal-body">
                {/* Meta Controls */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Danh mục</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="VD: Kinh nghiệm du lịch..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Trạng thái xuất bản</label>
                    <select
                      className="form-input"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "draft" | "published",
                        })
                      }
                    >
                      <option value="published">Xuất bản (Published)</option>
                      <option value="draft">Bản nháp (Draft)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ảnh Thumbnail URL</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1 }}
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                    />
                    <label className="admin-btn-secondary" style={{ cursor: "pointer", height: 42, display: "inline-flex", alignItems: "center" }}>
                      {isUploading ? "Đang tải..." : "Tải ảnh lên"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadImage}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>

                {formData.thumbnail && (
                  <div style={{ marginBottom: 16 }}>
                    <img src={formData.thumbnail} alt="thumb-preview" className="form-thumb-preview" />
                  </div>
                )}

                <div className="form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span>Đánh dấu bài viết Nổi bật (Featured)</span>
                  </label>
                </div>

                {/* Tabs VI / EN */}
                <div className="form-tabs">
                  <button
                    type="button"
                    className={`form-tab-btn ${activeFormTab === "vi" ? "form-tab-btn--active" : ""}`}
                    onClick={() => setActiveFormTab("vi")}
                  >
                    Tiếng Việt (VI)
                  </button>
                  <button
                    type="button"
                    className={`form-tab-btn ${activeFormTab === "en" ? "form-tab-btn--active" : ""}`}
                    onClick={() => setActiveFormTab("en")}
                  >
                    English (EN)
                  </button>
                </div>

                {activeFormTab === "vi" ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Tiêu đề (Tiếng Việt)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.title.vi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            title: { ...formData.title, vi: e.target.value },
                          })
                        }
                        placeholder="Nhập tiêu đề bài viết tiếng Việt..."
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mô tả ngắn (Excerpt - Tiếng Việt)</label>
                      <textarea
                        className="form-textarea"
                        style={{ minHeight: 70 }}
                        value={formData.excerpt.vi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            excerpt: { ...formData.excerpt, vi: e.target.value },
                          })
                        }
                        placeholder="Nhập tóm tắt bài viết..."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nội dung bài viết (Block Editor - Tiếng Việt)</label>
                      <BlockEditor
                        blocks={formData.blocks.vi || []}
                        onChange={(newBlocks) =>
                          setFormData({
                            ...formData,
                            blocks: { ...formData.blocks, vi: newBlocks },
                          })
                        }
                        username={username}
                        password={password}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Tiêu đề (English)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.title.en}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            title: { ...formData.title, en: e.target.value },
                          })
                        }
                        placeholder="Enter article title in English..."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mô tả ngắn (Excerpt - English)</label>
                      <textarea
                        className="form-textarea"
                        style={{ minHeight: 70 }}
                        value={formData.excerpt.en}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            excerpt: { ...formData.excerpt, en: e.target.value },
                          })
                        }
                        placeholder="Enter short article summary..."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nội dung bài viết (Block Editor - English)</label>
                      <BlockEditor
                        blocks={formData.blocks.en || []}
                        onChange={(newBlocks) =>
                          setFormData({
                            ...formData,
                            blocks: { ...formData.blocks, en: newBlocks },
                          })
                        }
                        username={username}
                        password={password}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy Bỏ
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingSlug ? "Cập Nhật Bài Viết" : "Xuất Bản Bài Viết"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
