"use client";

import React, { useEffect, useState, useRef } from "react";
import Toast from "./Toast";
import { onToast } from "./toastService";

type ToastItem = { id: string; type: "success" | "error" | "warning"; message: string };

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    const unsub = onToast((t) => {
      setToasts((prev) => {
        // avoid adding identical toast (same type+message) if already visible
        const exists = prev.some((x) => x.type === t.type && x.message === t.message);
        if (exists) return prev;
        return [t, ...prev];
      });
    });
    return unsub;
  }, []);

  // set up auto-dismiss timers for new toasts
  useEffect(() => {
    toasts.forEach((t) => {
      if (!timers.current[t.id]) {
        // auto-dismiss after 30s
        const timer = window.setTimeout(() => {
          const el = document.getElementById("toast-" + t.id);
          if (el) el.classList.add("toast--closing");
          setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 320);
          delete timers.current[t.id];
        }, 30000);
        timers.current[t.id] = timer;
      }
    });
    // cleanup timers for removed toasts
    return () => {
      // no-op: individual timers cleared on close/remove
    };
  }, [toasts]);

  function handleClose(id: string) {
    // animate out by setting a flag then removing
    const el = document.getElementById("toast-" + id);
    if (el) {
      el.classList.add("toast--closing");
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 320);
    } else {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }
    // clear any auto-dismiss timer
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div id={`toast-${t.id}`} key={t.id}>
          <Toast id={t.id} type={t.type} message={t.message} onClose={handleClose} />
        </div>
      ))}
    </div>
  );
}
