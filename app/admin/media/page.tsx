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
  const [selectedFolder, setSelectedFolder] = useState<string>("content_all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [uploadCategory, setUploadCategory] = useState<string>("blog");

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
        formData.append("category", uploadCategory);

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
      
      let matchesFolder = true;
      if (selectedFolder === "content_all") {
        matchesFolder = item.folder !== "system";
      } else if (selectedFolder !== "all") {
        matchesFolder = item.folder === selectedFolder;
      }
      
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
              style={{ width: "220px", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.83rem" }}
              placeholder="Tìm kiếm tệp ảnh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <select
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.83rem", background: "#fff" }}
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
            >
              <option value="content_all">Ảnh nội dung (Bản lọc sạch)</option>
              <option value="blog">Ảnh Blog (/uploads/blog)</option>
              <option value="news">Ảnh Tin tức (/images/news)</option>
              <option value="fleet">Ảnh Đội xe (/images)</option>
              <option value="avatar">Ảnh Chuyên viên / Avatar</option>
              <option value="system">Ảnh Tĩnh Thiết Kế (Logo/Icon)</option>
              <option value="all">Tất cả tệp (Gồm cả ảnh tĩnh)</option>
            </select>

            <select
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.83rem", background: "#fff" }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
            </select>

            <select
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16,33,43,0.14)", font: "inherit", fontSize: "0.83rem", background: "#fff", marginLeft: "auto" }}
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              title="Chọn thư mục tải ảnh lên"
            >
              <option value="blog">Tải lên: Thư mục Blog</option>
              <option value="news">Tải lên: Thư mục Tin tức</option>
              <option value="fleet">Tải lên: Thư mục Đội xe</option>
              <option value="avatar">Tải lên: Thư mục Avatar</option>
            </select>

            <label className="admin-button" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
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

        {/* Media Grid */}
        <div className="admin-section">
          {loading ? (
            <div className="admin-table__empty">Đang nạp thư viện media...</div>
          ) : filteredMedia.length === 0 ? (
            <div className="admin-table__empty">Không tìm thấy tệp ảnh nào phù hợp.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "16px"
              }}
            >
              {filteredMedia.map((media, idx) => (
                <div
                  key={`${media.url}-${idx}`}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid rgba(16,33,43,0.1)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "130px",
                      background: "#f8fafc",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottom: "1px solid rgba(16,33,43,0.06)"
                    }}
                  >
                    <img
                      src={media.url}
                      alt={media.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain"
                      }}
                      loading="lazy"
                    />
                  </div>

                  <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        color: "#0f172a",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: "4px"
                      }}
                      title={media.name}
                    >
                      {media.name}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#64748b", marginBottom: "10px" }}>
                      <span>{(media.size / 1024).toFixed(1)} KB</span>
                      <span style={{ textTransform: "uppercase", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px" }}>{media.folder}</span>
                    </div>

                    <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
                      <button
                        type="button"
                        className="admin-button secondary"
                        style={{ flex: 1, padding: "4px 8px", fontSize: "0.72rem", justifyContent: "center" }}
                        onClick={() => handleCopyUrl(media.url)}
                      >
                        <i className="fas fa-copy" /> Sao chép
                      </button>

                      <button
                        type="button"
                        className="admin-button danger"
                        style={{ padding: "4px 8px", fontSize: "0.72rem", justifyContent: "center" }}
                        onClick={() => handleDeleteMedia(media)}
                        title="Xóa tệp ảnh"
                      >
                        <i className="fas fa-trash-alt" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
