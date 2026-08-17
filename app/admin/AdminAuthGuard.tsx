"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Lightweight auth guard — chỉ kiểm tra đăng nhập, không render header/sidebar.
 * Dùng cho các trang cần fullscreen như CMS Editor.
 */
export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname || "";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.active) {
          // BLOG_EDITOR chỉ được truy cập /admin/blog và /admin/media
          if (
            data.data.role === "BLOG_EDITOR" &&
            !currentPath.startsWith("/admin/blog") &&
            !currentPath.startsWith("/admin/media")
          ) {
            router.replace("/admin/blog");
            return;
          }
          setReady(true);
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [pathname, router]);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#64748b",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <i
          className="fas fa-spinner fa-spin fa-2x"
          style={{ color: "#2563eb" }}
        />
        <p style={{ fontWeight: 500, fontSize: "0.9rem" }}>
          Đang xác thực quyền truy cập...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
