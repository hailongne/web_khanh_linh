"use client";

import React, { useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isRawMode, setIsRawMode] = useState(false);
  const [rawText, setRawText] = useState(value || "");

  useEffect(() => {
    if (editorRef.current && !isRawMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    setRawText(value || "");
  }, [value, isRawMode]);

  function handleEditorInput() {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setRawText(html);
    }
  }

  function executeCommand(command: string, val: string | undefined = undefined) {
    if (isRawMode) return;
    document.execCommand(command, false, val);
    handleEditorInput();
  }

  function handleRawTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setRawText(val);
    onChange(val);
  }

  function toggleMode() {
    if (isRawMode) {
      setIsRawMode(false);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = rawText;
        }
      }, 0);
    } else {
      if (editorRef.current) {
        setRawText(editorRef.current.innerHTML);
      }
      setIsRawMode(true);
    }
  }

  return (
    <div className="rte-container">
      {/* Toolbar */}
      <div className="rte-toolbar">
        {/* Block format */}
        <select
          className="rte-select"
          onChange={(e) => {
            if (e.target.value) {
              executeCommand("formatBlock", e.target.value);
              e.target.value = "";
            }
          }}
          defaultValue=""
          title="Chọn kiểu thẻ"
        >
          <option value="" disabled>Kiểu chữ</option>
          <option value="<h2>">H2 - Tiêu đề lớn</option>
          <option value="<h3>">H3 - Tiêu đề vừa</option>
          <option value="<h4>">H4 - Tiêu đề nhỏ</option>
          <option value="<p>">P - Đoạn văn</option>
        </select>

        {/* Font size */}
        <select
          className="rte-select"
          onChange={(e) => {
            if (e.target.value) {
              executeCommand("fontSize", e.target.value);
              e.target.value = "";
            }
          }}
          defaultValue=""
          title="Chọn cỡ chữ"
        >
          <option value="" disabled>Cỡ chữ</option>
          <option value="2">Nhỏ (12px)</option>
          <option value="3">Vừa (15px)</option>
          <option value="4">Lớn (18px)</option>
          <option value="5">Rất lớn (24px)</option>
          <option value="6">Cực lớn (32px)</option>
        </select>

        <div className="rte-separator" />

        {/* Text Styles */}
        <button type="button" className="rte-btn rte-btn-icon" onClick={() => executeCommand("bold")} title="In đậm (Ctrl+B)">
          <b>B</b>
        </button>
        <button type="button" className="rte-btn rte-btn-icon" onClick={() => executeCommand("italic")} title="In nghiêng (Ctrl+I)">
          <i>I</i>
        </button>
        <button type="button" className="rte-btn rte-btn-icon" onClick={() => executeCommand("underline")} title="Gạch chân (Ctrl+U)">
          <u>U</u>
        </button>
        <button type="button" className="rte-btn rte-btn-icon" onClick={() => executeCommand("strikeThrough")} title="Gạch ngang">
          <s>S</s>
        </button>

        <div className="rte-separator" />

        {/* Color picker */}
        <label className="rte-btn rte-btn-color" title="Đổi màu chữ">
          🎨 Màu chữ
          <input
            type="color"
            onChange={(e) => executeCommand("foreColor", e.target.value)}
            style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
          />
        </label>

        <div className="rte-separator" />

        {/* Alignments */}
        <button type="button" className="rte-btn" onClick={() => executeCommand("justifyLeft")} title="Căn trái">
          ⇇ Trái
        </button>
        <button type="button" className="rte-btn" onClick={() => executeCommand("justifyCenter")} title="Căn giữa">
          ≡ Giữa
        </button>
        <button type="button" className="rte-btn" onClick={() => executeCommand("justifyRight")} title="Căn phải">
          ⇉ Phải
        </button>

        <div className="rte-separator" />

        {/* Lists & Line */}
        <button type="button" className="rte-btn" onClick={() => executeCommand("insertUnorderedList")} title="Danh sách chấm tròn">
          • Chấm
        </button>
        <button type="button" className="rte-btn" onClick={() => executeCommand("insertOrderedList")} title="Danh sách số">
          1. Số
        </button>
        <button type="button" className="rte-btn" onClick={() => executeCommand("insertHorizontalRule")} title="Đường kẻ ngang">
          ── Kẻ
        </button>

        <div className="rte-separator" style={{ marginLeft: "auto" }} />

        {/* Mode Switch */}
        <button
          type="button"
          className={`rte-btn ${isRawMode ? "rte-btn--active" : ""}`}
          onClick={toggleMode}
          title="Chuyển chế độ soạn thảo Trực quan / Mã HTML"
        >
          {isRawMode ? "👁️ Trực quan" : "</> HTML"}
        </button>
      </div>

      {/* Editor Box */}
      {isRawMode ? (
        <textarea
          className="rte-raw-textarea"
          value={rawText}
          onChange={handleRawTextChange}
          placeholder="Nhập hoặc chỉnh sửa trực tiếp mã HTML..."
        />
      ) : (
        <div
          ref={editorRef}
          className="rte-editable-content"
          contentEditable
          onInput={handleEditorInput}
          onBlur={handleEditorInput}
        />
      )}
    </div>
  );
}
