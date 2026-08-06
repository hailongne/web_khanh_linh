"use client";

import React, { useEffect, useState } from "react";
import AdminAuthGuard from "../../../AdminAuthGuard";
import BlogCmsEditor, { NewsFormData } from "../../BlogCmsEditor";
import ToastContainer from "../../../../components/toast/ToastContainer";
import { showToast } from "../../../../components/toast/toastService";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function AdminBlogEditPage({ params }: PageProps) {
  const { slug } = React.use(params);
  const [postData, setPostData] = useState<NewsFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/blog/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          const item = json.data;
          setPostData({
            slug: item.slug,
            title: item.title || { vi: "", en: "" },
            excerpt: item.excerpt || { vi: "", en: "" },
            blocks: item.blocks || { vi: [], en: [] },
            thumbnail: item.thumbnail || "",
            category: item.category || "Kinh nghiệm du lịch",
            status: item.status || "published",
            featured: Boolean(item.featured),
            authorId: item.authorId,
          });
        } else {
          showToast("error", json.error || "Không tìm thấy thông tin bài viết.");
        }
      } catch {
        showToast("error", "Lỗi kết nối máy chủ khi nạp bài viết.");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  return (
    <AdminAuthGuard>
      <ToastContainer />
      {loading ? (
        <div
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100vh", gap: "1rem",
            background: "#f8fafc", color: "#64748b",
          }}
        >
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: "#2563eb" }} />
          <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>Đang nạp dữ liệu bài viết CMS...</p>
        </div>
      ) : !postData ? (
        <div
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100vh", gap: "1rem",
            background: "#f8fafc", color: "#ef4444",
          }}
        >
          <i className="fas fa-exclamation-circle fa-2x" />
          <p style={{ fontWeight: 600, fontSize: "1rem" }}>Không tìm thấy bài viết với đường dẫn này.</p>
        </div>
      ) : (
        <BlogCmsEditor editingSlug={slug} initialData={postData} />
      )}
    </AdminAuthGuard>
  );
}
