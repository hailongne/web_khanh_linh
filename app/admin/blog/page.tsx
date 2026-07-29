"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "../AdminShell";
import BlockEditor from "./BlockEditor";
import BlockRenderer from "../../components/blog/BlockRenderer";
import ToastContainer from "../../components/toast/ToastContainer";
import { showToast } from "../../components/toast/toastService";
import { BlogBlock, LocalizedBlocks } from "../../components/blog/types";
import "../../user.css";
import "../../blog/blog.css";
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
  authorId?: string;
  author?: { displayName: string; avatar: string };
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
  authorId?: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Modal & View Modes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<"vi" | "en">("vi");
  const [viewMode, setViewMode] = useState<"editor" | "split" | "preview">("split");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Media Picker for Thumbnail
  const [isThumbMediaPickerOpen, setIsThumbMediaPickerOpen] = useState(false);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

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
    fetchAdminPosts();
  }, []);

  // Listen for ESC key to close open popups
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isThumbMediaPickerOpen) {
          setIsThumbMediaPickerOpen(false);
        } else if (isModalOpen) {
          setIsModalOpen(false);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, isThumbMediaPickerOpen]);

  async function fetchAdminPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const json = await res.json();
      if (json.success) {
        setPosts(json.data || []);
      }
    } catch {
      showToast("error", "Lỗi nạp danh sách bài viết.");
    } finally {
      setLoading(false);
    }
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
    setViewMode("split");
    setShowUrlInput(false);
    setIsModalOpen(true);
  }

  async function openEditModal(slug: string) {
    setEditingSlug(slug);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog/${slug}`);
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
          authorId: item.authorId
        });
        setActiveFormTab("vi");
        setViewMode("split");
        setShowUrlInput(false);
        setIsModalOpen(true);
      }
    } catch {
      showToast("error", "Không thể tải thông tin bài viết.");
    } finally {
      setLoading(false);
    }
  }

  async function openThumbMediaPicker() {
    setIsThumbMediaPickerOpen(true);
    setLoadingMedia(true);
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      if (json.success) {
        setMediaList(json.data || []);
      }
    } catch {
      showToast("error", "Lỗi nạp danh sách media.");
    } finally {
      setLoadingMedia(false);
    }
  }

  async function handleUploadThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("category", "news");

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setFormData((prev) => ({ ...prev, thumbnail: json.url }));
        showToast("success", "Tải ảnh đại diện thành công.");
      } else {
        showToast("error", json.error || "Tải ảnh thất bại.");
      }
    } catch {
      showToast("error", "Lỗi khi tải ảnh lên.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.vi && !formData.title.en) {
      showToast("error", "Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    try {
      const isEdit = Boolean(editingSlug);
      const url = isEdit ? `/api/admin/blog/${editingSlug}` : "/api/admin/blog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        showToast("success", isEdit ? "Cập nhật bài viết thành công." : "Tạo bài viết mới thành công.");
        setIsModalOpen(false);
        fetchAdminPosts();
      } else {
        showToast("error", json.error || "Không thể lưu bài viết.");
      }
    } catch {
      showToast("error", "Lỗi kết nối máy chủ.");
    }
  }

  async function handleDeletePost(slug: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;

    try {
      const res = await fetch(`/api/admin/blog/${slug}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        showToast("success", "Đã xóa bài viết thành công.");
        fetchAdminPosts();
      } else {
        showToast("error", json.error || "Xóa bài viết thất bại.");
      }
    } catch {
      showToast("error", "Lỗi khi xóa bài viết.");
    }
  }

  const filteredPosts = posts
    .filter((p) => {
      const titleVi = p.title.vi || "";
      const titleEn = p.title.en || "";
      const matchesSearch =
        titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = new Date(a.publishedAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.publishedAt || b.updatedAt || 0).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

  const activeTitle = formData.title[activeFormTab] || "";
  const activeBlocks = formData.blocks[activeFormTab] || [];
  const activeDateStr = new Date().toLocaleDateString(activeFormTab === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  return (
    <AdminShell
      title="Tin tức"
      subtitle="Quản lý bài viết website"
      tag="Quản trị nội dung"
      actions={
        <button type="button" onClick={openNewModal} className="admin-button">
          <i className="fas fa-plus" aria-hidden="true" /> Viết bài mới
        </button>
      }
    >
      <ToastContainer />

      <div className="admin-card">
        {/* Toolbar */}
        <div className="admin-toolbar" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", width: "100%", alignItems: "center" }}>
            <input
              type="text"
              className="admin-form input"
              style={{ width: "280px", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.83rem" }}
              placeholder="Tìm kiếm theo tiêu đề bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.83rem", background: "#fff" }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="Kinh nghiệm du lịch">Kinh nghiệm du lịch</option>
              <option value="Tin tức Khánh Linh">Tin tức Khánh Linh</option>
              <option value="Cẩm nang thuê xe">Cẩm nang thuê xe</option>
              <option value="Khuyến mãi">Khuyến mãi & Ưu đãi</option>
            </select>

            <select
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.83rem", background: "#fff" }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>

            <select
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.83rem", background: "#fff" }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="admin-section">
          {loading ? (
            <div className="admin-table__empty">Đang nạp danh sách bài viết...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="admin-table__empty">Không tìm thấy bài viết nào phù hợp.</div>
          ) : (
            <div className="admin-table">
              <div className="admin-table__row admin-table__header" style={{ gridTemplateColumns: "130px 2.5fr 1fr 1fr 1fr 1fr" }}>
                <div>Ảnh đại diện</div>
                <div>Tiêu đề bài viết</div>
                <div>Danh mục</div>
                <div>Trạng thái</div>
                <div>Cập nhật</div>
                <div style={{ textAlign: "right" }}>Thao tác</div>
              </div>

              {filteredPosts.map((post) => (
                <div key={post.id} className="admin-table__row" style={{ gridTemplateColumns: "130px 2.5fr 1fr 1fr 1fr 1fr", alignItems: "center" }}>
                  <div>
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt={post.title.vi || "thumb"}
                        style={{ width: "120px", height: "70px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.08)" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "120px",
                          height: "70px",
                          borderRadius: "8px",
                          background: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          color: "#94a3b8"
                        }}
                      >
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.85rem" }}>
                      {post.title.vi || "(Chưa có tiêu đề VI)"}
                    </strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                      /{post.slug}
                    </div>
                  </div>
                  <div>
                    <span style={{ padding: "3px 8px", borderRadius: "4px", background: "#f1f5f9", fontSize: "0.78rem", color: "#475569" }}>
                      {post.category}
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: post.status === "published" ? "#dcfce7" : "#fef3c7",
                        color: post.status === "published" ? "#15803d" : "#b45309"
                      }}
                    >
                      {post.status === "published" ? "Xuất bản" : "Nháp"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {new Date(post.updatedAt || post.publishedAt).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="admin-actions" style={{ justifyContent: "flex-end" }}>
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="admin-button admin-button--ghost"
                      style={{ padding: "4px 8px", fontSize: "0.78rem", textDecoration: "none" }}
                      title="Xem trên Web"
                    >
                      Xem
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditModal(post.slug)}
                      className="admin-button admin-button--ghost"
                      style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                      title="Sửa bài viết"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.slug)}
                      className="admin-button admin-button--danger"
                      style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                      title="Xóa bài viết"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Taller 2-Row Sticky Header 50/50 Gutenberg CMS Modal Workspace */}
      {isModalOpen && (
        <>
          <div className="confirm-dialog__overlay" onClick={() => setIsModalOpen(false)} style={{ zIndex: 2000 }} />
          <div
            className="confirm-dialog blog-cms-modal"
            style={{
              zIndex: 2001,
              width: "min(1600px, 96vw)",
              maxWidth: "1600px",
              maxHeight: "94vh",
              display: "flex",
              flexDirection: "column",
              padding: 0,
              overflow: "hidden",
              borderRadius: "16px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.25)"
            }}
          >
            {/* 1. Modal Top Bar Sticky Header (2 Rows, ~96-104px tall) */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                background: "#0f172a",
                color: "#ffffff",
                padding: "16px 28px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                borderBottom: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              {/* Row 1: Title + Slug + Close Button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                  <h2 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 700, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {editingSlug ? "✏️ Chỉnh Sửa Bài Viết CMS" : "➕ Soạn Thảo Bài Viết Mới"}
                  </h2>
                  {formData.slug && (
                    <span style={{ fontSize: "0.82rem", background: "rgba(255,255,255,0.15)", padding: "4px 14px", borderRadius: "12px", color: "#cbd5e1", fontWeight: 600 }}>
                      /{formData.slug}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: "none", border: "none", fontSize: "1.75rem", cursor: "pointer", color: "#94a3b8", padding: 0 }}
                  title="Đóng cửa sổ"
                >
                  &times;
                </button>
              </div>

              {/* Row 2: Language Tabs (Left) + View Modes (Center) + Save Button (Right) */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "12px" }}>
                {/* Language Switcher (Left) */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    className={`admin-button ${activeFormTab === "vi" ? "" : "admin-button--ghost"}`}
                    onClick={() => setActiveFormTab("vi")}
                    style={{ fontSize: "0.84rem", padding: "6px 14px", fontWeight: 600 }}
                  >
                    🇻🇳 Tiếng Việt
                  </button>
                  <button
                    type="button"
                    className={`admin-button ${activeFormTab === "en" ? "" : "admin-button--ghost"}`}
                    onClick={() => setActiveFormTab("en")}
                    style={{ fontSize: "0.84rem", padding: "6px 14px", fontWeight: 600 }}
                  >
                    🇬🇧 English
                  </button>
                </div>

                {/* View Mode Switcher (Center) */}
                <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.1)", padding: "4px", borderRadius: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setViewMode("editor")}
                    style={{
                      padding: "6px 14px",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: viewMode === "editor" ? "#ffffff" : "transparent",
                      color: viewMode === "editor" ? "#0f172a" : "#94a3b8"
                    }}
                  >
                    📝 Full Editor (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("split")}
                    style={{
                      padding: "6px 14px",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: viewMode === "split" ? "#ffffff" : "transparent",
                      color: viewMode === "split" ? "#0f172a" : "#94a3b8"
                    }}
                  >
                    ↔️ Split View (50 / 50)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("preview")}
                    style={{
                      padding: "6px 14px",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: viewMode === "preview" ? "#ffffff" : "transparent",
                      color: viewMode === "preview" ? "#0f172a" : "#94a3b8"
                    }}
                  >
                    👁️ Full Preview (User View)
                  </button>
                </div>

                {/* Sticky Save Button (Right) */}
                <button
                  type="button"
                  onClick={handleSavePost}
                  className="admin-button"
                  style={{ fontSize: "0.86rem", fontWeight: 700, padding: "8px 20px", background: "#2563eb", color: "#fff" }}
                >
                  💾 Lưu & Xuất Bản
                </button>
              </div>
            </div>

            {/* 2. Main Workspace Body (Padding 28px, overflow-x hidden) */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "28px", background: "#f8fafc" }}>
              <form onSubmit={handleSavePost}>
                {/* Metadata Card (Thông tin bài viết) */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "24px",
                    marginBottom: "28px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                  }}
                >
                  <h3 style={{ margin: "0 0 18px", fontSize: "1rem", fontWeight: 700, color: "#1e293b" }}>
                    📌 Thông Tin Bài Viết & Metadata
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "340px minmax(0, 1fr)", gap: "28px", alignItems: "start" }}>
                    {/* Thumbnail Large Preview Box (320x180) */}
                    <div>
                      <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "8px" }}>
                        Ảnh Đại Diện Bài Viết (Thumbnail 320×180)
                      </label>
                      <div
                        style={{
                          width: "320px",
                          height: "180px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          overflow: "hidden",
                          background: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative"
                        }}
                      >
                        {formData.thumbnail ? (
                          <img src={formData.thumbnail} alt="Thumbnail preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                            🖼️ Chưa có ảnh đại diện
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap", width: "320px" }}>
                        <button
                          type="button"
                          className="admin-button"
                          style={{ fontSize: "0.8rem", padding: "5px 12px" }}
                          onClick={openThumbMediaPicker}
                        >
                          🖼️ Chọn từ Media
                        </button>
                        <label className="admin-button admin-button--ghost" style={{ cursor: "pointer", margin: 0, fontSize: "0.8rem", padding: "5px 12px" }}>
                          {isUploading ? "Đang tải..." : "📁 Tải ảnh mới"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadThumbnail}
                            style={{ display: "none" }}
                          />
                        </label>
                        {formData.thumbnail && (
                          <button
                            type="button"
                            className="admin-button admin-button--danger"
                            style={{ fontSize: "0.8rem", padding: "5px 12px" }}
                            onClick={() => setFormData({ ...formData, thumbnail: "" })}
                          >
                            ❌ Xóa
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.78rem", marginTop: "8px", cursor: "pointer", padding: 0 }}
                      >
                        {showUrlInput ? "▲ Ẩn URL ảnh" : "▼ Nhập URL ảnh thủ công"}
                      </button>

                      {showUrlInput && (
                        <input
                          type="text"
                          style={{ width: "320px", marginTop: "6px", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                          placeholder="Dán đường dẫn URL ảnh..."
                          value={formData.thumbnail}
                          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        />
                      )}
                    </div>

                    {/* Metadata Fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <label className="admin-form label">
                          Danh mục
                          <select
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.88rem", background: "#fff" }}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          >
                            <option value="Kinh nghiệm du lịch">Kinh nghiệm du lịch</option>
                            <option value="Tin tức Khánh Linh">Tin tức Khánh Linh</option>
                            <option value="Cẩm nang thuê xe">Cẩm nang thuê xe</option>
                            <option value="Khuyến mãi">Khuyến mãi & Ưu đãi</option>
                          </select>
                        </label>

                        <label className="admin-form label">
                          Trạng thái xuất bản
                          <select
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.88rem", background: "#fff" }}
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                status: e.target.value as "draft" | "published",
                              })
                            }
                          >
                            <option value="published">🟢 Đã xuất bản</option>
                            <option value="draft">🟡 Bản nháp</option>
                          </select>
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "22px" }}>
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            style={{ width: "auto" }}
                          />
                          <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>⭐ Bài viết nổi bật</span>
                        </label>
                      </div>

                      <label className="admin-form label">
                        Tiêu đề bài viết ({activeFormTab === "vi" ? "Tiếng Việt *" : "English *"})
                        <input
                          type="text"
                          style={{ fontSize: "1.15rem", fontWeight: 700, padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                          placeholder={activeFormTab === "vi" ? "Nhập tiêu đề hấp dẫn..." : "Enter English title..."}
                          value={formData.title[activeFormTab]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              title: { ...formData.title, [activeFormTab]: e.target.value },
                            })
                          }
                        />
                      </label>

                      <label className="admin-form label">
                        Tóm tắt ngắn (Excerpt {activeFormTab.toUpperCase()})
                        <textarea
                          rows={2}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", font: "inherit", fontSize: "0.88rem", lineHeight: 1.5 }}
                          placeholder="Mô tả tóm tắt hiển thị trên danh sách bài viết..."
                          value={formData.excerpt[activeFormTab]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              excerpt: { ...formData.excerpt, [activeFormTab]: e.target.value },
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. Block Editor Workspace & Realtime 50/50 Split View */}
                {viewMode === "split" && (
                  <div className="cms-split-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
                    {/* Left: 50% Editor Stream (Full Width Blocks) */}
                    <div style={{ width: "100%" }}>
                      <h3 style={{ margin: "0 0 14px", fontSize: "0.98rem", fontWeight: 700, color: "#1e293b" }}>
                        📝 Khối Soạn Thảo (50% Editor Workspace)
                      </h3>
                      <BlockEditor
                        blocks={activeBlocks}
                        onChange={(newBlocks) =>
                          setFormData({
                            ...formData,
                            blocks: { ...formData.blocks, [activeFormTab]: newBlocks },
                          })
                        }
                      />
                    </div>

                    {/* Right: 50% Live Realtime Preview (Equal 1fr Width & Independent Scroll) */}
                    <div style={{ position: "sticky", top: "20px", width: "100%" }}>
                      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <div style={{ padding: "12px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#2563eb" }}>
                            👁️ Live Preview 50/50 ({activeFormTab.toUpperCase()})
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Giao diện User 100%</span>
                        </div>

                        <div style={{ padding: "20px", maxHeight: "calc(88vh - 120px)", overflowY: "auto", width: "100%" }}>
                          <article className="article-paper-card" style={{ padding: "32px 28px", boxShadow: "none", border: "1px solid rgba(16,33,43,0.06)", borderRadius: "16px", width: "100%" }}>
                            <div className="article-meta">
                              <span className="blog-card__category">{formData.category}</span>
                              <span>•</span>
                              <span>{activeDateStr}</span>
                            </div>

                            <h1 className="article-title">{activeTitle || "(Chưa có tiêu đề)"}</h1>
                            {formData.excerpt[activeFormTab] && (
                              <p className="article-excerpt">{formData.excerpt[activeFormTab]}</p>
                            )}

                            {formData.thumbnail && (
                              <img
                                src={formData.thumbnail}
                                alt={activeTitle}
                                className="article-hero-img"
                              />
                            )}

                            <div className="article-divider-line" />

                            <div className="article-body">
                              <BlockRenderer blocks={activeBlocks} />
                            </div>
                          </article>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === "editor" && (
                  <div style={{ width: "100%" }}>
                    <h3 style={{ margin: "0 0 14px", fontSize: "0.98rem", fontWeight: 700, color: "#1e293b" }}>
                      📝 Khối Soạn Thảo (100% Full Width Editor)
                    </h3>
                    <BlockEditor
                      blocks={activeBlocks}
                      onChange={(newBlocks) =>
                        setFormData({
                          ...formData,
                          blocks: { ...formData.blocks, [activeFormTab]: newBlocks },
                        })
                      }
                    />
                  </div>
                )}

                {viewMode === "preview" && (
                  <div style={{ width: "100%", background: "#f4f8fb", padding: "20px 0" }}>
                    <main className="article-main-container" style={{ margin: "0 auto", padding: 0 }}>
                      <article className="article-paper-card">
                        <div className="article-meta">
                          <span className="blog-card__category">{formData.category}</span>
                          <span>•</span>
                          <span>{activeDateStr}</span>
                        </div>

                        <h1 className="article-title">{activeTitle || "(Chưa có tiêu đề)"}</h1>
                        {formData.excerpt[activeFormTab] && (
                          <p className="article-excerpt">{formData.excerpt[activeFormTab]}</p>
                        )}

                        {formData.thumbnail && (
                          <img
                            src={formData.thumbnail}
                            alt={activeTitle}
                            className="article-hero-img"
                          />
                        )}

                        <div className="article-divider-line" />

                        <div className="article-body">
                          <BlockRenderer blocks={activeBlocks} />
                        </div>
                      </article>
                    </main>
                  </div>
                )}
              </form>
            </div>
          </div>
        </>
      )}

      {/* Thumb Media Picker Modal */}
      {isThumbMediaPickerOpen && (
        <div className="confirm-dialog__overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div className="admin-card" style={{ maxWidth: "850px", width: "90%", maxHeight: "80vh", overflowY: "auto", padding: "1.5rem", position: "relative", zIndex: 10001 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>🖼️ Chọn ảnh đại diện từ Thư viện Media</h3>
              <button
                type="button"
                onClick={() => setIsThumbMediaPickerOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }}
              >
                &times;
              </button>
            </div>

            {loadingMedia ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                <i className="fas fa-spinner fa-spin fa-2x"></i>
                <p style={{ marginTop: "0.5rem" }}>Đang nạp ảnh...</p>
              </div>
            ) : mediaList.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                Chưa có ảnh nào trong thư viện Media.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.85rem" }}>
                {mediaList.map((media) => (
                  <div
                    key={media.url}
                    onClick={() => {
                      setFormData({ ...formData, thumbnail: media.url });
                      setIsThumbMediaPickerOpen(false);
                    }}
                    style={{
                      border: "2px solid #e2e8f0",
                      borderRadius: "6px",
                      overflow: "hidden",
                      cursor: "pointer",
                      backgroundColor: "#fff",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <img src={media.url} alt={media.name} style={{ width: "100%", height: "100px", objectFit: "cover" }} />
                    <div style={{ padding: "0.4rem", fontSize: "0.75rem", wordBreak: "break-all", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {media.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive Styles for Modal Grid */}
      <style jsx global>{`
        @media (max-width: 1400px) and (min-width: 1024px) {
          .cms-split-grid {
            grid-template-columns: 55% calc(45% - 24px) !important;
          }
        }
        @media (max-width: 1023px) {
          .cms-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 767px) {
          .blog-cms-modal {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </AdminShell>
  );
}
