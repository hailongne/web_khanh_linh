"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../AdminShell";
import ToastContainer from "../../components/toast/ToastContainer";
import { showToast } from "../../components/toast/toastService";
import { Role } from "../adminConfig";

type Account = {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  role: Role;
  permissions: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
};

export default function AdminAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("ADMIN");
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/accounts");
      const json = await res.json();
      if (json.success) {
        setAccounts(json.data || []);
      } else if (res.status === 403) {
        showToast("error", "Chỉ SUPER_ADMIN mới có quyền truy cập.");
        router.replace("/admin");
      }
    } catch {
      showToast("error", "Không thể nạp danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    Promise.resolve().then(fetchAccounts);
  }, [fetchAccounts]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  function openCreateModal() {
    setEditingId(null);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setDisplayName("");
    setRole("ADMIN");
    setActive(true);
    setIsModalOpen(true);
  }

  function openEditModal(acc: Account) {
    setEditingId(acc.id);
    setUsername(acc.username);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setDisplayName(acc.displayName || "");
    setRole(acc.role);
    setActive(acc.active);
    setIsModalOpen(true);
  }

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();

    if (!editingId && !password) {
      showToast("error", "Vui lòng nhập mật khẩu cho tài khoản mới.");
      return;
    }

    if (password && password !== confirmPassword) {
      showToast("error", "Mật khẩu nhập lại không trùng khớp với mật khẩu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        username: username.trim(),
        displayName: displayName.trim(),
        role,
        active
      };
      if (password) payload.password = password;

      let res;
      if (editingId) {
        payload.id = editingId;
        res = await fetch("/api/admin/accounts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        payload.password = password;
        res = await fetch("/api/admin/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Không thể lưu tài khoản.");
      }

      showToast("success", json.message || "Lưu tài khoản thành công.");
      setIsModalOpen(false);
      fetchAccounts();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Đã xảy ra lỗi.";
      showToast("error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(acc: Account) {
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: acc.id, active: !acc.active })
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Đã ${!acc.active ? "mở khóa" : "khóa"} tài khoản ${acc.username}.`);
        fetchAccounts();
      } else {
        showToast("error", json.error || "Lỗi cập nhật trạng thái.");
      }
    } catch {
      showToast("error", "Lỗi cập nhật trạng thái.");
    }
  }

  async function handleDeleteAccount(acc: Account) {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${acc.username}" không?`)) {
      try {
        const res = await fetch(`/api/admin/accounts?id=${acc.id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          showToast("success", "Đã xóa tài khoản thành công.");
          fetchAccounts();
        } else {
          showToast("error", json.error || "Lỗi khi xóa tài khoản.");
        }
      } catch {
        showToast("error", "Lỗi khi xóa tài khoản.");
      }
    }
  }

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.displayName && acc.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = selectedRole === "all" || acc.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && acc.active) ||
      (selectedStatus === "locked" && !acc.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <AdminShell
      title="Quản lý tài khoản"
      subtitle="Quản trị người dùng hệ thống"
      tag="Quản trị hệ thống"
    >
      <ToastContainer />

      <div className="account-v2-container">
        {/* Filter Bar */}
        <div className="account-filter-bar">
          <div className="account-search-wrap">
            <span className="account-search-icon">🔍</span>
            <input
              type="text"
              className="account-search-input"
              placeholder="Tìm kiếm tài khoản..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="account-filter-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">Tất cả vai trò (Role)</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN (Toàn quyền)</option>
            <option value="ADMIN">ADMIN (Nội dung & Dịch vụ)</option>
            <option value="BLOG_EDITOR">BLOG_EDITOR (Chỉ Blog & Media)</option>
          </select>

          <select
            className="account-filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">🟢 Hoạt động</option>
            <option value="locked">🔴 Đã khóa</option>
          </select>

          <button onClick={openCreateModal} className="account-btn-add" style={{ marginLeft: "auto" }}>
            <i className="fas fa-plus" aria-hidden="true" /> Thêm tài khoản mới
          </button>
        </div>

        {/* Accounts Table V2 */}
        <div className="account-table-v2">
          <div className="account-table-v2__header">
            <div>Tài khoản & Người dùng</div>
            <div>Vai trò (Role)</div>
            <div>Trạng thái</div>
            <div>Đăng nhập cuối</div>
            <div style={{ textAlign: "right" }}>Thao tác</div>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              <i className="fas fa-spinner fa-spin fa-2x" style={{ color: "#0f6fec", marginBottom: "10px" }} />
              <p style={{ margin: 0 }}>Đang nạp danh sách tài khoản hệ thống...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
              Không có tài khoản nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredAccounts.map((acc) => {
              const initial = (acc.displayName || acc.username || "A").charAt(0).toUpperCase();
              const lastLoginDate = acc.lastLogin
                ? new Date(acc.lastLogin).toLocaleDateString("vi-VN")
                : null;
              const lastLoginTime = acc.lastLogin
                ? new Date(acc.lastLogin).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                : null;

              return (
                <div key={acc.id} className="account-table-v2__row">
                  <div className="account-user-cell">
                    <div className="account-user-avatar">
                      {acc.avatar ? (
                        <img src={acc.avatar} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        initial
                      )}
                    </div>
                    <div className="account-user-meta">
                      <span className="account-user-name">{acc.displayName || acc.username}</span>
                      <span className="account-user-sub">@{acc.username}</span>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`account-badge-role ${
                        acc.role === "SUPER_ADMIN"
                          ? "account-badge-role--super"
                          : acc.role === "ADMIN"
                          ? "account-badge-role--admin"
                          : "account-badge-role--editor"
                      }`}
                    >
                      {acc.role}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`account-badge-status ${
                        acc.active ? "account-badge-status--active" : "account-badge-status--locked"
                      }`}
                    >
                      {acc.active ? "🟢 Hoạt động" : "🔴 Đã khóa"}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.82rem", color: "#475569" }}>
                    {lastLoginDate ? (
                      <div style={{ lineHeight: 1.3 }}>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{lastLoginDate}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{lastLoginTime}</div>
                      </div>
                    ) : (
                      <span style={{ fontStyle: "italic", color: "#94a3b8" }}>Chưa đăng nhập</span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => openEditModal(acc)}
                      className="account-action-btn"
                      title="Sửa thông tin tài khoản"
                    >
                      <i className="fas fa-pen-to-square" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(acc)}
                      className="account-action-btn account-action-btn--lock"
                      title={acc.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                    >
                      <i className={`fas ${acc.active ? "fa-lock" : "fa-unlock"}`} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(acc)}
                      className="account-action-btn account-action-btn--delete"
                      title="Xóa tài khoản"
                    >
                      <i className="fas fa-trash-alt" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modern Account Modal V2 with Show/Hide Password & Confirm Password */}
      {isModalOpen && (
        <div className="account-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="account-modal-v2" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="account-modal-v2__header">
              <div>
                <h2 className="account-modal-v2__title">
                  {editingId ? "👤 Chỉnh Sửa Tài Khoản" : "👤 Thêm Tài Khoản Mới"}
                </h2>
                <p className="account-modal-v2__subtitle">
                  Quản lý thông tin và phân quyền người dùng hệ thống
                </p>
              </div>
              <button
                type="button"
                className="account-modal-v2__close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveAccount} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="account-modal-v2__body">
                <div className="account-form-grid">
                  <div className="account-form-field">
                    <label>Tên đăng nhập *</label>
                    <input
                      type="text"
                      className="account-form-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập username..."
                      required
                    />
                  </div>

                  <div className="account-form-field">
                    <label>Tên hiển thị *</label>
                    <input
                      type="text"
                      className="account-form-input"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A..."
                      required
                    />
                  </div>

                  {/* Password input with show/hide eye toggle */}
                  <div className="account-form-field">
                    <label>Mật khẩu {editingId ? "(Bỏ trống nếu giữ nguyên)" : "*"}</label>
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="account-form-input"
                        style={{ paddingRight: "42px" }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự..."
                        required={!editingId}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1.1rem",
                          color: "#64748b",
                          padding: "2px 4px"
                        }}
                        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? "👁️" : "🙈"}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password input with show/hide eye toggle */}
                  <div className="account-form-field">
                    <label>Nhập lại mật khẩu {editingId ? "(Bỏ trống nếu không đổi)" : "*"}</label>
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="account-form-input"
                        style={{ paddingRight: "42px" }}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Xác nhận lại mật khẩu..."
                        required={!editingId || Boolean(password)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1.1rem",
                          color: "#64748b",
                          padding: "2px 4px"
                        }}
                        title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showConfirmPassword ? "👁️" : "🙈"}
                      </button>
                    </div>
                  </div>

                  {/* Role Selector full width */}
                  <div className="account-form-field" style={{ gridColumn: "span 2" }}>
                    <label>Vai trò hệ thống (Role) *</label>
                    <select
                      className="account-role-select-box"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                    >
                      <option value="SUPER_ADMIN">SUPER_ADMIN - Toàn quyền quản trị hệ thống</option>
                      <option value="ADMIN">ADMIN - Quản trị nội dung & bảng giá</option>
                      <option value="BLOG_EDITOR">BLOG_EDITOR - Chỉ quản lý Blog & Media</option>
                    </select>
                  </div>
                </div>

                {/* Separate Active Status Box */}
                <div className="account-active-card">
                  <div>
                    <strong style={{ fontSize: "0.9rem", color: "#0f172a", display: "block" }}>
                      Trạng thái hoạt động (Active Status)
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      Tài khoản sau khi kích hoạt có thể đăng nhập vào hệ thống Admin
                    </span>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "#0f6fec", cursor: "pointer" }}
                    />
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: active ? "#087443" : "#991b1b" }}>
                      {active ? "🟢 Kích hoạt" : "🔴 Tạm khóa"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="account-modal-v2__footer">
                <button
                  type="button"
                  className="account-modal-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="account-modal-btn-save"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
