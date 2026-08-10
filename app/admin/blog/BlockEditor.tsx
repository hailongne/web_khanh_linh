"use client";

import React, { useState } from "react";
import {
  FileText,
  Heading,
  Image as ImageIcon,
  Images,
  Quote,
  Minus,
  Video,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  GripVertical,
  Plus,
  X,
  Upload,
  FolderOpen,
  Search,
  Check
} from "lucide-react";
import { BlogBlock, BlockType, ImageAlign, ImageWidth, HeadingBlockData, GalleryItem } from "../../components/blog/types";
import { getYouTubeVideoId } from "../../lib/youtubeUtils";

type BlockEditorProps = {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
};

type MediaItem = {
  name: string;
  url: string;
  size: number;
  folder: string;
  createdAt: string;
};

export default function BlockEditor({ blocks = [], onChange }: BlockEditorProps) {
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Media Picker Modal State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaTargetCallback, setMediaTargetCallback] = useState<((url: string) => void) | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isMediaPickerOpen) {
        setIsMediaPickerOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMediaPickerOpen]);

  function openMediaPicker(callback: (url: string) => void) {
    setMediaTargetCallback(() => callback);
    setIsMediaPickerOpen(true);
    fetchMediaList();
  }

  async function fetchMediaList() {
    setLoadingMedia(true);
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      if (json.success) {
        setMediaList(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching media list:", err);
    } finally {
      setLoadingMedia(false);
    }
  }

  function selectMediaItem(url: string) {
    if (mediaTargetCallback) {
      mediaTargetCallback(url);
    }
    setIsMediaPickerOpen(false);
    setMediaTargetCallback(null);
  }

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
      formData.append("category", "blog");

      const res = await fetch("/api/admin/media", {
        method: "POST",
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
    <div className="notion-editor-root" style={{ width: "100%" }}>
      <div className="notion-document-stream" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* Top Insertion Line */}
        <InterBlockAdder
          index={0}
          activeIdx={insertIndex}
          onOpen={(idx) => setInsertIndex(idx)}
          onClose={() => setInsertIndex(null)}
          onSelect={(type, idx) => insertBlockAt(type, idx)}
        />

        {blocks.length === 0 ? (
          <div className="notion-empty-doc" style={{ padding: "40px 24px", background: "#f8fafc", borderRadius: "12px", border: "2px dashed #cbd5e1", textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#334155", margin: 0 }}>Bài viết chưa có khối nội dung nào.</p>
            <p className="sub" style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "6px" }}>Bấm nút <strong style={{ color: "#2563eb" }}>＋ Thêm Block tại đây</strong> ở trên để bắt đầu chèn đoạn văn, tiêu đề hoặc ảnh!</p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <React.Fragment key={block.id}>
              {/* Block Card - Full Width */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`notion-block-row ${draggedIndex === index ? "notion-block-row--dragging" : ""
                  } ${dragOverIndex === index ? "notion-block-row--dragover" : ""}`}
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Block Card Header */}
                <div
                  className="notion-block-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 18px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #f1f5f9"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="notion-drag-handle" title="Kéo thả di chuyển Block" style={{ cursor: "grab", display: "flex", alignItems: "center", color: "#94a3b8" }}>
                      <GripVertical size={16} />
                    </div>

                    <div className="notion-block-badge" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", fontWeight: 700, color: "#1e293b" }}>
                      <span className="notion-block-icon" style={{ display: "flex", alignItems: "center" }}>
                        {block.type === "paragraph" && <FileText size={16} style={{ color: "#2563eb" }} />}
                        {block.type === "heading" && <Heading size={16} style={{ color: "#4f46e5" }} />}
                        {block.type === "image" && <ImageIcon size={16} style={{ color: "#059669" }} />}
                        {block.type === "gallery" && <Images size={16} style={{ color: "#9333ea" }} />}
                        {block.type === "quote" && <Quote size={16} style={{ color: "#d97706" }} />}
                        {block.type === "divider" && <Minus size={16} style={{ color: "#475569" }} />}
                        {block.type === "youtube" && <Video size={16} style={{ color: "#dc2626" }} />}
                      </span>
                      <span className="notion-block-type-name">
                        {block.type === "paragraph" && "Đoạn văn (Paragraph)"}
                        {block.type === "heading" && `Tiêu đề (Heading H${(block as HeadingBlockData).level || 2})`}
                        {block.type === "image" && "Hình ảnh (Image)"}
                        {block.type === "gallery" && "Bộ sưu tập (Gallery)"}
                        {block.type === "quote" && "Trích dẫn (Quote)"}
                        {block.type === "divider" && "Đường kẻ (Divider)"}
                        {block.type === "youtube" && "Video Youtube"}
                      </span>
                    </div>
                  </div>

                  <div className="notion-block-tools" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      type="button"
                      className="cms-thumb-btn cms-thumb-btn--upload"
                      style={{ padding: "0 8px", height: "30px", flex: "none" }}
                      disabled={index === 0}
                      onClick={() => moveBlock(index, "up")}
                      title="Chuyển lên trên"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      className="cms-thumb-btn cms-thumb-btn--upload"
                      style={{ padding: "0 8px", height: "30px", flex: "none" }}
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, "down")}
                      title="Chuyển xuống dưới"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <button
                      type="button"
                      className="cms-thumb-btn cms-thumb-btn--media"
                      style={{ padding: "0 10px", height: "30px", flex: "none" }}
                      onClick={() => duplicateBlock(index)}
                      title="Nhân bản khối này"
                    >
                      <Copy size={13} />
                      <span>Nhân bản</span>
                    </button>
                    <button
                      type="button"
                      className="cms-thumb-btn cms-thumb-btn--delete"
                      style={{ padding: "0 10px", height: "30px", flex: "none" }}
                      onClick={() => removeBlock(block.id)}
                      title="Xóa khối này"
                    >
                      <Trash2 size={13} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>

                {/* Block Card Body */}
                <div className="notion-block-body" style={{ padding: "18px", width: "100%" }}>
                  {/* 1. PARAGRAPH - Full Width Spacious Textarea */}
                  {block.type === "paragraph" && (
                    <div style={{ width: "100%" }}>
                      <textarea
                        className="admin-form input"
                        rows={6}
                        style={{
                          width: "100%",
                          minHeight: "180px",
                          resize: "vertical",
                          borderRadius: "8px",
                          padding: "12px 16px",
                          font: "inherit",
                          fontSize: "0.95rem",
                          lineHeight: "1.6",
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          boxSizing: "border-box"
                        }}
                        value={block.text}
                        onChange={(e) => updateBlockData(block.id, { text: e.target.value })}
                        placeholder="Nhập nội dung đoạn văn... (Hỗ trợ xuống dòng tự nhiên)"
                      />
                    </div>
                  )}

                  {/* 2. HEADING - Full Width */}
                  {block.type === "heading" && (
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%" }}>
                      <select
                        style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", font: "inherit", fontSize: "0.9rem", fontWeight: 700, background: "#fff" }}
                        value={block.level}
                        onChange={(e) =>
                          updateBlockData(block.id, {
                            level: parseInt(e.target.value, 10) as 1 | 2 | 3 | 4,
                          })
                        }
                      >
                        <option value={1}>H1 (Tiêu đề lớn)</option>
                        <option value={2}>H2 (Tiêu đề chính)</option>
                        <option value={3}>H3 (Tiêu đề phụ)</option>
                        <option value={4}>H4 (Tiêu đề nhỏ)</option>
                      </select>

                      <input
                        type="text"
                        style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", font: "inherit", fontSize: "1.1rem", fontWeight: 700 }}
                        value={block.text}
                        onChange={(e) => updateBlockData(block.id, { text: e.target.value })}
                        placeholder={`Nhập tiêu đề H${(block as HeadingBlockData).level || 2}...`}
                      />
                    </div>
                  )}

                  {/* 3. IMAGE - Spacious Preview */}
                  {block.type === "image" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}>
                      {/* Image Large Preview Box */}
                      {block.src ? (
                        <div style={{ position: "relative", width: "100%", maxHeight: "380px", borderRadius: "10px", overflow: "hidden", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <img src={block.src} alt="preview" style={{ width: "100%", maxHeight: "380px", objectFit: "contain" }} />
                        </div>
                      ) : (
                        <div style={{ padding: "36px", border: "2px dashed #cbd5e1", borderRadius: "10px", background: "#f8fafc", textAlign: "center", color: "#64748b" }}>
                          <ImageIcon size={32} style={{ margin: "0 auto 8px auto", color: "#94a3b8" }} />
                          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>Chưa có hình ảnh. Chọn từ Media hoặc tải ảnh lên.</p>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                        <button
                          type="button"
                          className="cms-thumb-btn cms-thumb-btn--media"
                          onClick={() => openMediaPicker((url) => updateBlockData(block.id, { src: url }))}
                        >
                          <FolderOpen size={14} />
                          <span>Chọn từ Media</span>
                        </button>
                        <label className="cms-thumb-btn cms-thumb-btn--upload">
                          <Upload size={14} />
                          <span>{uploadingBlockId === block.id ? "Đang tải..." : "Tải ảnh lên"}</span>
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
                        {block.src && (
                          <button
                            type="button"
                            className="cms-thumb-btn cms-thumb-btn--delete"
                            onClick={() => updateBlockData(block.id, { src: "" })}
                          >
                            <Trash2 size={14} />
                            <span>Xóa ảnh</span>
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", font: "inherit", fontSize: "0.85rem" }}
                        value={block.src}
                        onChange={(e) => updateBlockData(block.id, { src: e.target.value })}
                        placeholder="Đường dẫn ảnh (URL)..."
                      />

                      {/* Width & Alignment Options */}
                      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "0.85rem", background: "#f8fafc", padding: "12px 16px", borderRadius: "8px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, color: "var(--ink)" }}>Kích thước (Width):</span>
                          {(["40%", "60%", "100%"] as ImageWidth[]).map((w) => (
                            <label key={w} style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
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

                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, color: "var(--ink)" }}>Căn lề (Align):</span>
                          {(["left", "center", "right", "full"] as ImageAlign[]).map((a) => (
                            <label key={a} style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
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

                      <input
                        type="text"
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", font: "inherit", fontSize: "0.85rem" }}
                        value={block.caption || ""}
                        onChange={(e) => updateBlockData(block.id, { caption: e.target.value })}
                        placeholder="Chú thích ảnh (Caption)..."
                      />
                    </div>
                  )}

                  {/* 4. GALLERY - Support 1, 2, 3, 4 columns & empty state */}
                  {block.type === "gallery" && (
                    <div style={{ width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.88rem" }}>
                          <span style={{ fontWeight: 600 }}>Số cột hiển thị:</span>
                          {[1, 2, 3, 4].map((col) => (
                            <button
                              key={col}
                              type="button"
                              className={`admin-button ${block.columns === col ? "" : "admin-button--ghost"}`}
                              style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                              onClick={() => updateBlockData(block.id, { columns: col as 1 | 2 | 3 | 4 })}
                            >
                              {col} Cột
                            </button>
                          ))}
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="cms-thumb-btn cms-thumb-btn--media"
                            onClick={() =>
                              openMediaPicker((url) => {
                                const currentImgs = (block.images || []).filter((img: GalleryItem) => Boolean(img.src || img.url));
                                updateBlockData(block.id, {
                                  images: [...currentImgs, { src: url, alt: "", caption: "" }]
                                });
                              })
                            }
                          >
                            <FolderOpen size={14} />
                            <span>Chọn từ Media</span>
                          </button>
                          <label className="cms-thumb-btn cms-thumb-btn--upload">
                            <Plus size={14} />
                            <span>Thêm ảnh mới</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: "none" }}
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;
                                const currentImgs = (block.images || []).filter((img: GalleryItem) => Boolean(img.src || img.url));
                                const newUploaded: { src: string; alt: string; caption: string }[] = [];

                                for (let i = 0; i < files.length; i++) {
                                  const formData = new FormData();
                                  formData.append("file", files[i]);
                                  formData.append("category", "blog");
                                  try {
                                    const res = await fetch("/api/admin/media", {
                                      method: "POST",
                                      body: formData
                                    });
                                    const json = await res.json();
                                    if (json.url) {
                                      newUploaded.push({ src: json.url, alt: "", caption: "" });
                                    }
                                  } catch { }
                                }
                                updateBlockData(block.id, { images: [...currentImgs, ...newUploaded] });
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Gallery Images List or Empty State */}
                      {(!block.images || block.images.filter((img: GalleryItem) => Boolean(img.src || img.url)).length === 0) ? (
                        <div
                          style={{
                            padding: "30px 20px",
                            border: "2px dashed #cbd5e1",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            textAlign: "center",
                            color: "#64748b"
                          }}
                        >
                          <p style={{ margin: "0 0 8px 0", fontWeight: 600, fontSize: "0.92rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                            <Images size={20} style={{ color: "#9333ea" }} />
                            <span>Chưa có ảnh nào trong bộ sưu tập.</span>
                          </p>
                          <p style={{ margin: 0, fontSize: "0.83rem", color: "#94a3b8" }}>
                            Bấm nút <strong style={{ color: "#2563eb" }}>Chọn từ Media</strong> hoặc <strong style={{ color: "#2563eb" }}>Thêm ảnh mới</strong> ở trên để chèn ảnh!
                          </p>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${block.columns || 3}, 1fr)`,
                            gap: "12px",
                            width: "100%"
                          }}
                        >
                          {block.images
                            .filter((img: GalleryItem) => Boolean(img.src || img.url))
                            .map((img: GalleryItem, imgIdx: number) => {
                              const src = img.src || img.url;
                              return (
                                <div
                                  key={imgIdx}
                                  style={{
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    padding: "6px",
                                    backgroundColor: "#fff",
                                    position: "relative"
                                  }}
                                >
                                  <img
                                    src={src}
                                    alt="gallery"
                                    style={{
                                      width: "100%",
                                      height: block.columns === 1 ? "auto" : "140px",
                                      maxHeight: block.columns === 1 ? "380px" : "140px",
                                      objectFit: "cover",
                                      borderRadius: "6px"
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const validImgs = block.images.filter((i: GalleryItem) => Boolean(i.src || i.url));
                                      validImgs.splice(imgIdx, 1);
                                      updateBlockData(block.id, { images: validImgs });
                                    }}
                                    style={{
                                      position: "absolute",
                                      top: "10px",
                                      right: "10px",
                                      background: "rgba(220,38,38,0.9)",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "50%",
                                      width: "24px",
                                      height: "24px",
                                      cursor: "pointer",
                                      fontWeight: 700
                                    }}
                                    title="Xóa ảnh"
                                  >
                                    &times;
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. QUOTE */}
                  {block.type === "quote" && (
                    <div style={{ borderLeft: "4px solid #2563eb", paddingLeft: "14px", width: "100%" }}>
                      <textarea
                        className="admin-form input"
                        rows={3}
                        style={{ width: "100%", borderRadius: "8px", padding: "10px 14px", font: "inherit", fontSize: "0.95rem", fontStyle: "italic" }}
                        value={block.text}
                        onChange={(e) => updateBlockData(block.id, { text: e.target.value })}
                        placeholder="Nhập nội dung trích dẫn..."
                      />
                      <input
                        type="text"
                        style={{ marginTop: "10px", width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", font: "inherit", fontSize: "0.85rem" }}
                        value={block.author || ""}
                        onChange={(e) => updateBlockData(block.id, { author: e.target.value })}
                        placeholder="Tác giả hoặc nguồn trích dẫn..."
                      />
                    </div>
                  )}

                  {/* 6. DIVIDER */}
                  {block.type === "divider" && (
                    <div style={{ padding: "12px 0", width: "100%" }}>
                      <hr style={{ border: "none", borderTop: "2px solid #cbd5e1", margin: 0 }} />
                    </div>
                  )}

                  {/* 7. YOUTUBE */}
                  {block.type === "youtube" && (() => {
                    const videoId = getYouTubeVideoId(block.url || "");
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                        <input
                          type="text"
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", font: "inherit", fontSize: "0.88rem" }}
                          value={block.url || ""}
                          onChange={(e) => updateBlockData(block.id, { url: e.target.value })}
                          placeholder="Dán đường dẫn Youtube (ví dụ: https://www.youtube.com/watch?v=... hoặc Shorts / Embed code)..."
                        />

                        {block.url && videoId ? (
                          <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: "12px", overflow: "hidden", background: "#000", border: "1px solid #e2e8f0" }}>
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title="Youtube Live Preview"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                            />
                          </div>
                        ) : block.url ? (
                          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fef2f2", border: "1px dashed #fca5a5", color: "#991b1b", fontSize: "0.83rem" }}>
                            ⚠️ Không nhận diện được Video ID từ link này. Vui lòng kiểm tra lại link Youtube (ví dụ: https://www.youtube.com/watch?v=...).
                          </div>
                        ) : (
                          <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#f8fafc", border: "1px dashed #cbd5e1", color: "#64748b", fontSize: "0.83rem" }}>
                            💡 Hỗ trợ dán link Youtube chuẩn (watch?v=...), Youtube Shorts, link rút gọn (youtu.be), link Live hoặc mã nhúng &lt;iframe&gt;.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Inter-Block Adder */}
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

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <div className="cms-media-overlay" onClick={() => setIsMediaPickerOpen(false)}>
          <div
            className="cms-media-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="cms-media-modal-header">
              <div className="cms-media-modal-title">
                <ImageIcon size={20} style={{ color: "#2563eb" }} />
                <h3>Thư viện Media</h3>
              </div>
              <button
                type="button"
                className="cms-media-modal-close"
                onClick={() => setIsMediaPickerOpen(false)}
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="cms-media-modal-body">
              {loadingMedia ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                  <i className="fas fa-spinner fa-spin fa-2x" style={{ color: "#2563eb" }} />
                  <p style={{ marginTop: "0.75rem", fontWeight: 600, fontSize: "0.88rem" }}>Đang nạp thư viện media...</p>
                </div>
              ) : mediaList.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                  <FolderOpen size={36} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
                  <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Chưa có ảnh nào trong thư viện Media.</p>
                </div>
              ) : (
                <div className="cms-media-grid">
                  {mediaList.map((media) => (
                    <div
                      key={media.url}
                      className="cms-media-item"
                      onClick={() => selectMediaItem(media.url)}
                      title={`Chọn ảnh: ${media.name}`}
                    >
                      <div className="cms-media-thumb-wrap">
                        <img src={media.url} alt={media.name} loading="lazy" />
                      </div>
                      <div className="cms-media-name">{media.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cms-media-modal-footer">
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                Nhấn vào ảnh để chèn vào khối nội dung.
              </span>
              <button
                type="button"
                className="cms-btn-secondary-sm"
                onClick={() => setIsMediaPickerOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InterBlockAdder({
  index,
  activeIdx,
  onOpen,
  onClose,
  onSelect
}: {
  index: number;
  activeIdx: number | null;
  onOpen: (idx: number) => void;
  onClose: () => void;
  onSelect: (type: BlockType, idx: number) => void;
}) {
  const isOpen = activeIdx === index;

  return (
    <div style={{ position: "relative", margin: "6px 0", textAlign: "center", width: "100%" }}>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => onOpen(index)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#eff6ff",
            color: "#2563eb",
            border: "1px dashed #93c5fd",
            borderRadius: "20px",
            padding: "6px 18px",
            fontSize: "0.83rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <Plus size={14} />
          <span>Thêm Block tại đây</span>
        </button>
      ) : (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "14px",
            padding: "16px 20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            display: "inline-block",
            textAlign: "left",
            zIndex: 5,
            minWidth: "320px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "16px" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>Chọn loại khối muốn chèn:</span>
            <button
              type="button"
              onClick={onClose}
              className="cms-media-modal-close"
              style={{ width: "28px", height: "28px" }}
              title="Đóng"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
            <button
              type="button"
              className="cms-block-type-btn"
              onClick={() => onSelect("paragraph", index)}
            >
              <FileText size={16} style={{ color: "#2563eb" }} />
              <span>Đoạn văn (Paragraph)</span>
            </button>
            <button
              type="button"
              className="cms-block-type-btn"
              onClick={() => onSelect("heading", index)}
            >
              <Heading size={16} style={{ color: "#4f46e5" }} />
              <span>Tiêu đề (Heading)</span>
            </button>
            <button
              type="button"
              className="cms-block-type-btn"
              onClick={() => onSelect("image", index)}
            >
              <ImageIcon size={16} style={{ color: "#059669" }} />
              <span>Hình ảnh (Image)</span>
            </button>
            <button
              type="button"
              className="cms-block-type-btn"
              onClick={() => onSelect("gallery", index)}
            >
              <Images size={16} style={{ color: "#9333ea" }} />
              <span>Bộ sưu tập (Gallery)</span>
            </button>
            <button
              type="button"
              className="cms-block-type-btn"
              onClick={() => onSelect("quote", index)}
            >
              <Quote size={16} style={{ color: "#d97706" }} />
              <span>Trích dẫn (Quote)</span>
            </button>
            <button
              type="button"
              className="cms-block-type-btn"
              onClick={() => onSelect("divider", index)}
            >
              <Minus size={16} style={{ color: "#475569" }} />
              <span>Đường kẻ (Divider)</span>
            </button>
            <button
              type="button"
              className="cms-block-type-btn"
              style={{ gridColumn: "span 2" }}
              onClick={() => onSelect("youtube", index)}
            >
              <Video size={16} style={{ color: "#dc2626" }} />
              <span>Video Youtube</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
