"use client";
import React, { useEffect, useRef, useState } from "react";

import db from "../db.json";

type SalesContact = {
  name: string;
  phone: string;
  zalo: string;
  avatar: string;
};

const salesContacts = (db as any).sales as SalesContact[];

type PanelType = "call" | "zalo" | null;

export default function FloatingContactWidget() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const callPanelRef = useRef<HTMLDivElement | null>(null);
  const zaloPanelRef = useRef<HTMLDivElement | null>(null);

  const handleTogglePanel = (panel: PanelType) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!widgetRef.current || !target) return;
      if (widgetRef.current.contains(target)) return;
      setActivePanel(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activePanel !== null) {
        setActivePanel(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePanel]);

  useEffect(() => {
    if (!activePanel) return;
    const panel = activePanel === "call" ? callPanelRef.current : zaloPanelRef.current;
    const firstLink = panel?.querySelector<HTMLAnchorElement>("a, button");
    firstLink?.focus();
  }, [activePanel]);

  return (
    <div className="floating-contact-widget" ref={widgetRef} aria-live="polite">
      <div className="floating-contact-widget__inner">
        <button
          type="button"
          className={`floating-contact-widget__button floating-contact-widget__button--phone${activePanel === "call" ? " is-active" : ""}`}
          aria-expanded={activePanel === "call"}
          aria-controls="floating-contact-widget-call-panel"
          aria-label="Mở danh sách hotline"
          onClick={() => handleTogglePanel("call")}
        >
          <img src="/images/phone.png" alt="" width="24" height="24" aria-hidden="true" />
          <span className="sr-only">Gọi ngay</span>
        </button>

        <button
          type="button"
          className={`floating-contact-widget__button floating-contact-widget__button--zalo${activePanel === "zalo" ? " is-active" : ""}`}
          aria-expanded={activePanel === "zalo"}
          aria-controls="floating-contact-widget-zalo-panel"
          aria-label="Mở danh sách nhân viên Zalo"
          onClick={() => handleTogglePanel("zalo")}
        >
          <img src="/images/zalo.png" alt="" width="24" height="24" aria-hidden="true" />
          <span className="sr-only">Zalo tư vấn</span>
        </button>
      </div>

      <div
        id="floating-contact-widget-call-panel"
        ref={callPanelRef}
        className={`floating-contact-widget__panel${activePanel === "call" ? " is-open" : ""}`}
        role="dialog"
        aria-label="Danh sách hotline"
        aria-hidden={activePanel !== "call"}
      >
        <div className="floating-contact-widget__panel-header">
          <strong>Hotline tư vấn</strong>
          <span>Chọn số để gọi</span>
        </div>
        <div className="floating-contact-widget__panel-list">
          {salesContacts.map((contact) => (
            <a
              key={contact.phone}
              className="floating-contact-widget__item"
              href={`tel:${contact.phone.replace(/\s+/g, "")}`}
              aria-label={`Gọi ${contact.name} ${contact.phone}`}
            >
              <span className="floating-contact-widget__avatar-wrap">
                <img
                  src={contact.avatar || "/images/avatar/no-avt.png"}
                  alt={`${contact.name} avatar`}
                  className="floating-contact-widget__avatar"
                />
              </span>
              <span className="floating-contact-widget__item-title">{contact.name}</span>
              <span className="floating-contact-widget__item-meta floating-contact-widget__item-meta--icon" aria-hidden="true">
                <img src="/images/phone.png" alt="" width="20" height="20" />
              </span>
            </a>
          ))}
        </div>
      </div>

      <div
        id="floating-contact-widget-zalo-panel"
        ref={zaloPanelRef}
        className={`floating-contact-widget__panel${activePanel === "zalo" ? " is-open" : ""}`}
        role="dialog"
        aria-label="Danh sách nhân viên Zalo"
        aria-hidden={activePanel !== "zalo"}
      >
        <div className="floating-contact-widget__panel-header">
          <strong>Chọn nhân viên tư vấn</strong>
          <span>Chat ngay trên Zalo</span>
        </div>
        <div className="floating-contact-widget__panel-list">
          {salesContacts.map((contact) => {
            const zaloLink = contact.zalo?.startsWith("http")
              ? contact.zalo
              : `https://zalo.me/${contact.zalo.replace(/\s+/g, "")}`;

            return (
              <a
                key={contact.phone}
                className="floating-contact-widget__item"
                href={zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Mở Zalo chat với ${contact.name}`}
              >
                <span className="floating-contact-widget__avatar-wrap">
                  <img
                    src={contact.avatar || "/images/avatar/no-avt.png"}
                    alt={`${contact.name} avatar`}
                    className="floating-contact-widget__avatar"
                  />
                </span>
                <span className="floating-contact-widget__item-title">{contact.name}</span>
                <span className="floating-contact-widget__item-meta floating-contact-widget__item-meta--icon" aria-hidden="true">
                  <img src="/images/zalo.png" alt="" width="20" height="20" />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
