"use client";

import React, { useEffect, useState } from "react";
import AdminShell from "../AdminShell";
import ToastContainer from "../../components/toast/ToastContainer";
import { showToast } from "../../components/toast/toastService";

type MediaFile = {
  name: string;
  url: string;
  size: number;
  folder: string;
  createdAt: string;
};

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      if (json.success) {
        setMediaList(json.data || []);
      }
    } catch {
      showToast("error", "Lỗi tải thư viện media.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "blog");

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || `Tải tệp ${file.name} thất bại.`);
        }
      }
      showToast("success", "Tải tệp ảnh lên thư viện thành công.");
      fetchMedia();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi tải ảnh.";
      showToast("error", errorMsg);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function handleDeleteMedia(media: MediaFile) {
    if (confirm(`Bạn có chắc chắn muốn xóa ảnh "${media.name}" khỏi hệ thống?`)) {
      try {
        const res = await fetch(`/api/admin/media?url=${encodeURIComponent(media.url)}`, {
          method: "DELETE"
        });
        const json = await res.json();
        if (json.success) {
          showToast("success", "Đã xóa tệp ảnh thành công.");
          fetchMedia();
        } else {
          showToast("error", json.error || "Lỗi xóa ảnh.");
        }
      } catch {
        showToast("error", "Lỗi xóa ảnh.");
      }
    }
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url);
    showToast("success", "Đã chép đường dẫn ảnh!");
  }

  const filteredMedia = mediaList
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = selectedFolder === "all" || item.folder === selectedFolder;
      return matchesSearch && matchesFolder;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

  return (
    <AdminShell
      title="Media"
      subtitle="Quản lý thư viện ảnh"
      tag="Nội dung media"
    >
      <ToastContainer />

      <div className="admin-card">
        {/* Toolbar */}
        <div className="admin-toolbar" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", width: "100%", alignItems: "center" }}>
            <input
              type="text"
              className="admin-form input"
              style={{ width: "260px", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.83rem" }}
              placeholder="Tìm kiếm tệp ảnh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.83rem", background: "#fff" }}
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
            >
              <option value="all">Tất cả thư mục</option>
              <option value="blog">Blog (/uploads/blog)</option>
              <option value="news">News (/images/news)</option>
              <option value="uploads">Uploads chung</option>
            </select>

            <select
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.83rem", background: "#fff" }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
            </select>

            <label className="admin-button" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", marginLeft: "auto" }}>
              <i className={`fas ${isUploading ? "fa-spinner fa-spin" : "fa-upload"}`} aria-hidden="true" />
              {isUploading ? "Đang tải ảnh..." : "Tải ảnh mới"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                style={{ display: "none" }}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {/* Media Grid: 5 cols desktop, 4 cols laptop, 3 cols tablet, 2 cols mobile */}
        <div className="admin-section">
          {loading ? (
            <div className="admin-table__empty">Đang nạp thư viện media...</div>
          ) : filteredMedia.length === 0 ? (
            <div className="admin-table__empty">Chưa có tệp ảnh nào phù hợp.</div>
          ) : (
            <div className="admin-media-grid">
              {filteredMedia.map((media) => (
                <div key={media.url} className="admin-media-card">
                  <div className="admin-media-card__img-wrap">
                    <img src={media.url} alt={media.name} loading="lazy" />
                  </div>
                  <div className="admin-media-card__body">
                    <div className="admin-media-card__name" title={media.name}>
                      {media.name}
                    </div>
                    <div className="admin-media-card__info">
                      {(media.size / 1024).toFixed(1)} KB &bull; {media.folder}
                    </div>
                    <div className="admin-media-card__actions" style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(media.url)}
                        className="admin-button admin-button--ghost"
                        style={{ padding: "4px 10px", fontSize: "0.76rem", flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                        title="Sao chép đường dẫn"
                      >
                        <i className="fas fa-copy" style={{ fontSize: "0.78rem" }} aria-hidden="true" />
                        Sao chép
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(media)}
                        className="admin-button admin-button--danger"
                        style={{ padding: "4px 10px", fontSize: "0.76rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                        title="Xóa tệp ảnh"
                      >
                        <i className="fas fa-trash-alt" style={{ fontSize: "0.78rem" }} aria-hidden="true" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-media-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        .admin-media-card {
          background: #ffffff;
          border: 1px solid rgba(16, 33, 43, 0.1);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .admin-media-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 33, 43, 0.08);
        }

        .admin-media-card__img-wrap {
          width: 100%;
          height: 120px;
          background: #f8fafc;
          overflow: hidden;
        }

        .admin-media-card__img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-media-card__body {
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .admin-media-card__name {
          font-weight: 600;
          font-size: 0.8rem;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-media-card__info {
          font-size: 0.72rem;
          color: var(--muted);
          margin-top: 2px;
          text-transform: uppercase;
        }

        .admin-media-card__actions {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }

        @media (max-width: 1200px) {
          .admin-media-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 992px) {
          .admin-media-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 576px) {
          .admin-media-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </AdminShell>
  );
}
