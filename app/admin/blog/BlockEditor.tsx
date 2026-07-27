"use client";

import React, { useState } from "react";
import { BlogBlock, BlockType, ImageAlign, ImageWidth } from "../../components/blog/types";

type BlockEditorProps = {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
  username?: string;
  password?: string;
};

export default function BlockEditor({ blocks = [], onChange, username, password }: BlockEditorProps) {
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function createNewBlock(type: BlockType): BlogBlock {
    const id = `b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    switch (type) {
      case "paragraph":
        return { id, type: "paragraph", text: "" };
      case "heading":
        return { id, type: "heading", level: 2, text: "" };
      case "image":
        return { id, type: "image", src: "", alt: "", caption: "", align: "center", width: "100%" };
      case "gallery":
        return { id, type: "gallery", images: [], columns: 3 };
      case "quote":
        return { id, type: "quote", text: "", author: "" };
      case "divider":
        return { id, type: "divider" };
      case "youtube":
        return { id, type: "youtube", url: "" };
    }
  }

  function insertBlockAt(type: BlockType, index: number) {
    const newB = createNewBlock(type);
    const updated = [...blocks];
    updated.splice(index, 0, newB);
    onChange(updated);
    setInsertIndex(null);
  }

  function removeBlock(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
  }

  function duplicateBlock(index: number) {
    const target = blocks[index];
    const newB: BlogBlock = JSON.parse(JSON.stringify(target));
    newB.id = `b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const updated = [...blocks];
    updated.splice(index + 1, 0, newB);
    onChange(updated);
  }

  function moveBlock(index: number, direction: "up" | "down") {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
  }

  function updateBlockData(id: string, updatedFields: Partial<BlogBlock>) {
    onChange(
      blocks.map((b) => {
        if (b.id === id) {
          return { ...b, ...updatedFields } as BlogBlock;
        }
        return b;
      })
    );
  }

  // HTML5 Drag & Drop handlers
  function handleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.setData("text/plain", index.toString());
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  }

  function handleDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...blocks];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    onChange(updated);
    setDraggedIndex(null);
  }

  async function handleFileUpload(blockId: string, file: File, callback: (url: string) => void) {
    setUploadingBlockId(blockId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const headers: Record<string, string> = {};
      if (username) headers["x-admin-username"] = username;
      if (password) headers["x-admin-password"] = password;

      const res = await fetch("/api/admin/blog/upload", {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        callback(data.url);
      } else {
        alert(data.error || "Tải ảnh thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi tải ảnh");
    } finally {
      setUploadingBlockId(null);
    }
  }

  return (
    <div className="notion-editor-root">
      <div className="notion-document-stream">
        {/* Top Insertion Line */}
        <InterBlockAdder
          index={0}
          activeIdx={insertIndex}
          onOpen={(idx) => setInsertIndex(idx)}
          onClose={() => setInsertIndex(null)}
          onSelect={(type, idx) => insertBlockAt(type, idx)}
        />

        {blocks.length === 0 ? (
          <div className="notion-empty-doc">
            <p>Bài viết chưa có nội dung nào.</p>
            <p className="sub">Bấm nút <strong style={{ color: "#198ac6" }}>＋ Thêm Block</strong> ở trên để bắt đầu viết bài!</p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              {/* Block Item */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`notion-block-row ${
                  draggedIndex === index ? "notion-block-row--dragging" : ""
                } ${dragOverIndex === index ? "notion-block-row--dragover" : ""}`}
              >
                {/* Hover Control Header */}
                <div className="notion-block-header">
                  <div className="notion-drag-handle" title="Kéo thả di chuyển Block">
                    ⋮⋮
                  </div>

                  <div className="notion-block-badge">
                    <span className="notion-block-icon">
                      {block.type === "paragraph" && "📝"}
                      {block.type === "heading" && "🔤"}
                      {block.type === "image" && "🖼️"}
                      {block.type === "gallery" && "🌄"}
                      {block.type === "quote" && "💬"}
                      {block.type === "divider" && "──"}
                      {block.type === "youtube" && "▶️"}
                    </span>
                    <span className="notion-block-type-name">
                      {block.type === "paragraph" && "Đoạn văn"}
                      {block.type === "heading" && `Tiêu đề (H${(block as any).level || 2})`}
                      {block.type === "image" && "Hình ảnh"}
                      {block.type === "gallery" && "Bộ sưu tập"}
                      {block.type === "quote" && "Trích dẫn"}
                      {block.type === "divider" && "Đường kẻ"}
                      {block.type === "youtube" && "Youtube Video"}
                    </span>
                  </div>

                  <div className="notion-block-tools">
                    <button
                      type="button"
                      className="notion-tool-btn"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, "up")}
                      title="Lên trên"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="notion-tool-btn"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, "down")}
                      title="Xuống dưới"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      className="notion-tool-btn"
                      onClick={() => duplicateBlock(index)}
                      title="Nhân bản Block"
                    >
                      📋
                    </button>
                    <button
                      type="button"
                      className="notion-tool-btn notion-tool-btn--danger"
                      onClick={() => removeBlock(block.id)}
                      title="Xóa Block"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Block Inputs */}
                <div className="notion-block-content">
                  {/* 1. PARAGRAPH */}
                  {block.type === "paragraph" && (
                    <textarea
                      className="notion-input notion-textarea"
                      rows={3}
                      value={block.text}
                      onChange={(e) => updateBlockData(block.id, { text: e.target.value })}
                      placeholder="Nhập nội dung đoạn văn..."
                    />
                  )}

                  {/* 2. HEADING */}
                  {block.type === "heading" && (
                    <div className="notion-row">
                      <select
                        className="notion-select"
                        style={{ width: 100 }}
                        value={block.level}
                        onChange={(e) =>
                          updateBlockData(block.id, {
                            level: parseInt(e.target.value, 10) as 1 | 2 | 3 | 4,
                          })
                        }
                      >
                        <option value={1}>H1</option>
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                        <option value={4}>H4</option>
                      </select>

                      <input
                        type="text"
                        className="notion-input notion-input-heading"
                        style={{ flex: 1, fontWeight: 700 }}
                        value={block.text}
                        onChange={(e) => updateBlockData(block.id, { text: e.target.value })}
                        placeholder={`Nhập tiêu đề H${(block as any).level || 2}...`}
                      />
                    </div>
                  )}

                  {/* 3. IMAGE */}
                  {block.type === "image" && (
                    <div className="notion-image-box">
                      <div className="notion-row">
                        <input
                          type="text"
                          className="notion-input"
                          style={{ flex: 1 }}
                          value={block.src}
                          onChange={(e) => updateBlockData(block.id, { src: e.target.value })}
                          placeholder="Nhập URL ảnh hoặc bấm chọn Tải ảnh lên..."
                        />
                        <label className="notion-btn-upload">
                          {uploadingBlockId === block.id ? "Đang tải..." : "📁 Tải ảnh lên"}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(block.id, file, (url) => {
                                  updateBlockData(block.id, { src: url });
                                });
                              }
                            }}
                          />
                        </label>
                      </div>

                      {block.src && (
                        <div
                          className={`notion-img-preview-wrap notion-img-preview--${block.align || "center"}`}
                          style={{ width: block.width || "100%" }}
                        >
                          <img src={block.src} alt="preview" className="notion-img-preview" />
                        </div>
                      )}

                      {/* Image Options: Width & Align */}
                      <div className="notion-img-options">
                        <div className="notion-option-group">
                          <span className="notion-option-label">Kích thước (Width):</span>
                          {(["40%", "60%", "100%"] as ImageWidth[]).map((w) => (
                            <label key={w} className="notion-radio-label">
                              <input
                                type="radio"
                                name={`width_${block.id}`}
                                checked={(block.width || "100%") === w}
                                onChange={() => updateBlockData(block.id, { width: w })}
                              />
                              <span>{w}</span>
                            </label>
                          ))}
                        </div>

                        <div className="notion-option-group">
                          <span className="notion-option-label">Căn lề (Align):</span>
                          {(["left", "center", "right", "full"] as ImageAlign[]).map((a) => (
                            <label key={a} className="notion-radio-label">
                              <input
                                type="radio"
                                name={`align_${block.id}`}
                                checked={(block.align || "center") === a}
                                onChange={() => updateBlockData(block.id, { align: a })}
                              />
                              <span>
                                {a === "left" && "Trái"}
                                {a === "center" && "Giữa"}
                                {a === "right" && "Phải"}
                                {a === "full" && "Tràn viền"}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="notion-row" style={{ marginTop: 8 }}>
                        <input
                          type="text"
                          className="notion-input"
                          style={{ flex: 1 }}
                          value={block.caption}
                          onChange={(e) => updateBlockData(block.id, { caption: e.target.value })}
                          placeholder="Chú thích ảnh (Caption)..."
                        />
                        <input
                          type="text"
                          className="notion-input"
                          style={{ width: 160 }}
                          value={block.alt}
                          onChange={(e) => updateBlockData(block.id, { alt: e.target.value })}
                          placeholder="Alt (SEO)..."
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. GALLERY */}
                  {block.type === "gallery" && (
                    <div className="notion-gallery-box">
                      <div className="notion-row" style={{ marginBottom: 10 }}>
                        <span className="notion-option-label">Số cột:</span>
                        <select
                          className="notion-select"
                          style={{ width: 90 }}
                          value={block.columns || 3}
                          onChange={(e) =>
                            updateBlockData(block.id, {
                              columns: parseInt(e.target.value, 10) as 1 | 2 | 3 | 4,
                            })
                          }
                        >
                          <option value={1}>1 Cột</option>
                          <option value={2}>2 Cột</option>
                          <option value={3}>3 Cột</option>
                          <option value={4}>4 Cột</option>
                        </select>

                        <label className="notion-btn-upload" style={{ marginLeft: "auto" }}>
                          {uploadingBlockId === block.id ? "Đang tải..." : "➕ Tải thêm ảnh bộ sưu tập"}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: "none" }}
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []);
                              for (const f of files) {
                                await handleFileUpload(block.id, f, (url) => {
                                  const currentImgs = block.images || [];
                                  updateBlockData(block.id, {
                                    images: [...currentImgs, { src: url, caption: "" }],
                                  });
                                });
                              }
                            }}
                          />
                        </label>
                      </div>

                      {block.images && block.images.length > 0 && (
                        <div className="notion-gallery-grid">
                          {block.images.map((img, i) => (
                            <div key={i} className="notion-gallery-item">
                              <img src={img.src} alt="thumb" />
                              <input
                                type="text"
                                className="notion-input notion-input--sm"
                                value={img.caption || ""}
                                onChange={(e) => {
                                  const newImgs = [...block.images];
                                  newImgs[i].caption = e.target.value;
                                  updateBlockData(block.id, { images: newImgs });
                                }}
                                placeholder="Chú thích..."
                              />
                              <button
                                type="button"
                                className="notion-gallery-del"
                                onClick={() => {
                                  const newImgs = block.images.filter((_, idx) => idx !== i);
                                  updateBlockData(block.id, { images: newImgs });
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. QUOTE */}
                  {block.type === "quote" && (
                    <div className="notion-quote-box">
                      <textarea
                        className="notion-input notion-textarea"
                        rows={2}
                        value={block.text}
                        onChange={(e) => updateBlockData(block.id, { text: e.target.value })}
                        placeholder="Nhập nội dung trích dẫn..."
                      />
                      <input
                        type="text"
                        className="notion-input"
                        style={{ marginTop: 6 }}
                        value={block.author}
                        onChange={(e) => updateBlockData(block.id, { author: e.target.value })}
                        placeholder="Tác giả / Nguồn..."
                      />
                    </div>
                  )}

                  {/* 6. DIVIDER */}
                  {block.type === "divider" && (
                    <div className="notion-divider-box">
                      <hr />
                    </div>
                  )}

                  {/* 7. YOUTUBE */}
                  {block.type === "youtube" && (
                    <div className="notion-youtube-box">
                      <input
                        type="text"
                        className="notion-input"
                        value={block.url}
                        onChange={(e) => updateBlockData(block.id, { url: e.target.value })}
                        placeholder="Dán đường dẫn URL Video Youtube..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Inter-Block Insertion Line */}
              <InterBlockAdder
                index={index + 1}
                activeIdx={insertIndex}
                onOpen={(idx) => setInsertIndex(idx)}
                onClose={() => setInsertIndex(null)}
                onSelect={(type, idx) => insertBlockAt(type, idx)}
              />
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}

// Subcomponent: Inter-block Plus Button & Dropdown Menu
type InterBlockAdderProps = {
  index: number;
  activeIdx: number | null;
  onOpen: (idx: number) => void;
  onClose: () => void;
  onSelect: (type: BlockType, idx: number) => void;
};

function InterBlockAdder({ index, activeIdx, onOpen, onClose, onSelect }: InterBlockAdderProps) {
  const isOpen = activeIdx === index;

  return (
    <div className="inter-block-adder">
      <button
        type="button"
        className="inter-block-btn"
        onClick={() => (isOpen ? onClose() : onOpen(index))}
        title="Thêm Block nội dung tại đây"
      >
        ＋ Thêm Block
      </button>

      {isOpen && (
        <div className="inter-block-menu">
          <div className="inter-block-menu__header">
            <span>Chọn loại Block muốn chèn:</span>
            <button type="button" className="inter-block-menu__close" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="inter-block-menu__grid">
            <button type="button" className="inter-block-option" onClick={() => onSelect("paragraph", index)}>
              <span className="opt-icon">📝</span>
              <div className="opt-text">
                <span className="opt-title">Đoạn văn (Paragraph)</span>
                <span className="opt-desc">Văn bản nội dung bài viết</span>
              </div>
            </button>

            <button type="button" className="inter-block-option" onClick={() => onSelect("heading", index)}>
              <span className="opt-icon">🔤</span>
              <div className="opt-text">
                <span className="opt-title">Tiêu đề (Heading)</span>
                <span className="opt-desc">Tiêu đề mục H1, H2, H3, H4</span>
              </div>
            </button>

            <button type="button" className="inter-block-option" onClick={() => onSelect("image", index)}>
              <span className="opt-icon">🖼️</span>
              <div className="opt-text">
                <span className="opt-title">Hình ảnh (Image)</span>
                <span className="opt-desc">Ảnh đơn tùy chỉnh kích thước & căn lề</span>
              </div>
            </button>

            <button type="button" className="inter-block-option" onClick={() => onSelect("gallery", index)}>
              <span className="opt-icon">🌄</span>
              <div className="opt-text">
                <span className="opt-title">Bộ sưu tập (Gallery)</span>
                <span className="opt-desc">Hiển thị nhiều ảnh 2, 3, 4 cột</span>
              </div>
            </button>

            <button type="button" className="inter-block-option" onClick={() => onSelect("quote", index)}>
              <span className="opt-icon">💬</span>
              <div className="opt-text">
                <span className="opt-title">Trích dẫn (Quote)</span>
                <span className="opt-desc">Đoạn phát biểu hoặc nguồn dẫn</span>
              </div>
            </button>

            <button type="button" className="inter-block-option" onClick={() => onSelect("divider", index)}>
              <span className="opt-icon">──</span>
              <div className="opt-text">
                <span className="opt-title">Đường kẻ (Divider)</span>
                <span className="opt-desc">Đường kẻ ngang phân đoạn</span>
              </div>
            </button>

            <button type="button" className="inter-block-option" onClick={() => onSelect("youtube", index)}>
              <span className="opt-icon">▶️</span>
              <div className="opt-text">
                <span className="opt-title">Video Youtube</span>
                <span className="opt-desc">Nhúng video clip Youtube</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
