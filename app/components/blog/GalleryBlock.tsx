import React from "react";
import { GalleryBlockData } from "./types";

type Props = {
  block: GalleryBlockData;
};

export default function GalleryBlock({ block }: Props) {
  if (!block.images || !Array.isArray(block.images) || block.images.length === 0) return null;

  const cols = block.columns || Math.min(block.images.length, 3);

  return (
    <div className={`blog-block-gallery blog-block-gallery--cols-${cols}`}>
      {block.images.map((img, idx) => {
        const src = img.url || img.src || "";
        if (!src) return null;

        return (
          <figure key={idx} className="blog-block-gallery__item">
            <img
              src={src}
              alt={img.alt || img.caption || `Gallery image ${idx + 1}`}
              loading="lazy"
              className="blog-block-gallery__img"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {img.caption && (
              <figcaption className="blog-block-gallery__caption">
                {img.caption}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
