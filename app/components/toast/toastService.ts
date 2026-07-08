type ToastType = "success" | "error" | "warning";

type Toast = { id: string; type: ToastType; message: string };

let listeners: ((t: Toast) => void)[] = [];

export function onToast(cb: (t: Toast) => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function showToast(type: ToastType, message: string) {
  const toast: Toast = { id: String(Date.now()) + Math.random().toString(36).slice(2), type, message };
  listeners.forEach((cb) => cb(toast));
  return toast.id;
}

export function clearAllListeners() {
  listeners = [];
}
