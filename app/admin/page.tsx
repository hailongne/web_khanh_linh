"use client";

import React, { useEffect, useMemo, useState } from "react";
import "./admin.css";
import ToastContainer from "../components/toast/ToastContainer";
import { showToast } from "../components/toast/toastService";

const MENU_ITEMS: { key: MenuKey; label: string; icon: string }[] = [
  { key: "vehicles", label: "Đội xe", icon: "fas fa-car-side" },
  { key: "pricing", label: "Bảng giá", icon: "fas fa-money-bill-wave" },
  { key: "sales", label: "Chuyên viên", icon: "fas fa-user-tie" },
  { key: "testimonials", label: "Đánh giá", icon: "fas fa-star" },
  { key: "faq", label: "Câu hỏi", icon: "fas fa-question-circle" },
  { key: "account", label: "Tài khoản", icon: "fas fa-user-shield" }
];

type MenuKey = "vehicles" | "pricing" | "sales" | "testimonials" | "faq" | "account";

type Vehicle = {
  id: string;
  name: string;
  badge: string;
  price: string;
  image: string;
  specs: { label: string; icon: string }[];
};

type LocalizedVehicle = {
  id: string;
  vi: Vehicle;
  en: Vehicle;
};

type PricingRow = {
  vehicle: string;
  cityTour: string;
  provinceTrip: string;
  airport: string;
};

type PricingData = {
  heading: string;
  lead: string;
  note: string;
  cols: string[];
  rows: PricingRow[];
};

type SalesPerson = {
  id: string;
  name: string;
  phone: string;
  zalo: string;
  avatar: string;
};

type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  badge: string;
  tag: string;
  initials: string;
};

type TestimonialStat = { value: string; label: string };

type TestimonialsData = {
  heading: string;
  lead: string;
  scoreLabel: string;
  items: TestimonialItem[];
  stats: TestimonialStat[];
};

type FaqItem = { question: string; answer: string };

type FaqData = {
  heading: string;
  lead: string;
  items: FaqItem[];
};

type AccountInfo = {
  username: string;
  createdAt: string | null;
  updatedAt: string | null;
};

function buildHeaders(currentUsername: string, currentPassword: string) {
  return {
    "Content-Type": "application/json",
    "x-admin-username": currentUsername,
    "x-admin-password": currentPassword
  };
}

// Admin Warning Toast Component
function AdminWarningToast({
  message,
  onClose
}: {
  message: string;
  onClose: () => void;
}) {
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsHiding(true);
      const hideTimer = window.setTimeout(onClose, 320);
      return () => window.clearTimeout(hideTimer);
    }, 30000);

    return () => window.clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    setIsHiding(true);
    const timer = window.setTimeout(onClose, 320);
    return () => window.clearTimeout(timer);
  };

  return (
    <div
      className={`admin-warning-toast ${isHiding ? "is-hiding" : ""}`}
      onClick={handleClick}
      role="alert"
      aria-live="assertive"
    >
      {message}
    </div>
  );
}

