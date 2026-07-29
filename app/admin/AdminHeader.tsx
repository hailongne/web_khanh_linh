"use client";

import React from "react";

export type AdminHeaderProps = {
  title: string;
  subtitle?: string;
  tag?: string;
  actions?: React.ReactNode;
  user?: {
    displayName?: string;
    username?: string;
    role?: string;
    avatar?: string;
  };
  onToggleMobileSidebar?: () => void;
};

export default function AdminHeader({
  title,
  subtitle,
  tag,
  actions,
  user,
  onToggleMobileSidebar,
}: AdminHeaderProps) {
  return (
    <header className="admin-header-v2">
      {/* Left side: Tag/Breadcrumb, Title (H1 34px), Subtitle (16px) */}
      <div className="admin-header-v2__left">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {onToggleMobileSidebar && (
            <button
              type="button"
              className="admin-header-v2__menu-btn"
              onClick={onToggleMobileSidebar}
              aria-label="Mở menu mobile"
            >
              ☰
            </button>
          )}
          {tag && <div className="admin-header-v2__tag">{tag}</div>}
        </div>

        <h1 className="admin-header-v2__title">{title}</h1>

        {subtitle && <p className="admin-header-v2__subtitle">{subtitle}</p>}
      </div>

      {/* Right side: User Profile & Actions slot */}
      <div className="admin-header-v2__right">
        {user && (
          <div className="admin-header-v2__user">
            <div className="admin-header-v2__avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" />
              ) : (
                <span className="admin-header-v2__avatar-text">
                  {(user.displayName || user.username || "A").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="admin-header-v2__user-info">
              <span className="admin-header-v2__user-name">
                {user.displayName || user.username}
              </span>
              <span className="admin-header-v2__user-role">{user.role}</span>
            </div>
          </div>
        )}

        {actions && <div className="admin-header-v2__actions">{actions}</div>}
      </div>
    </header>
  );
}
