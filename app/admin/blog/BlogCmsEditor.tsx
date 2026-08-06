"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Send,
  Sliders,
  Image as ImageIcon,
  Upload,
  Trash2,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from "lucide-react";
import BlockEditor from "./BlockEditor";
import BlockRenderer from "../../components/blog/BlockRenderer";
import ToastContainer from "../../components/toast/ToastContainer";
import { showToast } from "../../components/toast/toastService";
import { LocalizedBlocks } from "../../components/blog/types";
import "../../user.css";
import "../../blog/blog.css";
import "./blog-admin.css";

type LocalizedText = {
  vi: string;
  en: string;
};

export type NewsFormData = {
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

type MediaItem = {
  name: string;
  url: string;
  size?: number;
  folder?: string;
  createdAt?: string;
};

interface BlogCmsEditorProps {
  editingSlug?: string | null;
  initialData?: NewsFormData;
}

export default function BlogCmsEditor({ editingSlug, initialData }: BlogCmsEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(editingSlug);

  const [formData, setFormData] = useState<NewsFormData>(
    initialData || {
      title: { vi: "", en: "" },
      excerpt: { vi: "", en: "" },
      blocks: { vi: [], en: [] },
      thumbnail: "",
      category: "Kinh nghiệm du lịch",
      status: "published",
      featured: false,
    }
  );

  const [activeFormTab, setActiveFormTab] = useState<"vi" | "en">("vi");
  const [previewMinimized, setPreviewMinimized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Drag-to-resize state (width in px, initial 380)
  const [previewWidth, setPreviewWidth] = useState(380);


  // Media Picker
  const [isThumbMediaPickerOpen, setIsThumbMediaPickerOpen] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    if (initialData) {
      Promise.resolve().then(() => setFormData(initialData));
    }
  }, [initialData]);

  // Drag-to-resize: previewWidthRef tracks current width for use inside stable handler
  const previewWidthRef = useRef(380);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = previewWidthRef.current;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function onMouseMove(ev: MouseEvent) {
      if (!containerRef.current) return;
      const dx = startX - ev.clientX;
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const minPreview = 240;
      const maxPreview = containerWidth - 320;
      const newWidth = Math.min(Math.max(startWidth + dx, minPreview), maxPreview);
      previewWidthRef.current = newWidth;
      setPreviewWidth(newWidth);
    }

    function onMouseUp() {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  // Handle ESC key for popups
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isThumbMediaPickerOpen) {
        setIsThumbMediaPickerOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isThumbMediaPickerOpen]);

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

  async function handleSavePost(overrideStatus?: "draft" | "published") {
    const statusToSave = overrideStatus || formData.status;
    const dataToSend = { ...formData, status: statusToSave };

    if (!dataToSend.title.vi && !dataToSend.title.en) {
      showToast("error", "Vui lòng nhập tiêu đề bài viết (Tiếng Việt hoặc English).");
      return;
    }

    setIsSaving(true);
    try {
      const url = isEdit ? `/api/admin/blog/${editingSlug}` : "/api/admin/blog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const json = await res.json();
      if (json.success) {
        showToast(
          "success",
          isEdit ? "Cập nhật bài viết thành công!" : "Tạo bài viết mới thành công!"
        );
        setTimeout(() => {
          router.push("/admin/blog");
        }, 600);
      } else {
        showToast("error", json.error || "Không thể lưu bài viết.");
      }
    } catch {
      showToast("error", "Lỗi kết nối máy chủ khi lưu bài viết.");
    } finally {
      setIsSaving(false);
    }
  }

  const activeTitle = formData.title[activeFormTab] || "";
  const activeBlocks = formData.blocks[activeFormTab] || [];
  const activeDateStr = new Date().toLocaleDateString(activeFormTab === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="cms-editor-layout">
      <ToastContainer />

      {/* Sticky Header Bar */}
      <header className="cms-header">
        <div className="cms-header__left">
          <Link href="/admin/blog" className="cms-header__back-btn" title="Quay lại danh sách bài viết">
            <ArrowLeft size={16} />
            <span>Danh sách bài viết</span>
          </Link>
          <div className="cms-header__divider" />
          <div className="cms-header__title-info">
            <h1 className="cms-header__title">
              {activeTitle || (isEdit ? "Chỉnh sửa bài viết" : "Bài viết mới")}
            </h1>
            {formData.slug && <span className="cms-header__slug">/{formData.slug}</span>}
          </div>
          <span className={`cms-status-badge cms-status-badge--${formData.status}`}>
            {formData.status === "published" ? "Đã xuất bản" : "Bản nháp"}
          </span>
        </div>

        <div className="cms-header__right">
          <button
            type="button"
            className="admin-button admin-button--ghost cms-btn"
            onClick={() => setPreviewMinimized(!previewMinimized)}
            title={previewMinimized ? "Mở xem trước Live Preview" : "Thu nhỏ Live Preview"}
          >
            {previewMinimized ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>{previewMinimized ? "Mở Xem trước" : "Thu nhỏ Preview"}</span>
          </button>

          <button
            type="button"
            className="admin-button admin-button--ghost cms-btn"
            onClick={() => handleSavePost("draft")}
            disabled={isSaving}
          >
            <Save size={16} />
            <span>{isSaving ? "Đang lưu..." : "Lưu Nháp"}</span>
          </button>

          <button
            type="button"
            className="admin-button cms-btn cms-btn--primary"
            onClick={() => handleSavePost("published")}
            disabled={isSaving}
          >
            <Send size={16} />
            <span>{isSaving ? "Đang xử lý..." : isEdit ? "Cập Nhật & Xuất Bản" : "Xuất Bản Bài Viết"}</span>
          </button>
        </div>
      </header>

      {/* Main CMS Body Container */}
      <main className="cms-body">
        <div
          ref={containerRef}
          className="cms-grid"
          style={previewMinimized
            ? { gridTemplateColumns: "1fr" }
            : { display: "flex", overflow: "hidden", flex: 1 }
          }
        >
          {/* Left Column: Editor Stream */}
          <div
            className={`cms-editor-stream${!previewMinimized && previewWidth > 500 ? " is-narrow" : ""}`}
            style={previewMinimized ? {} : { flex: 1, minWidth: 0 }}
          >
            {/* Section 1: Thông tin bài viết & Metadata */}
            <section className="cms-card">
              <div className="cms-card__header">
                <h2>
                  <Sliders size={18} /> Thông Tin Bài Viết & Metadata
                </h2>
              </div>

              <div className="cms-card__body">
                <div className="cms-meta-grid">
                  {/* Thumbnail Box */}
                  <div className="cms-thumb-box">
                    <label className="cms-label">Ảnh Đại Diện Bài Viết (Thumbnail 320×180)</label>
                    <div className="cms-thumb-preview">
                      {formData.thumbnail ? (
                        <img src={formData.thumbnail} alt="Thumbnail preview" />
                      ) : (
                        <div className="cms-thumb-placeholder">
                          <ImageIcon size={28} />
                          <span>Chưa có ảnh đại diện</span>
                        </div>
                      )}
                    </div>

                    <div className="cms-thumb-actions">
                      <button
                        type="button"
                        className="admin-button admin-button--ghost cms-btn-sm"
                        onClick={openThumbMediaPicker}
                      >
                        <FolderOpen size={14} /> Media
                      </button>
                      <label className="admin-button admin-button--ghost cms-btn-sm" style={{ cursor: "pointer", margin: 0 }}>
                        <Upload size={14} />
                        {isUploading ? "Đang tải..." : "Tải tệp"}
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
                          className="admin-button admin-button--danger cms-btn-sm"
                          onClick={() => setFormData({ ...formData, thumbnail: "" })}
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="cms-link-toggle"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                    >
                      {showUrlInput ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <ChevronUp size={12} /> Ẩn URL ảnh
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <ChevronDown size={12} /> Dán URL ảnh thủ công
                        </span>
                      )}
                    </button>

                    {showUrlInput && (
                      <input
                        type="text"
                        className="cms-input"
                        placeholder="https://domain.com/image.jpg"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        style={{ marginTop: "6px", fontSize: "0.8rem" }}
                      />
                    )}
                  </div>

                  {/* Metadata Fields */}
                  <div className="cms-meta-fields">
                    <div className="cms-form-row-3">
                      <div className="cms-field">
                        <label className="cms-label">Danh mục bài viết</label>
                        <select
                          className="cms-select"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          <option value="Kinh nghiệm du lịch">Kinh nghiệm du lịch</option>
                          <option value="Tin tức Khánh Linh">Tin tức Khánh Linh</option>
                          <option value="Cẩm nang thuê xe">Cẩm nang thuê xe</option>
                          <option value="Khuyến mãi">Khuyến mãi & Ưu đãi</option>
                        </select>
                      </div>

                      <div className="cms-field">
                        <label className="cms-label">Trạng thái xuất bản</label>
                        <select
                          className="cms-select"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as "draft" | "published",
                            })
                          }
                        >
                          <option value="published">Đã xuất bản</option>
                          <option value="draft">Bản nháp</option>
                        </select>
                      </div>

                      <div className="cms-field" style={{ justifyContent: "flex-end", paddingBottom: "6px" }}>
                        <label className="cms-checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          />
                          <span>Bài viết nổi bật</span>
                        </label>
                      </div>
                    </div>

                    <div className="cms-field">
                      <label className="cms-label">
                        Tiêu đề bài viết ({activeFormTab === "vi" ? "Tiếng Việt *" : "English *"})
                      </label>
                      <input
                        type="text"
                        className="cms-input cms-input--title"
                        placeholder={activeFormTab === "vi" ? "Nhập tiêu đề bài viết hấp dẫn..." : "Enter English post title..."}
                        value={formData.title[activeFormTab]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            title: { ...formData.title, [activeFormTab]: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="cms-field">
                      <label className="cms-label">
                        Tóm tắt ngắn (Excerpt - {activeFormTab.toUpperCase()})
                      </label>
                      <textarea
                        rows={2}
                        className="cms-textarea"
                        placeholder="Nhập mô tả tóm tắt bài viết hiển thị ở danh sách tin tức..."
                        value={formData.excerpt[activeFormTab]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            excerpt: { ...formData.excerpt, [activeFormTab]: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Soạn Thảo Nội Dung (Block Editor) */}
            <section className="cms-card">
              <div className="cms-card__header" style={{ justifyContent: "space-between" }}>
                <h2>
                  <Sliders size={18} /> Soạn Thảo Nội Dung Block Editor
                </h2>

                {/* Language Tab Switcher */}
                <div className="cms-lang-tabs">
                  <button
                    type="button"
                    className={`cms-lang-tab ${activeFormTab === "vi" ? "is-active" : ""}`}
                    onClick={() => setActiveFormTab("vi")}
                  >
                    Tiếng Việt
                  </button>
                  <button
                    type="button"
                    className={`cms-lang-tab ${activeFormTab === "en" ? "is-active" : ""}`}
                    onClick={() => setActiveFormTab("en")}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="cms-card__body">
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
            </section>
          </div>

          {/* Drag Resizer Handle */}
          {!previewMinimized && (
            <div
              className="cms-resizer"
              onMouseDown={handleResizerMouseDown}
              title="Kéo để điều chỉnh kích thước Preview"
            />
          )}

          {/* Right Column: Live Realtime Preview */}
          {!previewMinimized && (
            <div className="cms-preview-stream" style={{ width: previewWidth, flexShrink: 0 }}>
              <div className="cms-preview-card">
                <div className="cms-preview-card__header">
                  <div className="cms-preview-card__title">
                    <Eye size={16} />
                    <span>Live Preview ({activeFormTab.toUpperCase()})</span>
                  </div>
                  <button
                    type="button"
                    className="cms-preview-card__close"
                    onClick={() => setPreviewMinimized(true)}
                    title="Thu nhỏ Live Preview"
                  >
                    <Minimize2 size={16} />
                  </button>
                </div>

                <div className="cms-preview-card__body">
                  <article className="article-paper-card" style={{ padding: "28px 20px", boxShadow: "none", border: "1px solid rgba(16,33,43,0.06)", borderRadius: "14px", width: "100%" }}>
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
          )}
        </div>
      </main>

      {/* Floating Re-Open Preview Button when Minimized */}
      {previewMinimized && (
        <button
          type="button"
          className="cms-floating-preview-btn"
          onClick={() => setPreviewMinimized(false)}
          title="Mở xem trước Live Preview 30%"
        >
          <Eye size={16} />
          <span>Xem trước ({activeFormTab.toUpperCase()})</span>
        </button>
      )}

      {/* Media Picker Modal */}
      {isThumbMediaPickerOpen && (
        <div className="confirm-dialog__overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
          <div className="admin-card" style={{ maxWidth: "850px", width: "90%", maxHeight: "80vh", overflowY: "auto", padding: "1.5rem", position: "relative", zIndex: 10001 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>Chọn ảnh đại diện từ Thư viện Media</h3>
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
    </div>
  );
}
