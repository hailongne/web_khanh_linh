"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import ToastContainer from "../components/toast/ToastContainer";
import AdminHeader from "./AdminHeader";
import { getAccessibleMenuItems, Account } from "./adminConfig";
import "./admin.css";

function AdminShellContent({
  title,
  subtitle,
  tag,
  actions,
  children
}: {
  title: string;
  subtitle?: string;
  tag?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname || "";
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") || "vehicles";
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (!data.data.active) {
            router.replace("/login");
            return;
          }
          // Authorization check for BLOG_EDITOR
          if (data.data.role === "BLOG_EDITOR" && !currentPath.startsWith("/admin/blog") && !currentPath.startsWith("/admin/media")) {
            router.replace("/admin/blog");
            return;
          }
          // Authorization check for ADMIN accessing /admin/accounts
          if (data.data.role === "ADMIN" && currentPath.startsWith("/admin/accounts")) {
            router.replace("/admin");
            return;
          }
          setCurrentUser(data.data);
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPath, router]);

  async function handleLogout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?")) {
      try {
        await fetch("/api/admin/logout", { method: "POST" });
      } catch {}
      router.replace("/login");
      router.refresh();
    }
  }

  if (loading || !currentUser) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f4f8fb", color: "#64748b" }}>
        <div style={{ textAlign: "center" }}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: "0.75rem", color: "#2563eb" }}></i>
          <p style={{ fontWeight: 500, fontSize: "0.9rem" }}>Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  const accessibleMenus = getAccessibleMenuItems(currentUser.role);

  return (
    <div className="admin-app">
      <ToastContainer />
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar__overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`admin-sidebar${mobileSidebarOpen ? " is-open" : ""}`}>
        <div className="admin-sidebar__brand">
          <div>
            <strong>Admin</strong>
            <span>Khánh Linh Trans</span>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {accessibleMenus.map((item) => {
            let isActive = false;
            if (item.href.includes("?tab=")) {
              const targetTab = item.href.split("?tab=")[1];
              isActive = currentPath === "/admin" && currentTab === targetTab;
            } else if (item.href === "/admin") {
              isActive = currentPath === "/admin" && (!currentTab || currentTab === "vehicles");
            } else {
              isActive = currentPath.startsWith(item.href);
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                className={isActive ? "is-active" : ""}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <span className="admin-sidebar__icon">
                  <i className={item.icon} aria-hidden="true" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <button
            className="admin-button admin-button--ghost admin-sidebar__logout"
            type="button"
            onClick={handleLogout}
          >
            <i className="fas fa-right-from-bracket" aria-hidden="true" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="admin-main">
        {/* Modern Unified High Header V2 */}
        <AdminHeader
          title={title}
          subtitle={subtitle}
          tag={tag}
          actions={actions}
          user={currentUser}
          onToggleMobileSidebar={() => setMobileSidebarOpen((open) => !open)}
        />

        <main className="admin-content" style={{ paddingTop: 0 }}>
          <div className="admin-section">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminShell(props: {
  title: string;
  subtitle?: string;
  tag?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <React.Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f4f8fb", color: "#64748b" }}>
        <div style={{ textAlign: "center" }}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: "0.75rem", color: "#2563eb" }}></i>
          <p style={{ fontWeight: 500, fontSize: "0.9rem" }}>Đang nạp dữ liệu...</p>
        </div>
      </div>
    }>
      <AdminShellContent {...props} />
    </React.Suspense>
  );
}
