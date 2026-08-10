"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "../AdminShell";
import ToastContainer from "../../components/toast/ToastContainer";
import { showToast } from "../../components/toast/toastService";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  Calendar,
  Tag,
  Loader2,
  FolderOpen,
  Filter,
  ArrowUpDown,
  Star
} from "lucide-react";
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
  viewCount?: number;
  readingTime?: string;
  authorId?: string;
  author?: { displayName: string; avatar: string };
  publishedAt: string;
  updatedAt: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedFeatured, setSelectedFeatured] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; visible?: boolean }[]>([]);

  useEffect(() => {
    fetch("/api/categories?includeHidden=true")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const fetchAdminPosts = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchAdminPosts());
  }, [fetchAdminPosts]);

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

  async function handleToggleFeatured(post: NewsItem) {
    try {
      const res = await fetch(`/api/admin/blog/${post.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !post.featured }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Đã ${!post.featured ? "bật" : "tắt"} bài viết Nổi bật.`);
        fetchAdminPosts();
      } else {
        showToast("error", json.error || "Cập nhật bài viết Nổi bật thất bại.");
      }
    } catch {
      showToast("error", "Lỗi khi cập nhật bài viết Nổi bật.");
    }
  }

  const filteredPosts = posts
    .filter((p) => {
      const titleVi = p.title?.vi || "";
      const titleEn = p.title?.en || "";
      const matchesSearch =
        titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;
      const matchesFeatured =
        selectedFeatured === "all" ||
        (selectedFeatured === "featured" && p.featured) ||
        (selectedFeatured === "normal" && !p.featured);

      return matchesSearch && matchesCat && matchesStatus && matchesFeatured;
    })
    .sort((a, b) => {
      const timeA = new Date(a.publishedAt || a.updatedAt || 0).getTime();
      const timeB = new Date(b.publishedAt || b.updatedAt || 0).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

  return (
    <AdminShell
      title="Quản lý Bài viết CMS"
      subtitle="Danh sách bài viết & tin tức website"
      tag="Quản trị nội dung"
    >
      <ToastContainer />

      <div className="cms-admin-container">
        {/* Modern Filter & Action Header Bar */}
        <div className="cms-list-toolbar">
          <div className="cms-search-box">
            <Search className="cms-search-icon" size={16} />
            <input
              type="text"
              className="cms-search-input"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="cms-filter-group">
            <div className="cms-select-wrap">
              <Tag size={14} className="cms-select-icon" />
              <select
                className="cms-select-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.slug} value={cat.name}>
                    {cat.name}{cat.visible === false ? " (Đã ẩn)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="cms-select-wrap">
              <Filter size={14} className="cms-select-icon" />
              <select
                className="cms-select-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
              </select>
            </div>

            <div className="cms-select-wrap">
              <Star size={14} className="cms-select-icon" />
              <select
                className="cms-select-filter"
                value={selectedFeatured}
                onChange={(e) => setSelectedFeatured(e.target.value)}
              >
                <option value="all">Tất cả (Nổi bật & Thường)</option>
                <option value="featured">⭐ Bài viết Nổi bật</option>
                <option value="normal">Bài viết thường</option>
              </select>
            </div>

            <div className="cms-select-wrap">
              <ArrowUpDown size={14} className="cms-select-icon" />
              <select
                className="cms-select-filter"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          <Link href="/admin/blog/new" className="cms-btn-create">
            <Plus size={16} />
            <span>Viết bài mới</span>
          </Link>
        </div>

        {/* Card Stream Content List */}
        {loading ? (
          <div className="cms-list-empty">
            <Loader2 className="animate-spin" size={24} color="#2563eb" />
            <p>Đang nạp danh sách bài viết...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="cms-list-empty">
            <FolderOpen size={32} color="#94a3b8" />
            <p>Không tìm thấy bài viết nào phù hợp.</p>
          </div>
        ) : (
          <div className="cms-post-cards-grid">
            {filteredPosts.map((post) => (
              <div key={post.id} className="cms-post-card">
                <div className="cms-post-card__thumb">
                  {post.thumbnail ? (
                    <img src={post.thumbnail} alt={post.title?.vi || "thumbnail"} />
                  ) : (
                    <div className="cms-post-card__no-thumb">Chưa có ảnh</div>
                  )}
                  <span className={`cms-status-tag cms-status-tag--${post.status}`}>
                    {post.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                  {post.featured && (
                    <span
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        background: "#fef08a",
                        color: "#854d0e",
                        padding: "3px 8px",
                        borderRadius: "99px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px"
                      }}
                    >
                      <Star size={12} fill="#854d0e" /> Nổi bật
                    </span>
                  )}
                </div>

                <div className="cms-post-card__content">
                  <div className="cms-post-card__meta">
                    <span className="cms-cat-badge">{post.category}</span>
                    <span className="cms-meta-item">
                      <Calendar size={13} />
                      {new Date(post.updatedAt || post.publishedAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="cms-meta-item">
                      <Eye size={13} />
                      {post.viewCount || 1} lượt xem
                    </span>
                  </div>

                  <h3 className="cms-post-card__title">
                    {post.title?.vi || post.title?.en || "(Chưa có tiêu đề)"}
                  </h3>

                  <p className="cms-post-card__excerpt">
                    {post.excerpt?.vi || post.excerpt?.en || `/${post.slug}`}
                  </p>

                  <div className="cms-post-card__actions">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(post)}
                      className="cms-action-btn"
                      style={{
                        borderColor: post.featured ? "#fde047" : undefined,
                        background: post.featured ? "#fefce8" : undefined,
                        color: post.featured ? "#a16207" : undefined
                      }}
                      title={post.featured ? "Bỏ đánh dấu Nổi bật" : "Đánh dấu Bài viết Nổi bật"}
                    >
                      <Star size={14} fill={post.featured ? "#a16207" : "none"} />
                      <span>{post.featured ? "Nổi bật" : "Ghim"}</span>
                    </button>
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="cms-action-btn cms-action-btn--view"
                      title="Xem trên Web"
                    >
                      <ExternalLink size={14} />
                      <span>Xem</span>
                    </Link>
                    <Link
                      href={`/admin/blog/edit/${post.slug}`}
                      className="cms-action-btn cms-action-btn--edit"
                      title="Chỉnh sửa bài viết CMS"
                    >
                      <Edit3 size={14} />
                      <span>Sửa</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.slug)}
                      className="cms-action-btn cms-action-btn--delete"
                      title="Xóa bài viết"
                    >
                      <Trash2 size={14} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
