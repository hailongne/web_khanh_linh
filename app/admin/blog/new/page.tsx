"use client";

import React from "react";
import AdminAuthGuard from "../../AdminAuthGuard";
import BlogCmsEditor from "../BlogCmsEditor";
import ToastContainer from "../../../components/toast/ToastContainer";

export default function AdminBlogNewPage() {
  return (
    <AdminAuthGuard>
      <ToastContainer />
      <BlogCmsEditor />
    </AdminAuthGuard>
  );
}
