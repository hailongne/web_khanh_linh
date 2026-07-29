export type Role = "SUPER_ADMIN" | "ADMIN" | "BLOG_EDITOR";

export interface Account {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  avatar: string;
  role: Role;
  permissions: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

export type MenuItemConfig = {
  key: string;
  label: string;
  icon: string;
  href: string;
  permission: Role[];
};

export const MENU_ITEMS: MenuItemConfig[] = [
  { key: "vehicles", label: "Đội xe", icon: "fas fa-car-side", href: "/admin?tab=vehicles", permission: ["SUPER_ADMIN", "ADMIN"] },
  { key: "pricing", label: "Bảng giá", icon: "fas fa-money-bill-wave", href: "/admin?tab=pricing", permission: ["SUPER_ADMIN", "ADMIN"] },
  { key: "faq", label: "Câu hỏi", icon: "fas fa-question-circle", href: "/admin?tab=faq", permission: ["SUPER_ADMIN", "ADMIN"] },
  { key: "reviews", label: "Đánh giá", icon: "fas fa-quote-right", href: "/admin?tab=reviews", permission: ["SUPER_ADMIN", "ADMIN"] },
  { key: "sales", label: "Chuyên viên", icon: "fas fa-user-tie", href: "/admin?tab=sales", permission: ["SUPER_ADMIN"] },
  { key: "blog", label: "Tin tức", icon: "fas fa-newspaper", href: "/admin/blog", permission: ["SUPER_ADMIN", "ADMIN", "BLOG_EDITOR"] },
  { key: "media", label: "Media", icon: "fas fa-images", href: "/admin/media", permission: ["SUPER_ADMIN", "ADMIN", "BLOG_EDITOR"] },
  { key: "accounts", label: "Quản lý tài khoản", icon: "fas fa-user-shield", href: "/admin/accounts", permission: ["SUPER_ADMIN"] }
];

export function getAccessibleMenuItems(role: Role): MenuItemConfig[] {
  if (!role) return [];
  return MENU_ITEMS.filter((item) => item.permission.includes(role));
}
