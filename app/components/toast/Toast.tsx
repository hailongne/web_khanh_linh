import React from "react";

type Props = {
  id: string;
  type: "success" | "error" | "warning";
  message: string;
  onClose: (id: string) => void;
};

export default function Toast({ id, type, message, onClose }: Props) {
  return (
    <div
      role="status"
      onClick={() => onClose(id)}
      className={`toast toast--${type}`}
      aria-live="polite"
    >
      <div className="toast__content">{message}</div>
    </div>
  );
}
