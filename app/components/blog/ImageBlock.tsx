import React from "react";
import { ImageBlockData } from "./types";

type Props = {
  block: ImageBlockData;
};

export default function ImageBlock({ block }: Props) {
  const imgSrc = block.url || block.src || "";
  if (!imgSrc) return null;

  const align = block.align || "center";
  let widthVal = block.width || "100%";
  if (widthVal === "normal") widthVal = "100%";
  if (widthVal === "full") widthVal = "100%";

  return (
    <figure
      className={`blog-block-image blog-block-image--${align}`}
      style={{
        width: align === "full" ? "100%" : widthVal,
        maxWidth: "100%",
        margin: align === "center" ? "28px auto" : align === "right" ? "28px 0 28px auto" : "28px 0",
      }}
    >
      <img
        src={imgSrc}
        alt={block.alt || block.caption || "Hình ảnh bài viết"}
        loading="lazy"
        className="blog-block-image__img"
        style={{ width: "100%", height: "auto" }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      {block.caption && (
        <figcaption className="blog-block-image__caption">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
