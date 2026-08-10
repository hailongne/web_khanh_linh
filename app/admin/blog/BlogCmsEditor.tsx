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
  Minimize2,
  Check,
  X,
  Search
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
  const [mediaSearchFilter, setMediaSearchFilter] = useState("");

  const filteredMedia = mediaList.filter((m) =>
    (m.name || "").toLowerCase().includes(mediaSearchFilter.toLowerCase())
  );

  // Official Categories state
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; visible?: boolean }[]>([]);
  const [showAddCatForm, setShowAddCatForm] = useState(false);
  const [showVisibilityManager, setShowVisibilityManager] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [catErrorMsg, setCatErrorMsg] = useState("");
  const [catSuccessMsg, setCatSuccessMsg] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?includeHidden=true");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
        if (json.data.length > 0) {
          setFormData((prev) => {
            const hasCat = json.data.some((c: { name: string }) => c.name === prev.category);
            if (hasCat) return prev;
            // Pick first visible category by default
            const firstVisible = json.data.find((c: { visible?: boolean }) => c.visible !== false);
            return { ...prev, category: firstVisible ? firstVisible.name : json.data[0].name };
          });
        }
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }, []);

  const handleToggleCategoryVisibility = async (id: string, nextVisible: boolean, catName: string) => {
    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, visible: nextVisible }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchCategories();
        // If current form category was hidden and not editing an existing post, reset to first visible
        if (!nextVisible && formData.category === catName && !editingSlug) {
          const remainingVisible = categories.filter((c) => c.id !== id && c.visible !== false);
          if (remainingVisible.length > 0) {
            setFormData((prev) => ({ ...prev, category: remainingVisible[0].name }));
          }
        }
      }
    } catch (err) {
      console.error("Error toggling category visibility:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (initialData) {
      Promise.resolve().then(() => setFormData(initialData));
    }
  }, [initialData]);

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setCatErrorMsg("Vui lòng nhập tên danh mục.");
      return;
    }
    setCatErrorMsg("");
    setCatSuccessMsg("");
    setIsAddingCat(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim() }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const createdCat = json.data;
        if (json.isDuplicate) {
          setCatSuccessMsg("Danh mục này đã tồn tại.");
        } else {
          setCatSuccessMsg("Đã thêm danh mục mới.");
        }
        await fetchCategories();
        setFormData((prev) => ({ ...prev, category: createdCat.name }));
        setNewCatName("");
        setNewCatDesc("");
        setTimeout(() => {
          setShowAddCatForm(false);
          setCatSuccessMsg("");
        }, 1200);
      } else {
        setCatErrorMsg(json.error || "Không thể tạo danh mục.");
      }
    } catch {
      setCatErrorMsg("Lỗi kết nối khi tạo danh mục.");
    } finally {
      setIsAddingCat(false);
    }
  };

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
                        className="cms-thumb-btn cms-thumb-btn--media"
                        onClick={openThumbMediaPicker}
                        title="Chọn ảnh từ Thư viện Media"
                      >
                        <FolderOpen size={14} />
                        <span>Media</span>
                      </button>

                      <label
                        className="cms-thumb-btn cms-thumb-btn--upload"
                        title="Tải tệp ảnh mới lên hệ thống"
                      >
                        <Upload size={14} />
                        <span>{isUploading ? "Đang tải..." : "Tải tệp"}</span>
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
                          className="cms-thumb-btn cms-thumb-btn--delete"
                          onClick={() => setFormData({ ...formData, thumbnail: "" })}
                          title="Xóa ảnh đại diện"
                        >
                          <Trash2 size={14} />
                          <span>Xóa</span>
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
                      <div className="cms-field" style={{ position: "relative" }}>
                        <div className="cms-label-row">
                          <label className="cms-label">Danh mục bài viết</label>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <button
                              type="button"
                              className={`cms-add-cat-btn ${showAddCatForm ? "cms-add-cat-btn--active" : ""}`}
                              onClick={() => {
                                setShowAddCatForm(!showAddCatForm);
                                setShowVisibilityManager(false);
                                setCatErrorMsg("");
                                setCatSuccessMsg("");
                              }}
                              title="Thêm danh mục mới"
                              aria-label="Thêm danh mục mới"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              <span>Thêm</span>
                            </button>

                            <button
                              type="button"
                              className={`cms-add-cat-btn ${showVisibilityManager ? "cms-add-cat-btn--active" : ""}`}
                              onClick={() => {
                                setShowVisibilityManager(!showVisibilityManager);
                                setShowAddCatForm(false);
                              }}
                              title="Quản lý ẩn/hiện danh mục"
                              aria-label="Quản lý ẩn/hiện danh mục"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <span>Ẩn/Hiện</span>
                            </button>
                          </div>
                        </div>

                        <select
                          className="cms-select"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          {/* DANH MỤC ĐANG HIỆN */}
                          {categories
                            .filter((c) => c.visible !== false)
                            .map((cat) => (
                              <option key={cat.id || cat.slug} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}

                          {/* DANH MỤC ĐÃ ẨN */}
                          {categories.some((c) => c.visible === false) && (
                            <optgroup label="DANH MỤC ĐÃ ẨN">
                              {categories
                                .filter((c) => c.visible === false)
                                .map((cat) => {
                                  const isCurrentPostCat = formData.category === cat.name;
                                  return (
                                    <option
                                      key={cat.id || cat.slug}
                                      value={cat.name}
                                      disabled={!isCurrentPostCat}
                                    >
                                      {cat.name} — Đã ẩn
                                    </option>
                                  );
                                })}
                            </optgroup>
                          )}
                        </select>

                        {/* Inline Add Category Form */}
                        {showAddCatForm && (
                          <div className="cms-inline-cat-card">
                            <div className="cms-inline-cat-header">
                              <span>Thêm danh mục mới</span>
                              <button
                                type="button"
                                className="cms-inline-cat-close"
                                onClick={() => setShowAddCatForm(false)}
                              >
                                ✕
                              </button>
                            </div>
                            <div className="cms-inline-cat-body">
                              <input
                                type="text"
                                className="cms-input"
                                placeholder="Tên danh mục mới (ví dụ: Tin tức)"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                autoFocus
                              />
                              <input
                                type="text"
                                className="cms-input"
                                placeholder="Mô tả ngắn (tùy chọn)"
                                value={newCatDesc}
                                onChange={(e) => setNewCatDesc(e.target.value)}
                                style={{ marginTop: "4px" }}
                              />
                              {catErrorMsg && <div className="cms-inline-cat-error">{catErrorMsg}</div>}
                              {catSuccessMsg && <div className="cms-inline-cat-success">{catSuccessMsg}</div>}
                              <div className="cms-inline-cat-actions">
                                <button
                                  type="button"
                                  className="cms-btn-secondary-sm"
                                  onClick={() => setShowAddCatForm(false)}
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  className="cms-btn-primary-sm"
                                  disabled={isAddingCat}
                                  onClick={handleAddCategorySubmit}
                                >
                                  {isAddingCat ? "Đang lưu..." : "Thêm danh mục"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Inline Category Visibility Manager */}
                        {showVisibilityManager && (
                          <div className="cms-inline-cat-card">
                            <div className="cms-inline-cat-header">
                              <span>Quản lý ẩn / hiện danh mục</span>
                              <button
                                type="button"
                                className="cms-inline-cat-close"
                                onClick={() => setShowVisibilityManager(false)}
                              >
                                ✕
                              </button>
                            </div>
                            <div className="cms-inline-cat-list">
                              {categories.map((cat) => {
                                const isVisible = cat.visible !== false;
                                return (
                                  <div key={cat.id || cat.slug} className="cms-inline-cat-item">
                                    <div className="cms-inline-cat-info">
                                      <span className="cms-inline-cat-name">{cat.name}</span>
                                      <span className={`cms-cat-badge ${isVisible ? "cms-cat-badge--visible" : "cms-cat-badge--hidden"}`}>
                                        {isVisible ? "Đang hiện" : "Đã ẩn"}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      className={`cms-cat-toggle-btn ${isVisible ? "cms-cat-toggle-btn--hide" : "cms-cat-toggle-btn--show"}`}
                                      onClick={() => handleToggleCategoryVisibility(cat.id || cat.slug, !isVisible, cat.name)}
                                      title={isVisible ? "Ẩn danh mục này" : "Hiện lại danh mục này"}
                                    >
                                      {isVisible ? (
                                        <>
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                          </svg>
                                          <span>Ẩn</span>
                                        </>
                                      ) : (
                                        <>
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                          </svg>
                                          <span>Hiện lại</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
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

      {/* Media Picker Modal Dialog */}
      {isThumbMediaPickerOpen && (
        <div className="cms-media-overlay" onClick={() => setIsThumbMediaPickerOpen(false)}>
          <div
            className="cms-media-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="cms-media-modal-header">
              <div className="cms-media-modal-title">
                <ImageIcon size={20} style={{ color: "#2563eb" }} />
                <h3>Thư viện Media</h3>
              </div>
              <button
                type="button"
                className="cms-media-modal-close"
                onClick={() => setIsThumbMediaPickerOpen(false)}
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Toolbar with Search */}
            <div className="cms-media-modal-toolbar">
              <div className="cms-media-modal-search">
                <Search size={14} style={{ color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Tìm theo tên file..."
                  value={mediaSearchFilter}
                  onChange={(e) => setMediaSearchFilter(e.target.value)}
                />
              </div>
              <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
                {filteredMedia.length} hình ảnh
              </span>
            </div>

            {/* Modal Body */}
            <div className="cms-media-modal-body">
              {loadingMedia ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                  <i className="fas fa-spinner fa-spin fa-2x" style={{ color: "#2563eb" }} />
                  <p style={{ marginTop: "0.75rem", fontWeight: 600, fontSize: "0.88rem" }}>Đang nạp thư viện media...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                  <FolderOpen size={36} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
                  <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Không tìm thấy hình ảnh nào.</p>
                </div>
              ) : (
                <div className="cms-media-grid">
                  {filteredMedia.map((media) => {
                    const isSelected = formData.thumbnail === media.url;
                    return (
                      <div
                        key={media.url}
                        className={`cms-media-item ${isSelected ? "cms-media-item--active" : ""}`}
                        onClick={() => {
                          setFormData({ ...formData, thumbnail: media.url });
                          setIsThumbMediaPickerOpen(false);
                        }}
                        title={`Chọn ảnh: ${media.name}`}
                      >
                        <div className="cms-media-thumb-wrap">
                          <img src={media.url} alt={media.name} loading="lazy" />
                          {isSelected && (
                            <div className="cms-media-check-badge">
                              <Check size={13} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div className="cms-media-name">{media.name}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="cms-media-modal-footer">
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                Nhấn vào ảnh để gán làm Ảnh Đại Diện (Thumbnail).
              </span>
              <button
                type="button"
                className="cms-btn-secondary-sm"
                onClick={() => setIsThumbMediaPickerOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
