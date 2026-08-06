"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "../admin/admin.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Đăng nhập thất bại.");
      }

      // Redirect based on user role
      const role = data.user?.role;
      if (role === "BLOG_EDITOR") {
        router.replace("/admin/blog");
      } else {
        router.replace("/admin");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi đăng nhập.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="creative-login-wrapper">
      <div className="creative-login-card">
        {/* Background Diagonal Wave Shapes */}
        <div className="creative-login-bg-shapes">
          <div className="creative-login-shape-1" />
          <div className="creative-login-shape-2" />
        </div>

        {/* Form Content Container */}
        <div className="creative-login-content">
          {/* Header */}
          <div className="creative-login-header">
            <div className="creative-login-brand-tag">
              <i className="fas fa-shield-halved" /> Khánh Linh Trans
            </div>
            <h1 className="creative-login-title">Đăng Nhập Admin</h1>
            <p className="creative-login-subtitle">
              Hệ thống quản trị & biên tập nội dung Khánh Linh Trans
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  fontSize: "0.85rem",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <i className="fas fa-exclamation-circle" />
                <span>{error}</span>
              </div>
            )}

            {/* Username input */}
            <div className="creative-login-field">
              <div className="creative-login-field-wrap">
                <span className="creative-login-icon">
                  <i className="fas fa-user" />
                </span>
                <input
                  type="text"
                  className="creative-login-input"
                  placeholder="Tên đăng nhập / Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password input */}
            <div className="creative-login-field">
              <div className="creative-login-field-wrap">
                <span className="creative-login-icon">
                  <i className="fas fa-lock" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="creative-login-input"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="creative-login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            {/* Artistic Gradient Action Button */}
            <button
              type="submit"
              className="creative-login-btn-submit"
              disabled={loading}
            >
              <span>{loading ? "Đang xác thực..." : "Đăng nhập"}</span>
              <i className="fas fa-arrow-right" style={{ marginLeft: "8px", fontSize: "0.92rem", transition: "transform 0.25s ease" }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