// Confirm Dialog Component
function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel
}: {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="confirm-dialog__overlay" onClick={onCancel} />
      <div className="confirm-dialog">
        <div className="confirm-dialog__content">
          <h2 className="confirm-dialog__title">{title}</h2>
          {message && <p className="confirm-dialog__message">{message}</p>}
          <div className="confirm-dialog__buttons">
            <button
              className="confirm-dialog__button confirm-dialog__button--cancel"
              onClick={onCancel}
              type="button"
            >
              {cancelText}
            </button>
            <button
              className="confirm-dialog__button confirm-dialog__button--confirm"
              onClick={onConfirm}
              type="button"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuKey>("vehicles");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [confirm, setConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {}
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedUsername = sessionStorage.getItem("admin-username");
    const savedPassword = sessionStorage.getItem("admin-password");
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setAuthorized(true);
    }
  }, []);

  // show existing messages as toasts (do not change business logic)
  useEffect(() => {
    if (error) {
      showToast("error", error);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      showToast("success", successMessage);
    }
  }, [successMessage]);

  

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/data?type=vehicles&lang=vi`, {
        headers: buildHeaders(username, password)
      });
      const raw = await response.text();
      let result: any = null;
      try {
        result = raw ? JSON.parse(raw) : null;
      } catch {
        result = null;
      }
      if (!response.ok) {
        throw new Error(result?.error || "Đăng nhập thất bại");
      }
      setAuthorized(true);
      sessionStorage.setItem("admin-username", username);
      sessionStorage.setItem("admin-password", password);
    } catch (err) {
      setAuthorized(false);
      if (err instanceof Error) {
        if (err.message === "Unauthorized") {
          setError("Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Lỗi đăng nhập.");
      }
    } finally {
      setLoading(false);
    }
  }

  function openConfirm(
    title: string,
    onConfirm: () => void,
    confirmText: string = "Xác nhận",
    cancelText: string = "Hủy",
    message?: string
  ) {
    setConfirm({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm
    });
  }

  function closeConfirm() {
    setConfirm({ ...confirm, isOpen: false });
  }

  function handleLogout() {
    openConfirm(
      "Bạn có chắc chắn không?",
      () => {
        sessionStorage.removeItem("admin-username");
        sessionStorage.removeItem("admin-password");
        setUsername("");
        setPassword("");
        setAuthorized(false);
        closeConfirm();
      },
      "Đăng xuất",
      "Hủy"
    );
  }

  function showError(message: string) {
    setError(message);
    setSuccessMessage(null);
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setError(null);
  }

  function handleCredentialsChange(nextUsername: string, nextPassword: string) {
    setUsername(nextUsername);
    setPassword(nextPassword);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin-username", nextUsername);
      sessionStorage.setItem("admin-password", nextPassword);
    }
  }

  if (!authorized) {
    return (
      <main className="admin-shell">
        <ToastContainer />
        <div className="admin-card admin-card--login">
          <div className="admin-header admin-header--center">
            <div>
              <p className="admin-tag">Quản trị nội dung</p>
              <h1>Admin Dashboard</h1>
              <p>Địa chỉ riêng: <strong>/admin</strong></p>
            </div>
          </div>

          <form className="admin-form" onSubmit={handleLogin}>
            <label>
              Tên đăng nhập
              <div className="admin-input-wrap">
                <span className="admin-input-icon" aria-hidden="true">
                  <i className="fas fa-user" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
            </label>
            <label>
              Mật khẩu
              <div className="admin-input-wrap">
                <span className="admin-input-icon" aria-hidden="true">
                  <i className="fas fa-lock" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  className="admin-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </label>
            <button className="admin-button" type="submit" disabled={loading || !username.trim() || !password.trim()}>
              Đăng nhập
            </button>
            {error && (
              <div className="admin-alert admin-alert--error admin-login-error">
                <i className="fas fa-circle-exclamation" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-app">
      <ToastContainer />
      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
      <aside className={`admin-sidebar${mobileSidebarOpen ? " is-open" : ""}`}>
        <div className="admin-sidebar__brand">
          <div>
            <strong>Admin</strong>
            <span>Khánh Linh Trans</span>
          </div>
        </div>
        <nav className="admin-sidebar__nav">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={menu === item.key ? "is-active" : ""}
              onClick={() => {
                setMenu(item.key);
                setMobileSidebarOpen(false);
              }}
            >
              <span className="admin-sidebar__icon">
                <i className={item.icon} aria-hidden="true" />
              </span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <button className="admin-button admin-button--ghost admin-sidebar__logout" type="button" onClick={handleLogout}>
            <i className="fas fa-right-from-bracket" aria-hidden="true" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-topbar__menu"
            onClick={() => setMobileSidebarOpen((open) => !open)}
            aria-label="Mở menu"
          >
            ☰
          </button>
          <h2 className="admin-topbar__title">{MENU_ITEMS.find((item) => item.key === menu)?.label}</h2>
          <div />
        </header>

        <main className="admin-content">
          {menu === "vehicles" && (
            <VehiclesPanel
              username={username}
              password={password}
              onError={showError}
              onSuccess={showSuccess}
              setLoading={setLoading}
            />
          )}
          {menu === "pricing" && (
            <PricingPanel
              username={username}
              password={password}
              onError={showError}
              onSuccess={showSuccess}
              setLoading={setLoading}
              openConfirm={openConfirm}
            />
          )}
          {menu === "sales" && (
            <SalesPanel
              username={username}
              password={password}
              onError={showError}
              onSuccess={showSuccess}
              setLoading={setLoading}
              openConfirm={openConfirm}
            />
          )}
          {menu === "testimonials" && (
            <TestimonialsPanel
              username={username}
              password={password}
              onError={showError}
              onSuccess={showSuccess}
              setLoading={setLoading}
              openConfirm={openConfirm}
            />
          )}
          {menu === "faq" && (
            <FaqPanel
              username={username}
              password={password}
              onError={showError}
              onSuccess={showSuccess}
              setLoading={setLoading}
              openConfirm={openConfirm}
            />
          )}
          {menu === "account" && (
            <AccountPanel
              username={username}
              password={password}
              onError={showError}
              onSuccess={showSuccess}
              setLoading={setLoading}
              onCredentialsChange={handleCredentialsChange}
            />
          )}
        </main>
      </div>

      {mobileSidebarOpen && (
        <div className="admin-sidebar__overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}
    </div>
  );
}

function useAdminFetch(username: string, password: string) {
  return useMemo(
    () => ({
      get: async (url: string) => {
        const response = await fetch(url, { headers: buildHeaders(username, password) });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Lỗi tải dữ liệu");
        return result;
      },
      put: async (url: string, body: unknown) => {
        const response = await fetch(url, {
          method: "PUT",
          headers: buildHeaders(username, password),
          body: JSON.stringify(body)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Lỗi lưu dữ liệu");
        return result;
      },
      post: async (url: string, body: unknown) => {
        const response = await fetch(url, {
          method: "POST",
          headers: buildHeaders(username, password),
          body: JSON.stringify(body)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Lỗi thêm dữ liệu");
        return result;
      },
      del: async (url: string) => {
        const response = await fetch(url, {
          method: "DELETE",
          headers: buildHeaders(username, password)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Lỗi xóa dữ liệu");
        return result;
      }
    }),
    [username, password]
  );
}

function AccountPanel({
  username,
  password,
  onError,
  onSuccess,
  setLoading,
  onCredentialsChange
}: {
  username: string;
  password: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  setLoading: (value: boolean) => void;
  onCredentialsChange: (nextUsername: string, nextPassword: string) => void;
}) {
  const [info, setInfo] = useState<AccountInfo>({
    username,
    createdAt: null,
    updatedAt: null
  });
  const [newUsername, setNewUsername] = useState(username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setNewUsername(username);
  }, [username]);

  useEffect(() => {
    loadAccountInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, password]);

  function formatDate(value: string | null) {
    if (!value) return "Chưa có";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Chưa có";
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  async function loadAccountInfo() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/account", {
        headers: buildHeaders(username, password)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Lỗi tải thông tin tài khoản");
      }
      const data = result?.data as AccountInfo;
      setInfo(data);
      setNewUsername(data.username);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi tải thông tin tài khoản");
    } finally {
      setLoading(false);
    }
  }

  async function submitUsername(event: React.FormEvent) {
    event.preventDefault();
    const normalizedNewUsername = newUsername.trim();
    if (!normalizedNewUsername) {
      onError("Username mới không được để trống.");
      return;
    }
    if (normalizedNewUsername === info.username) {
      onError("Username mới không được trùng username hiện tại.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/account", {
        method: "PUT",
        headers: buildHeaders(username, password),
        body: JSON.stringify({
          action: "username",
          currentUsername: info.username,
          newUsername: normalizedNewUsername
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Không thể đổi username");
      }

      const updated = result?.data as AccountInfo;
      setInfo(updated);
      setNewUsername(updated.username);
      onCredentialsChange(updated.username, password);
      onSuccess("Đổi username thành công.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Không thể đổi username");
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword(event: React.FormEvent) {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      onError("Vui lòng nhập đầy đủ các trường mật khẩu.");
      return;
    }

    if (newPassword !== confirmPassword) {
      onError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    if (newPassword.length < 8) {
      onError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/account", {
        method: "PUT",
        headers: buildHeaders(username, password),
        body: JSON.stringify({
          action: "password",
          currentPassword,
          newPassword,
          confirmPassword
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Không thể đổi mật khẩu");
      }

      const updated = result?.data as AccountInfo;
      setInfo(updated);
      onCredentialsChange(updated.username, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess("Đổi mật khẩu thành công.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Không thể đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-language-card admin-language-card--account-info">
        <div className="admin-form">
          <div>
            <strong>Tên đăng nhập:</strong> {info.username}
          </div>
          <div>
            <strong>Ngày tạo:</strong> {formatDate(info.createdAt)}
          </div>
          <div>
            <strong>Ngày cập nhật gần nhất:</strong> {formatDate(info.updatedAt)}
          </div>
        </div>
      </div>
      <div className="admin-language-grid">

        <div className="admin-language-card">
          <h3>Đổi Tên Đăng Nhập</h3>
          <form className="admin-form" onSubmit={submitUsername}>
            <label>
              Tên đăng nhập hiện tại
              <input type="text" value={info.username} readOnly />
            </label>
            <label>
              Tên đăng nhập mới
              <input
                type="text"
                value={newUsername}
                onChange={(event) => setNewUsername(event.target.value)}
                placeholder="Nhập tên đăng nhập mới"
              />
            </label>
            <div className="admin-form__actions">
              <button className="admin-button" type="submit">
                Cập nhật Tên Đăng Nhập
              </button>
            </div>
          </form>
        </div>

        <div className="admin-language-card">
          <h3>Đổi Password</h3>
          <form className="admin-form admin-form--password" onSubmit={submitPassword}>
            <label>
              Mật khẩu hiện tại
              <div className="admin-input-wrap">
                <span className="admin-input-icon" aria-hidden="true">
                  <i className="fas fa-lock" />
                </span>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  className="admin-password-toggle"
                  type="button"
                  onClick={() => setShowCurrentPassword((value) => !value)}
                  aria-label={showCurrentPassword ? "Ẩn mật khẩu hiện tại" : "Hiện mật khẩu hiện tại"}
                  title={showCurrentPassword ? "Ẩn mật khẩu hiện tại" : "Hiện mật khẩu hiện tại"}
                >
                  <i className={`fas ${showCurrentPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </label>
            <label>
              Mật khẩu mới
              <div className="admin-input-wrap">
                <span className="admin-input-icon" aria-hidden="true">
                  <i className="fas fa-lock" />
                </span>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  className="admin-password-toggle"
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  aria-label={showNewPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                  title={showNewPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                >
                  <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </label>
            <label>
              Xác nhận mật khẩu mới
              <div className="admin-input-wrap">
                <span className="admin-input-icon" aria-hidden="true">
                  <i className="fas fa-lock" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  className="admin-password-toggle"
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                  title={showConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                >
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </label>
            <div className="admin-form__actions">
              <button className="admin-button" type="submit">
                Cập nhật Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function VehiclesPanel({
  username,
  password,
  onError,
  onSuccess,
  setLoading
}: {
  username: string;
  password: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  setLoading: (value: boolean) => void;
}) {
  const api = useAdminFetch(username, password);
  const [items, setItems] = useState<LocalizedVehicle[]>([]);
  const [viForm, setViForm] = useState<{
    name: string;
    badge: string;
    price: string;
    image: string;
    specs: string;
  }>({ name: "", badge: "", price: "", image: "", specs: "" });
  const [enForm, setEnForm] = useState<{
    name: string;
    badge: string;
    price: string;
    image: string;
    specs: string;
  }>({ name: "", badge: "", price: "", image: "", specs: "" });
  const [sharedImageFile, setSharedImageFile] = useState<File | null>(null);
  const [sharedImagePreview, setSharedImagePreview] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (warning) showToast("warning", warning);
  }, [warning]);

  useEffect(() => {
    if (warning) showToast("warning", warning);
  }, [warning]);

  useEffect(() => {
    if (warning) showToast("warning", warning);
  }, [warning]);
  const [initialViForm, setInitialViForm] = useState<{ name: string; badge: string; price: string; image: string; specs: string } | null>(null);
  const [initialEnForm, setInitialEnForm] = useState<{ name: string; badge: string; price: string; image: string; specs: string } | null>(null);

  useEffect(() => {
    if (warning) showToast("warning", warning);
  }, [warning]);

  function openCreate() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(item: LocalizedVehicle) {
    fillForm(item);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    resetForm();
  }

  async function handleDeleteInModal() {
    if (!editingId) return;
    await deleteItem(editingId);
    closeModal();
  }

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const [viResult, enResult] = await Promise.all([
        api.get("/api/admin/data?type=vehicles&lang=vi"),
        api.get("/api/admin/data?type=vehicles&lang=en")
      ]);
      const viItems = (viResult.items ?? []) as Vehicle[];
      const enItems = (enResult.items ?? []) as Vehicle[];
      const merged = viItems.map((item) => ({
        id: item.id,
        vi: item,
        en: enItems.find((entry) => entry.id === item.id) ?? item
      }));
      setItems(merged);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setViForm({ name: "", badge: "", price: "", image: "", specs: "" });
    setEnForm({ name: "", badge: "", price: "", image: "", specs: "" });
    setSharedImageFile(null);
    setSharedImagePreview("");
    setEditingId(null);
    setWarning(null);
    setInitialViForm(null);
    setInitialEnForm(null);
  }

  function fillForm(item: LocalizedVehicle) {
    setEditingId(item.id);
    setViForm({
      name: item.vi.name,
      badge: item.vi.badge,
      price: item.vi.price,
      image: item.vi.image,
      specs: item.vi.specs.map((spec) => spec.label).join(", ")
    });
    setEnForm({
      name: item.en.name,
      badge: item.en.badge,
      price: item.en.price,
      image: item.en.image,
      specs: item.en.specs.map((spec) => spec.label).join(", ")
    });
    // remember originals so we can detect per-language edits
    setInitialViForm({
      name: item.vi.name,
      badge: item.vi.badge,
      price: item.vi.price,
      image: item.vi.image,
      specs: item.vi.specs.map((spec) => spec.label).join(", ")
    });
    setInitialEnForm({
      name: item.en.name,
      badge: item.en.badge,
      price: item.en.price,
      image: item.en.image,
      specs: item.en.specs.map((spec) => spec.label).join(", ")
    });
    setSharedImageFile(null);
    setSharedImagePreview(item.vi.image || item.en.image);
  }

  function formsEqual(a: { name: string; badge: string; price: string; image: string; specs: string } | null, b: { name: string; badge: string; price: string; image: string; specs: string } | null) {
    if (!a || !b) return false;
    return a.name === b.name && a.badge === b.badge && a.price === b.price && a.image === b.image && a.specs === b.specs;
  }

  function updateWarningFrom(vi: { name: string; badge: string; price: string; image: string; specs: string }, en: { name: string; badge: string; price: string; image: string; specs: string }) {
    // if no editing id (creating new) then no warning
    if (!editingId) {
      setWarning(null);
      return;
    }
    const viOrig = initialViForm;
    const enOrig = initialEnForm;
    // if originals unavailable, don't show warning
    if (!viOrig || !enOrig) {
      setWarning(null);
      return;
    }
    const viChanged = !formsEqual(vi, viOrig);
    const enChanged = !formsEqual(en, enOrig);
    // show warning only when exactly one language changed
    if ((viChanged && !enChanged) || (!viChanged && enChanged)) {
      setWarning("Cảnh báo: hãy chỉnh sửa hai ngôn ngữ trước khi lưu.");
    } else {
      setWarning(null);
    }
  }

  function handleFieldChange(lang: "vi" | "en", field: string, value: string) {
    if (lang === "vi") {
      setViForm((prev) => {
        const next = { ...prev, [field]: value };
        updateWarningFrom(next, enForm);
        return next;
      });
    } else {
      setEnForm((prev) => {
        const next = { ...prev, [field]: value };
        updateWarningFrom(viForm, next);
        return next;
      });
    }
  }

  function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (sharedImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(sharedImagePreview);
    }
    setSharedImageFile(file);
    setSharedImagePreview(previewUrl);
    setWarning(
      "Cảnh báo: hình ảnh vừa được thay đổi. Ảnh mới sẽ được dùng cho cả hai ngôn ngữ khi lưu."
    );
    event.currentTarget.value = "";
  }

  async function uploadImage(file: File, oldPath?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (oldPath) {
      formData.append("oldPath", oldPath);
    }

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      headers: {
        "x-admin-username": username,
        "x-admin-password": password
      },
      body: formData
    });

    const result = await response.json();
    if (!response.ok || !result?.path) {
      throw new Error(result?.error || "Lỗi tải ảnh lên");
    }

    return result.path as string;
  }

  useEffect(() => {
    return () => {
      if (sharedImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(sharedImagePreview);
      }
    };
  }, [sharedImagePreview]);

  function getNextVehicleId() {
    const numericIds = items
      .map((item) => Number.parseInt(item.id, 10))
      .filter((value): value is number => Number.isFinite(value));
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return String(maxId + 1);
  }

  async function saveItem(event: React.FormEvent) {
    event.preventDefault();
    const vehicleId = editingId || getNextVehicleId();
    const currentImagePath = viForm.image.trim() || enForm.image.trim();
    const sharedImagePath = sharedImageFile
      ? await uploadImage(sharedImageFile, currentImagePath)
      : currentImagePath;

    const viPayload = {
      id: vehicleId,
      name: viForm.name.trim(),
      badge: viForm.badge.trim(),
      price: viForm.price.trim(),
      image: sharedImagePath,
      specs: viForm.specs
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((label) => ({ label, icon: "seat" }))
    };
    const enPayload = {
      id: vehicleId,
      name: enForm.name.trim(),
      badge: enForm.badge.trim(),
      price: enForm.price.trim(),
      image: sharedImagePath,
      specs: enForm.specs
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((label) => ({ label, icon: "seat" }))
    };

    setLoading(true);
    try {
      if (editingId) {
        await Promise.all([
          api.put(`/api/admin/data?type=vehicles&lang=vi&id=${editingId}`, viPayload),
          api.put(`/api/admin/data?type=vehicles&lang=en&id=${editingId}`, enPayload)
        ]);
        onSuccess("Cập nhật xe thành công.");
      } else {
        await Promise.all([
          api.post("/api/admin/data?type=vehicles&lang=vi", viPayload),
          api.post("/api/admin/data?type=vehicles&lang=en", enPayload)
        ]);
        onSuccess("Thêm xe mới thành công.");
      }
      await loadItems();
      closeModal();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Bạn có chắc muốn xóa xe này?")) return;
    setLoading(true);
    try {
      await Promise.all([
        api.del(`/api/admin/data?type=vehicles&lang=vi&id=${id}`),
        api.del(`/api/admin/data?type=vehicles&lang=en&id=${id}`)
      ]);
      onSuccess("Xóa xe thành công.");
      await loadItems();
      if (editingId === id) resetForm();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi xóa dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="admin-section">
        <div className="admin-table">
          <div className="admin-table__row admin-table__header">
            <div>Hình</div>
            <div>Tên xe</div>
            <div>Badge</div>
            <div>Giá</div>
            <div>
              <button className="admin-button" type="button" onClick={openCreate}>
                Thêm sản phẩm
              </button>
            </div>
          </div>
          {items.length === 0 ? (
            <div className="admin-table__row admin-table__empty">Không có sản phẩm nào.</div>
          ) : (
            items.map((item) => (
              <div className="admin-table__row" key={item.id}>
                <div data-label="Hình">
                  <img src={item.vi.image} alt={item.vi.name} className="admin-thumb" />
                </div>
                <div data-label="Tên xe">{item.vi.name}</div>
                <div data-label="Badge">{item.vi.badge}</div>
                <div data-label="Giá">{item.vi.price}</div>
                <div className="admin-actions" data-label="Thao tác">
                  <button
                    className="admin-button admin-button--ghost"
                    type="button"
                    onClick={() => openEdit(item)}
                  >
                    Điều chỉnh
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>{editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <button className="admin-modal__close" type="button" onClick={closeModal} aria-label="Đóng">
                ×
              </button>
            </div>
            {warning && (
              <div className="admin-alert admin-alert--warning">
                {warning}
              </div>
            )}
            <form className={`admin-form admin-form--grid ${warning ? 'has-alert' : ''}`} onSubmit={saveItem}>
              <div className="admin-form__fullwidth">
                  <div className="admin-form__fullwidth">
                    <button className="admin-button_languages">
                      VI
                    </button>
                  <div className="admin-form admin-form--grid">
                    <label>
                      Tên xe
                      <input
                        type="text"
                        value={viForm.name}
                        onChange={(event) => handleFieldChange("vi", "name", event.target.value)}
                        placeholder="Ví dụ: KIA CARNIVAL"
                      />
                    </label>
                    <label>
                      Số lượng
                      <input
                        type="text"
                        value={viForm.badge}
                        onChange={(event) => handleFieldChange("vi", "badge", event.target.value)}
                        placeholder="Ví dụ: 7 chỗ"
                      />
                    </label>
                    <label>
                      Giá
                      <input
                        type="text"
                        value={viForm.price}
                        onChange={(event) => handleFieldChange("vi", "price", event.target.value)}
                        placeholder="Ví dụ: 1.200k/ngày"
                      />
                    </label>
                    <label>
                      Thuộc tính ghế
                      <input
                        type="text"
                        value={viForm.specs}
                        onChange={(event) => handleFieldChange("vi", "specs", event.target.value)}
                        placeholder="Ví dụ: 7 ghế, rộng rãi, điều hòa"
                      />
                    </label>
                  </div>
                </div>
                <div className="admin-form__fullwidth">
                  <button className="admin-button_languages">
                    EN
                  </button>
                  <div className="admin-form admin-form--grid">
                    <label>
                      Name
                      <input
                        type="text"
                        value={enForm.name}
                        onChange={(event) => handleFieldChange("en", "name", event.target.value)}
                        placeholder="Ví dụ: KIA CARNIVAL"
                      />
                    </label>
                    <label>
                      Badge
                      <input
                        type="text"
                        value={enForm.badge}
                        onChange={(event) => handleFieldChange("en", "badge", event.target.value)}
                        placeholder="Ví dụ: 7 chỗ"
                      />
                    </label>
                    <label>
                      Price
                      <input
                        type="text"
                        value={enForm.price}
                        onChange={(event) => handleFieldChange("en", "price", event.target.value)}
                        placeholder="Ví dụ: 1.200k/ngày"
                      />
                    </label>
                    <label>
                      Attribute seats
                      <input
                        type="text"
                        value={enForm.specs}
                        onChange={(event) => handleFieldChange("en", "specs", event.target.value)}
                        placeholder="Ví dụ: 7 ghế, rộng rãi, điều hòa"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <h3>Ảnh xe chung</h3>
              <div className="admin-form__fullwidth">
                <div className="admin-image-upload admin-image-upload--shared">
                  <label className="admin-image-upload__button">
                    <i className="fas fa-cloud-upload-alt admin-image-upload__icon" aria-hidden="true" />
                    <span>{sharedImageFile ? sharedImageFile.name : "Tải ảnh"}</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} />
                  </label>
                  <p className="admin-image-upload__hint">
                    Nếu không chọn ảnh mới, ảnh hiện tại vẫn giữ nguyên.
                  </p>
                </div>
                {(sharedImagePreview || viForm.image || enForm.image) && (
                  <div className="admin-image-preview admin-image-preview--shared">
                    <img
                      src={sharedImagePreview || viForm.image || enForm.image}
                      alt="Ảnh preview chung"
                    />
                  </div>
                )}
              </div>
              <div className="admin-form__actions">
                {editingId && (
                  <button
                    className="admin-button admin-button--danger"
                    type="button"
                    onClick={handleDeleteInModal}
                  >
                    Xóa
                  </button>
                )}
                <div className="admin-actions">
                  <button className="admin-button admin-button--ghost" type="button" onClick={closeModal}>
                    Hủy
                  </button>
                  <button className="admin-button" type="submit">
                    {editingId ? "Lưu thay đổi" : "Thêm sản phẩm"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function PricingPanel({
  username,
  password,
  onError,
  onSuccess,
  setLoading,
  openConfirm
}: {
  username: string;
  password: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  setLoading: (value: boolean) => void;
  openConfirm: (title: string, onConfirm: () => void, confirmText?: string, cancelText?: string, message?: string) => void;
}) {
  const api = useAdminFetch(username, password);
  const [viData, setViData] = useState<PricingData>({
    heading: "",
    lead: "",
    note: "",
    cols: ["", "", "", ""],
    rows: []
  });
  const [enData, setEnData] = useState<PricingData>({
    heading: "",
    lead: "",
    note: "",
    cols: ["", "", "", ""],
    rows: []
  });
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [viResult, enResult] = await Promise.all([
        api.get("/api/admin/data?type=pricing&lang=vi"),
        api.get("/api/admin/data?type=pricing&lang=en")
      ]);
      if (viResult.data) setViData(viResult.data);
      if (enResult.data) setEnData(enResult.data);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  async function saveData(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await Promise.all([
        api.put("/api/admin/data?type=pricing&lang=vi", viData),
        api.put("/api/admin/data?type=pricing&lang=en", enData)
      ]);
      onSuccess("Lưu bảng giá thành công.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  function triggerVietnameseWarning() {
    setWarning("Cảnh báo: bạn vừa chỉnh sửa tiếng Việt. Vui lòng kiểm tra và cập nhật đúng cả hai ngôn ngữ trước khi lưu.");
  }

  function validateRowCount() {
    const msg = "⚠️ Cảnh báo: số lượng hàng không khớp! Tiếng Việt: " + viData.rows.length + " hàng, Tiếng Anh: " + enData.rows.length + " hàng. Vui lòng thêm/xóa hàng để khớp cả hai ngôn ngữ.";
    return msg;
  }

  function updateRow(language: "vi" | "en", index: number, field: keyof PricingRow, value: string) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => {
      const rows = [...prev.rows];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, rows };
    });
    setWarning("Cảnh báo: bạn vừa chỉnh sửa tiếng " + (language === "vi" ? "Việt" : "Anh") + ". Vui lòng kiểm tra và cập nhật đúng cả hai ngôn ngữ trước khi lưu.");
  }

  function addRow(language: "vi" | "en") {
    const setter = language === "vi" ? setViData : setEnData;
    const otherData = language === "vi" ? enData : viData;
    setter((prev) => ({
      ...prev,
      rows: [...prev.rows, { vehicle: "", cityTour: "", provinceTrip: "", airport: "" }]
    }));
    const newCount = (language === "vi" ? viData.rows.length + 1 : enData.rows.length + 1);
    if (otherData.rows.length !== newCount) {
      setWarning("⚠️ Cảnh báo: số lượng hàng không khớp! Tiếng Việt: " + (language === "vi" ? newCount : viData.rows.length) + " hàng, Tiếng Anh: " + (language === "en" ? newCount : enData.rows.length) + " hàng. Vui lòng thêm hàng tương ứng cho tiếng " + (language === "vi" ? "Anh" : "Việt") + ".");
    } else {
      triggerVietnameseWarning();
    }
  }

  function removeRow(language: "vi" | "en", index: number) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, idx) => idx !== index)
    }));
    const otherData = language === "vi" ? enData : viData;
    const newCount = (language === "vi" ? viData.rows.length - 1 : enData.rows.length - 1);
    if (otherData.rows.length !== newCount) {
      setWarning("⚠️ Cảnh báo: số lượng hàng không khớp! Tiếng Việt: " + (language === "vi" ? newCount : viData.rows.length) + " hàng, Tiếng Anh: " + (language === "en" ? newCount : enData.rows.length) + " hàng. Vui lòng xóa hàng tương ứng cho tiếng " + (language === "vi" ? "Anh" : "Việt") + ".");
    }
  }

  function confirmRemoveRow(language: "vi" | "en", index: number) {
    openConfirm(
      "Bạn có chắc chắn không?",
      () => removeRow(language, index),
      "Xóa",
      "Hủy"
    );
  }

  function updateCol(language: "vi" | "en", index: number, value: string) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => {
      const cols = [...prev.cols];
      cols[index] = value;
      return { ...prev, cols };
    });
    setWarning("Cảnh báo: bạn vừa chỉnh sửa tiếng " + (language === "vi" ? "Việt" : "Anh") + ". Vui lòng kiểm tra và cập nhật đúng cả hai ngôn ngữ trước khi lưu.");
  }

  function updateField(language: "vi" | "en", field: keyof PricingData, value: string) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => ({ ...prev, [field]: value } as PricingData));
    setWarning("Cảnh báo: bạn vừa chỉnh sửa tiếng " + (language === "vi" ? "Việt" : "Anh") + ". Vui lòng kiểm tra và cập nhật đúng cả hai ngôn ngữ trước khi lưu.");
  }

  return (
    <section className="admin-section">
        <h2>Nội dung bảng giá</h2>
        {warning && <AdminWarningToast message={warning} onClose={() => setWarning(null)} />}
        <form className="admin-form admin-form--grid" onSubmit={saveData}>
          <div className="admin-form__fullwidth admin-language-grid">
            <div className="admin-language-card">
              <div className="admin-language-card__header">
                <div>
                  <h3>Tiếng Việt</h3>
                  <p className="admin-language-card__subtitle">Chỉnh sửa nội dung tiếng Việt. Thay đổi sẽ tạo cảnh báo đồng nhất.</p>
                </div>
              </div>
              <div className="admin-language-card__fields">
                <label>
                  Tiêu đề
                  <input type="text" value={viData.heading} onChange={(event) => updateField("vi", "heading", event.target.value)} />
                </label>
                <label>
                  Mô tả
                  <input type="text" value={viData.lead} onChange={(event) => updateField("vi", "lead", event.target.value)} />
                </label>
                <label>
                  Ghi chú
                  <input type="text" value={viData.note} onChange={(event) => updateField("vi", "note", event.target.value)} />
                </label>
              </div>
              <div className="admin-pricing-table-wrap">
                <table className="admin-pricing-table">
                  <thead>
                    <tr>
                      <th>{viData.cols[0] || "Loại xe"}</th>
                      <th>{viData.cols[1] || "City Tour (1 ngày)"}</th>
                      <th>{viData.cols[2] || "Đi tỉnh (từ 100km)"}</th>
                      <th>{viData.cols[3] || "Sân bay (1 chiều)"}</th>
                      <th className="admin-pricing-table__actions-col">Hành động</th>
                    </tr>
                    <tr className="admin-pricing-table__edit-row">
                      {viData.cols.map((col, idx) => (
                        <th key={idx}>
                          <input
                            aria-label={`Tiêu đề cột ${idx + 1}`}
                            className="admin-pricing-cell-input"
                            type="text"
                            value={col}
                            onChange={(event) => updateCol("vi", idx, event.target.value)}
                          />
                        </th>
                      ))}
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {viData.rows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="admin-pricing-table__empty">
                          Chưa có dòng nào. Nhấn + Thêm hàng mới để thêm dữ liệu.
                        </td>
                      </tr>
                    ) : (
                      viData.rows.map((row, idx) => (
                        <tr key={idx} className="admin-pricing-table__row">
                          <td>
                            <input type="text" value={row.vehicle} onChange={(event) => updateRow("vi", idx, "vehicle", event.target.value)} />
                          </td>
                          <td>
                            <input type="text" value={row.cityTour} onChange={(event) => updateRow("vi", idx, "cityTour", event.target.value)} />
                          </td>
                          <td>
                            <input type="text" value={row.provinceTrip} onChange={(event) => updateRow("vi", idx, "provinceTrip", event.target.value)} />
                          </td>
                          <td>
                            <input type="text" value={row.airport} onChange={(event) => updateRow("vi", idx, "airport", event.target.value)} />
                          </td>
                          <td>
                            <button className="admin-button admin-button--danger admin-button--small" type="button" onClick={() => confirmRemoveRow("vi", idx)}>
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="admin-language-card__footer">
                <button className="admin-button admin-button--ghost" type="button" onClick={() => addRow("vi")}>+ Thêm hàng mới</button>
              </div>
            </div>
            <div className="admin-language-card admin-language-card--second">
              <div className="admin-language-card__header">
                <div>
                  <h3>Tiếng Anh</h3>
                  <p className="admin-language-card__subtitle">Chỉnh sửa nội dung tiếng Anh.</p>
                </div>
              </div>
              <div className="admin-language-card__fields">
                <label>
                  Tiêu đề
                  <input type="text" value={enData.heading} onChange={(event) => updateField("en", "heading", event.target.value)} />
                </label>
                <label>
                  Mô tả
                  <input type="text" value={enData.lead} onChange={(event) => updateField("en", "lead", event.target.value)} />
                </label>
                <label>
                  Ghi chú
                  <input type="text" value={enData.note} onChange={(event) => updateField("en", "note", event.target.value)} />
                </label>
              </div>
              <div className="admin-pricing-table-wrap">
                <table className="admin-pricing-table">
                  <thead>
                    <tr>
                      <th>{enData.cols[0] || "Vehicle"}</th>
                      <th>{enData.cols[1] || "City Tour (1 day)"}</th>
                      <th>{enData.cols[2] || "Out-of-town (from 100km)"}</th>
                      <th>{enData.cols[3] || "Airport (one-way)"}</th>
                      <th className="admin-pricing-table__actions-col">Hành động</th>
                    </tr>
                    <tr className="admin-pricing-table__edit-row">
                      {enData.cols.map((col, idx) => (
                        <th key={idx}>
                          <input
                            aria-label={`Column title ${idx + 1}`}
                            className="admin-pricing-cell-input"
                            type="text"
                            value={col}
                            onChange={(event) => updateCol("en", idx, event.target.value)}
                          />
                        </th>
                      ))}
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {enData.rows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="admin-pricing-table__empty">
                          Chưa có dòng nào. Nhấn + Thêm hàng mới để thêm dữ liệu.
                        </td>
                      </tr>
                    ) : (
                      enData.rows.map((row, idx) => (
                        <tr key={idx} className="admin-pricing-table__row">
                          <td>
                            <input type="text" value={row.vehicle} onChange={(event) => updateRow("en", idx, "vehicle", event.target.value)} />
                          </td>
                          <td>
                            <input type="text" value={row.cityTour} onChange={(event) => updateRow("en", idx, "cityTour", event.target.value)} />
                          </td>
                          <td>
                            <input type="text" value={row.provinceTrip} onChange={(event) => updateRow("en", idx, "provinceTrip", event.target.value)} />
                          </td>
                          <td>
                            <input type="text" value={row.airport} onChange={(event) => updateRow("en", idx, "airport", event.target.value)} />
                          </td>
                          <td>
                            <button className="admin-button admin-button--danger admin-button--small" type="button" onClick={() => confirmRemoveRow("en", idx)}>
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="admin-language-card__footer">
                <button className="admin-button admin-button--ghost" type="button" onClick={() => addRow("en")}>+ Thêm hàng mới</button>
              </div>
            </div>
          </div>

          <div className="admin-form__actions">
            <button className="admin-button" type="submit">
              Lưu bảng giá
            </button>
          </div>
        </form>
      </section>
  );
}

function SalesPanel({
  username,
  password,
  onError,
  onSuccess,
  setLoading,
  openConfirm
}: {
  username: string;
  password: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  setLoading: (value: boolean) => void;
  openConfirm: (title: string, onConfirm: () => void, confirmText?: string, cancelText?: string, message?: string) => void;
}) {
  const api = useAdminFetch(username, password);
  const [items, setItems] = useState<SalesPerson[]>([]);
  const [form, setForm] = useState<SalesPerson>({ id: "", name: "", phone: "", zalo: "", avatar: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function openCreate() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(item: SalesPerson) {
    fillForm(item);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    resetForm();
  }

  async function handleDeleteInModal() {
    if (!editingId) return;
    await deleteItem(editingId);
    closeModal();
  }

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const result = await api.get("/api/admin/data?type=sales");
      setItems(result.items ?? []);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ id: "", name: "", phone: "", zalo: "", avatar: "" });
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  }

  function fillForm(item: SalesPerson) {
    setEditingId(String(item.id));
    setForm({ ...item, id: String(item.id) });
    setImageFile(null);
    setImagePreview(item.avatar || "");
  }

  function handleAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(previewUrl);
    event.currentTarget.value = "";
  }

  async function uploadAvatar(file: File, oldPath?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (oldPath) {
      formData.append("oldPath", oldPath);
    }

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      headers: {
        "x-admin-username": username,
        "x-admin-password": password
      },
      body: formData
    });

    const result = await response.json();
    if (!response.ok || !result?.path) {
      throw new Error(result?.error || "Lỗi tải ảnh lên");
    }

    return result.path as string;
  }

  async function handleRemoveAvatar() {
    if (!form.avatar && !imagePreview) return;
    if (!confirm("Bạn có chắc muốn xóa ảnh đại diện này?")) return;

    setLoading(true);
    try {
      const currentAvatarPath = form.avatar;
      if (currentAvatarPath && currentAvatarPath.startsWith("/images/")) {
        await api.del(`/api/admin/upload?path=${encodeURIComponent(currentAvatarPath)}`);
      }

      setForm((prev) => ({ ...prev, avatar: "" }));
      setImageFile(null);
      setImagePreview("");

      if (editingId) {
        await api.put(`/api/admin/data?type=sales&id=${editingId}`, { ...form, avatar: "" });
        onSuccess("Đã xóa ảnh đại diện thành công.");
        await loadItems();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi xóa ảnh đại diện");
    } finally {
      setLoading(false);
    }
  }

  async function saveItem(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      onError("Vui lòng điền tên và số điện thoại.");
      return;
    }

    const currentAvatar = form.avatar.trim();
    const avatarPath = imageFile
      ? await uploadAvatar(imageFile, currentAvatar)
      : currentAvatar;

    const payload = {
      ...form,
      id: editingId || form.id,
      zalo: form.zalo.trim() || `https://zalo.me/${form.phone.replace(/\s+/g, "")}`,
      avatar: avatarPath
    };

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/api/admin/data?type=sales&id=${editingId}`, payload);
        onSuccess("Cập nhật chuyên viên thành công.");
      } else {
        await api.post("/api/admin/data?type=sales", payload);
        onSuccess("Thêm mới chuyên viên thành công.");
      }
      await loadItems();
      closeModal();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Bạn có chắc muốn xóa chuyên viên này?")) return;
    setLoading(true);
    try {
      setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
      await api.del(`/api/admin/data?type=sales&id=${id}`);
      onSuccess("Xóa chuyên viên thành công.");
      await loadItems();
      if (editingId === id) resetForm();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi xóa dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="admin-section">
        <div className="admin-section-header">
          <h2>Danh sách chuyên viên</h2>
        </div>
        <div className="admin-table admin-table--sales">
          <div className="admin-table__row admin-table__header">
            <div>Ảnh</div>
            <div>Tên</div>
            <div>Số điện thoại</div>
            <div>Zalo</div>
            <div>
              <button className="admin-button" type="button" onClick={openCreate}>
                Thêm mới chuyên viên
              </button>
            </div>
          </div>
          {items.length === 0 ? (
            <div className="admin-table__row admin-table__empty">Không có chuyên viên nào.</div>
          ) : (
            items.map((item, index) => (
              <div
                className="admin-table__row admin-table__row--clickable"
                key={item.id?.trim() || `sales-${index}`}
                onClick={() => openEdit(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openEdit(item);
                  }
                }}
              >
                <div data-label="Ảnh">
                  <img
                    src={item.avatar || "/images/avatar/no-avt.png"}
                    alt={item.name}
                    className="admin-thumb admin-thumb--round"
                  />
                </div>
                <div data-label="Tên">{item.name}</div>
                <div data-label="Số điện thoại">{item.phone}</div>
                <div className="admin-image-path" data-label="Zalo">{item.zalo}</div>
                <div className="admin-actions" data-label="Thao tác">
                  <button
                    className="admin-button admin-button--ghost"
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                  >
                    Điều chỉnh
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>{editingId ? "Chỉnh sửa chuyên viên" : "Thêm mới chuyên viên"}</h2>
              <button className="admin-modal__close" type="button" onClick={closeModal} aria-label="Đóng">
                ×
              </button>
            </div>
            <form className="admin-form admin-form--sales" onSubmit={saveItem}>
              <div className="admin-form__avatar-column">
                <label>
                  Ảnh đại diện
                  <div className="admin-image-upload">
                    <label className="admin-image-upload__button">
                      <i className="fas fa-cloud-upload-alt admin-image-upload__icon" aria-hidden="true" />
                      <span>{imageFile ? imageFile.name : "Tải ảnh"}</span>
                      <input type="file" accept="image/*" onChange={handleAvatarFileChange} />
                    </label>
                    <p className="admin-image-upload__hint">
                      Nếu chọn ảnh mới, ảnh cũ sẽ được thay thế khi lưu.
                    </p>
                  </div>
                </label>
                {(imagePreview || form.avatar) && (
                  <div className="admin-image-preview admin-image-preview--sales">
                    <img src={imagePreview || form.avatar} alt="Xem trước ảnh đại diện" />
                    <button
                      type="button"
                      className="admin-button admin-button--danger admin-button--small"
                      style={{ marginTop: "8px", width: "100%" }}
                      onClick={handleRemoveAvatar}
                    >
                      <i className="fas fa-trash-alt" aria-hidden="true" style={{ marginRight: "6px" }} />
                      Xóa ảnh đại diện
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label>
                  Họ và tên
                  <input type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                </label>
                <label>
                  Số điện thoại
                  <input type="text" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                </label>
                <label className="admin-form__sales-zalo">
                  Link Zalo
                  <input type="text" value={form.zalo} onChange={(event) => setForm({ ...form, zalo: event.target.value })} />
                </label>
              </div>
              <div className="admin-form__actions">
                {editingId && (
                  <button
                    className="admin-button admin-button--danger"
                    type="button"
                    onClick={handleDeleteInModal}
                  >
                    Xóa
                  </button>
                )}
                <div className="admin-actions">
                  <button className="admin-button admin-button--ghost" type="button" onClick={closeModal}>
                    Hủy
                  </button>
                  <button className="admin-button" type="submit">
                    {editingId ? "Lưu thay đổi" : "Thêm mới chuyên viên"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function TestimonialsPanel({
  username,
  password,
  onError,
  onSuccess,
  setLoading,
  openConfirm
}: {
  username: string;
  password: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  setLoading: (value: boolean) => void;
  openConfirm: (title: string, onConfirm: () => void, confirmText?: string, cancelText?: string, message?: string) => void;
}) {
  const api = useAdminFetch(username, password);
  const [viData, setViData] = useState<TestimonialsData>({
    heading: "",
    lead: "",
    scoreLabel: "",
    items: [],
    stats: []
  });
  const [enData, setEnData] = useState<TestimonialsData>({
    heading: "",
    lead: "",
    scoreLabel: "",
    items: [],
    stats: []
  });
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [viResult, enResult] = await Promise.all([
        api.get("/api/admin/data?type=testimonials&lang=vi"),
        api.get("/api/admin/data?type=testimonials&lang=en")
      ]);
      if (viResult.data) setViData(viResult.data);
      if (enResult.data) setEnData(enResult.data);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  async function saveData(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await Promise.all([
        api.put("/api/admin/data?type=testimonials&lang=vi", viData),
        api.put("/api/admin/data?type=testimonials&lang=en", enData)
      ]);
      onSuccess("Lưu đánh giá thành công.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  function updateField(language: "vi" | "en", field: keyof TestimonialsData, value: string) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => ({ ...prev, [field]: value } as TestimonialsData));
    setWarning("Cảnh báo: bạn vừa chỉnh sửa tiếng " + (language === "vi" ? "Việt" : "Anh") + ". Vui lòng kiểm tra và cập nhật đúng cả hai ngôn ngữ trước khi lưu.");
  }

  function updateItem(language: "vi" | "en", index: number, field: keyof TestimonialItem, value: string) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
    setWarning("Cảnh báo: bạn vừa chỉnh sửa tiếng " + (language === "vi" ? "Việt" : "Anh") + ". Vui lòng kiểm tra và cập nhật đúng cả hai ngôn ngữ trước khi lưu.");
  }

  function addItem(language: "vi" | "en") {
    const setter = language === "vi" ? setViData : setEnData;
    const otherData = language === "vi" ? enData : viData;
    setter((prev) => ({
      ...prev,
      items: [...prev.items, { quote: "", name: "", role: "", badge: "", tag: "", initials: "" }]
    }));
    const newCount = (language === "vi" ? viData.items.length + 1 : enData.items.length + 1);
    if (otherData.items.length !== newCount) {
      setWarning("⚠️ Cảnh báo: số lượng phản hồi không khớp! Tiếng Việt: " + (language === "vi" ? newCount : viData.items.length) + ", Tiếng Anh: " + (language === "en" ? newCount : enData.items.length) + ". Vui lòng thêm phản hồi tương ứng cho tiếng " + (language === "vi" ? "Anh" : "Việt") + ".");
    } else {
      setWarning("Cảnh báo: bạn vừa thêm 1 phản hồi tiếng " + (language === "vi" ? "Việt" : "Anh") + ". Vui lòng thêm phản hồi tương ứng cho tiếng " + (language === "vi" ? "Anh" : "Việt") + ".");
    }
  }

  function removeItem(language: "vi" | "en", index: number) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) }));
    const otherData = language === "vi" ? enData : viData;
    const newCount = (language === "vi" ? viData.items.length - 1 : enData.items.length - 1);
    if (otherData.items.length !== newCount) {
      setWarning("⚠️ Cảnh báo: số lượng phản hồi không khớp! Tiếng Việt: " + (language === "vi" ? newCount : viData.items.length) + ", Tiếng Anh: " + (language === "en" ? newCount : enData.items.length) + ". Vui lòng xóa phản hồi tương ứng cho tiếng " + (language === "vi" ? "Anh" : "Việt") + ".");
    }
  }

  function confirmRemoveItem(language: "vi" | "en", index: number) {
    openConfirm(
      "Bạn có chắc chắn không?",
      () => removeItem(language, index),
      "Xóa",
      "Hủy"
    );
  }

  function updateStat(language: "vi" | "en", index: number, field: keyof TestimonialStat, value: string) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => {
      const stats = [...prev.stats];
      stats[index] = { ...stats[index], [field]: value };
      return { ...prev, stats };
    });
    setWarning("Cảnh báo: bạn vừa chỉnh sửa tiếng " + (language === "vi" ? "Việt" : "Anh") + ". Vui lòng kiểm tra và cập nhật đúng cả hai ngôn ngữ trước khi lưu.");
  }

  function addStat(language: "vi" | "en") {
    const setter = language === "vi" ? setViData : setEnData;
    const otherData = language === "vi" ? enData : viData;
    setter((prev) => ({ ...prev, stats: [...prev.stats, { value: "", label: "" }] }));
    const newCount = (language === "vi" ? viData.stats.length + 1 : enData.stats.length + 1);
    if (otherData.stats.length !== newCount) {
      setWarning("⚠️ Cảnh báo: số lượng thống kê không khớp! Tiếng Việt: " + (language === "vi" ? newCount : viData.stats.length) + ", Tiếng Anh: " + (language === "en" ? newCount : enData.stats.length) + ". Vui lòng thêm thống kê tương ứng cho tiếng " + (language === "vi" ? "Anh" : "Việt") + ".");
    } else {
      setWarning("Cảnh báo: bạn vừa thêm 1 thống kê tiếng " + (language === "vi" ? "Việt" : "Anh") + ". Vui lòng thêm thống kê tương ứng cho tiếng " + (language === "vi" ? "Anh" : "Việt") + ".");
    }
  }

  function removeStat(language: "vi" | "en", index: number) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => ({ ...prev, stats: prev.stats.filter((_, idx) => idx !== index) }));
    const otherData = language === "vi" ? enData : viData;
    const newCount = (language === "vi" ? viData.stats.length - 1 : enData.stats.length - 1);
    if (otherData.stats.length !== newCount) {
      setWarning("⚠️ Cảnh báo: số lượng thống kê không khớp! Tiếng Việt: " + (language === "vi" ? newCount : viData.stats.length) + ", Tiếng Anh: " + (language === "en" ? newCount : enData.stats.length) + ". Vui lòng xóa thống kê tương ứng cho tiếng " + (language === "vi" ? "Anh" : "Việt") + ".");
    }
  }

  function confirmRemoveStat(language: "vi" | "en", index: number) {
    openConfirm(
      "Bạn có chắc chắn không?",
      () => removeStat(language, index),
      "Xóa",
      "Hủy"
    );
  }

  return (
    <section className="admin-section">
      <h2>Nội dung đánh giá khách hàng</h2>
      {warning && <AdminWarningToast message={warning} onClose={() => setWarning(null)} />}
      <form className={`admin-form admin-form--grid`} onSubmit={saveData}>
        <div className="admin-form__fullwidth admin-language-grid">
          <div className="admin-language-card">
            <h3>Tiếng Việt</h3>
            <div className="admin-form admin-form--grid">
              <label className="admin-form__fullwidth">
                Tiêu đề
                <input type="text" value={viData.heading} onChange={(event) => updateField("vi", "heading", event.target.value)} />
              </label>
              <label className="admin-form__fullwidth">
                Mô tả
                <input type="text" value={viData.lead} onChange={(event) => updateField("vi", "lead", event.target.value)} />
              </label>
              <label className="admin-form__fullwidth">
                Nhãn điểm
                <input type="text" value={viData.scoreLabel} onChange={(event) => updateField("vi", "scoreLabel", event.target.value)} />
              </label>
              <div className="admin-form__fullwidth">
                <h4>Thống kê</h4>
                {viData.stats.map((stat, idx) => (
                  <div className="admin-form--grid admin-row" key={idx}>
                    <label>
                      Giá trị
                      <input type="text" value={stat.value} onChange={(event) => updateStat("vi", idx, "value", event.target.value)} />
                    </label>
                    <label>
                      Nhãn
                      <input type="text" value={stat.label} onChange={(event) => updateStat("vi", idx, "label", event.target.value)} />
                    </label>
                    <div className="admin-form__actions">
                      <button className="admin-button admin-button--danger" type="button" onClick={() => confirmRemoveStat("vi", idx)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
                <button className="admin-button admin-button--ghost" type="button" onClick={() => addStat("vi")}>
                  + Thêm thống kê
                </button>
              </div>
              <div className="admin-form__fullwidth">
                <h4>Phản hồi</h4>
                {viData.items.map((item, idx) => (
                  <div className="admin-row admin-row--boxed" key={idx}>
                    <label className="admin-form__fullwidth">
                      Nội dung
                      <input type="text" value={item.quote} onChange={(event) => updateItem("vi", idx, "quote", event.target.value)} />
                    </label>
                    <div className="admin-form--grid">
                      <label>
                        Tên khách hàng
                        <input type="text" value={item.name} onChange={(event) => updateItem("vi", idx, "name", event.target.value)} />
                      </label>
                      <label>
                        Vai trò
                        <input type="text" value={item.role} onChange={(event) => updateItem("vi", idx, "role", event.target.value)} />
                      </label>
                      <label>
                        Badge
                        <input type="text" value={item.badge} onChange={(event) => updateItem("vi", idx, "badge", event.target.value)} />
                      </label>
                      <label>
                        Tag
                        <input type="text" value={item.tag} onChange={(event) => updateItem("vi", idx, "tag", event.target.value)} />
                      </label>
                      <label>
                        Chữ cái đầu
                        <input type="text" value={item.initials} onChange={(event) => updateItem("vi", idx, "initials", event.target.value)} />
                      </label>
                    </div>
                    <div className="admin-form__actions">
                      <button className="admin-button admin-button--danger" type="button" onClick={() => confirmRemoveItem("vi", idx)}>
                        Xóa phản hồi
                      </button>
                    </div>
                  </div>
                ))}
                <button className="admin-button admin-button--ghost" type="button" onClick={() => addItem("vi")}>
                  + Thêm phản hồi
                </button>
              </div>
            </div>
          </div>
          <div className="admin-language-card">
            <h3>Tiếng Anh</h3>
            <div className="admin-form admin-form--grid">
              <label className="admin-form__fullwidth">
                Tiêu đề
                <input type="text" value={enData.heading} onChange={(event) => updateField("en", "heading", event.target.value)} />
              </label>
              <label className="admin-form__fullwidth">
                Mô tả
                <input type="text" value={enData.lead} onChange={(event) => updateField("en", "lead", event.target.value)} />
              </label>
              <label className="admin-form__fullwidth">
                Nhãn điểm
                <input type="text" value={enData.scoreLabel} onChange={(event) => updateField("en", "scoreLabel", event.target.value)} />
              </label>
              <div className="admin-form__fullwidth">
                <h4>Thống kê</h4>
                {enData.stats.map((stat, idx) => (
                  <div className="admin-form--grid admin-row" key={idx}>
                    <label>
                      Giá trị
                      <input type="text" value={stat.value} onChange={(event) => updateStat("en", idx, "value", event.target.value)} />
                    </label>
                    <label>
                      Nhãn
                      <input type="text" value={stat.label} onChange={(event) => updateStat("en", idx, "label", event.target.value)} />
                    </label>
                    <div className="admin-form__actions">
                      <button className="admin-button admin-button--danger" type="button" onClick={() => confirmRemoveStat("en", idx)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
                <button className="admin-button admin-button--ghost" type="button" onClick={() => addStat("en")}>
                  + Thêm thống kê
                </button>
              </div>
              <div className="admin-form__fullwidth">
                <h4>Phản hồi</h4>
                {enData.items.map((item, idx) => (
                  <div className="admin-row admin-row--boxed" key={idx}>
                    <label className="admin-form__fullwidth">
                      Nội dung
                      <input type="text" value={item.quote} onChange={(event) => updateItem("en", idx, "quote", event.target.value)} />
                    </label>
                    <div className="admin-form--grid">
                      <label>
                        Tên khách hàng
                        <input type="text" value={item.name} onChange={(event) => updateItem("en", idx, "name", event.target.value)} />
                      </label>
                      <label>
                        Vai trò
                        <input type="text" value={item.role} onChange={(event) => updateItem("en", idx, "role", event.target.value)} />
                      </label>
                      <label>
                        Badge
                        <input type="text" value={item.badge} onChange={(event) => updateItem("en", idx, "badge", event.target.value)} />
                      </label>
                      <label>
                        Tag
                        <input type="text" value={item.tag} onChange={(event) => updateItem("en", idx, "tag", event.target.value)} />
                      </label>
                      <label>
                        Chữ cái đầu
                        <input type="text" value={item.initials} onChange={(event) => updateItem("en", idx, "initials", event.target.value)} />
                      </label>
                    </div>
                    <div className="admin-form__actions">
                      <button className="admin-button admin-button--danger" type="button" onClick={() => confirmRemoveItem("en", idx)}>
                        Xóa phản hồi
                      </button>
                    </div>
                  </div>
                ))}
                <button className="admin-button admin-button--ghost" type="button" onClick={() => addItem("en")}>
                  + Thêm phản hồi
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-form__actions">
          <button className="admin-button" type="submit">
            Lưu đánh giá
          </button>
        </div>
      </form>
    </section>
  );
}

function FaqPanel({
  username,
  password,
  onError,
  onSuccess,
  setLoading,
  openConfirm
}: {
  username: string;
  password: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  setLoading: (value: boolean) => void;
  openConfirm: (title: string, onConfirm: () => void, confirmText?: string, cancelText?: string, message?: string) => void;
}) {
  const api = useAdminFetch(username, password);
  const [viData, setViData] = useState<FaqData>({ heading: "", lead: "", items: [] });
  const [enData, setEnData] = useState<FaqData>({ heading: "", lead: "", items: [] });
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [viResult, enResult] = await Promise.all([
        api.get("/api/admin/data?type=faq&lang=vi"),
        api.get("/api/admin/data?type=faq&lang=en")
      ]);
      if (viResult.data) setViData(viResult.data);
      if (enResult.data) setEnData(enResult.data);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  async function saveData(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await Promise.all([
        api.put("/api/admin/data?type=faq&lang=vi", viData),
        api.put("/api/admin/data?type=faq&lang=en", enData)
      ]);
      onSuccess("Lưu câu hỏi thành công.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Lỗi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  function updateField(language: "vi" | "en", field: keyof FaqData, value: string) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => ({ ...prev, [field]: value } as FaqData));
    setWarning("Cảnh báo: bạn vừa chỉnh sửa tiếng " + (language === "vi" ? "Việt" : "Anh") + ". Vui lòng kiểm tra và cập nhật đúng cả hai ngôn ngữ trước khi lưu.");
  }

  function updateItem(language: "vi" | "en", index: number, field: keyof FaqItem, value: string) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
    setWarning("Cảnh báo: bạn vừa chỉnh sửa tiếng " + (language === "vi" ? "Việt" : "Anh") + ". Vui lòng kiểm tra và cập nhật đúng cả hai ngôn ngữ trước khi lưu.");
  }

  function addItem(language: "vi" | "en") {
    const setter = language === "vi" ? setViData : setEnData;
    const otherData = language === "vi" ? enData : viData;
    setter((prev) => ({ ...prev, items: [...prev.items, { question: "", answer: "" }] }));
    if (otherData.items.length !== (language === "vi" ? viData.items.length : enData.items.length)) {
      setWarning("⚠️ Cảnh báo: số lượng câu hỏi không khớp! Tiếng Việt: " + (language === "vi" ? (viData.items.length + 1) : viData.items.length) + ", Tiếng Anh: " + (language === "en" ? (enData.items.length + 1) : enData.items.length) + ". Vui lòng thêm câu hỏi cho cả hai ngôn ngữ.");
    } else {
      setWarning("Cảnh báo: bạn vừa thêm 1 câu hỏi tiếng " + (language === "vi" ? "Việt" : "Anh") + ". Vui lòng thêm câu hỏi tương ứng cho tiếng " + (language === "vi" ? "Anh" : "Việt") + ".");
    }
  }

  function removeItem(language: "vi" | "en", index: number) {
    const setter = language === "vi" ? setViData : setEnData;
    setter((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) }));
    const otherData = language === "vi" ? enData : viData;
    const newCount = (language === "vi" ? viData.items.length - 1 : enData.items.length - 1);
    if (otherData.items.length !== newCount) {
      setWarning("⚠️ Cảnh báo: số lượng câu hỏi không khớp! Tiếng Việt: " + (language === "vi" ? newCount : viData.items.length) + ", Tiếng Anh: " + (language === "en" ? newCount : enData.items.length) + ". Vui lòng xóa câu hỏi tương ứng cho tiếng " + (language === "vi" ? "Anh" : "Việt") + ".");
    }
  }

  function confirmRemoveItem(language: "vi" | "en", index: number) {
    openConfirm(
      "Bạn có chắc chắn không?",
      () => removeItem(language, index),
      "Xóa",
      "Hủy"
    );
  }

  return (
    <section className="admin-section">
      <h2>Nội dung câu hỏi thường gặp</h2>
      {warning && <AdminWarningToast message={warning} onClose={() => setWarning(null)} />}
      <form className={`admin-form admin-form--grid`} onSubmit={saveData}>
        <div className="admin-form__fullwidth admin-language-grid">
          <div className="admin-language-card">
            <h3>Tiếng Việt</h3>
            <label className="admin-form__fullwidth">
              Tiêu đề
              <input type="text" value={viData.heading} onChange={(event) => updateField("vi", "heading", event.target.value)} />
            </label>
            <label className="admin-form__fullwidth">
              Mô tả
              <input type="text" value={viData.lead} onChange={(event) => updateField("vi", "lead", event.target.value)} />
            </label>

            <div className="admin-faq-list">
              {viData.items.map((item, idx) => (
                <details className="admin-faq-item" key={idx}>
                  <summary className="admin-faq-item__header">
                    <div className="admin-faq-item__question">{item.question || "Câu hỏi mới"}</div>
                    <div className="admin-faq-item__icon">
                      <i className="fa-icon fas fa-chevron-down fa-fw" aria-hidden="true"></i>
                    </div>
                  </summary>
                  <div className="admin-faq-item__content">
                    <div className="admin-faq-item__form">
                      <div className="admin-faq-item__form-group">
                        <label className="admin-faq-item__form-label">Câu hỏi</label>
                        <input
                          type="text"
                          className="admin-faq-item__form-input"
                          value={item.question}
                          onChange={(event) => updateItem("vi", idx, "question", event.target.value)}
                        />
                      </div>
                      <div className="admin-faq-item__form-group">
                        <label className="admin-faq-item__form-label">Câu trả lời</label>
                        <textarea
                          className="admin-faq-item__form-textarea"
                          value={item.answer}
                          onChange={(event) => updateItem("vi", idx, "answer", event.target.value)}
                        />
                      </div>
                      <div className="admin-faq-item__actions">
                        <button className="admin-button admin-button--danger" type="button" onClick={() => confirmRemoveItem("vi", idx)}>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
              <button className="admin-button admin-button--ghost" type="button" onClick={() => addItem("vi")}>
                + Thêm câu hỏi
              </button>
            </div>
          </div>
          <div className="admin-language-card">
            <h3>Tiếng Anh</h3>
            <label className="admin-form__fullwidth">
              Tiêu đề
              <input type="text" value={enData.heading} onChange={(event) => updateField("en", "heading", event.target.value)} />
            </label>
            <label className="admin-form__fullwidth">
              Mô tả
              <input type="text" value={enData.lead} onChange={(event) => updateField("en", "lead", event.target.value)} />
            </label>

            <div className="admin-faq-list">
              {enData.items.map((item, idx) => (
                <details className="admin-faq-item" key={idx}>
                  <summary className="admin-faq-item__header">
                    <div className="admin-faq-item__question">{item.question || "New Question"}</div>
                    <div className="admin-faq-item__icon">
                      <i className="fa-icon fas fa-chevron-down fa-fw" aria-hidden="true"></i>
                    </div>
                  </summary>
                  <div className="admin-faq-item__content">
                    <div className="admin-faq-item__form">
                      <div className="admin-faq-item__form-group">
                        <label className="admin-faq-item__form-label">Question</label>
                        <input
                          type="text"
                          className="admin-faq-item__form-input"
                          value={item.question}
                          onChange={(event) => updateItem("en", idx, "question", event.target.value)}
                        />
                      </div>
                      <div className="admin-faq-item__form-group">
                        <label className="admin-faq-item__form-label">Answer</label>
                        <textarea
                          className="admin-faq-item__form-textarea"
                          value={item.answer}
                          onChange={(event) => updateItem("en", idx, "answer", event.target.value)}
                        />
                      </div>
                      <div className="admin-faq-item__actions">
                        <button className="admin-button admin-button--danger" type="button" onClick={() => confirmRemoveItem("en", idx)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
              <button className="admin-button admin-button--ghost" type="button" onClick={() => addItem("en")}>
                + Add Question
              </button>
            </div>
          </div>
        </div>

        <div className="admin-form__actions">
          <button className="admin-button" type="submit">
            Lưu FAQ
          </button>
        </div>
      </form>
    </section>
  );
}
