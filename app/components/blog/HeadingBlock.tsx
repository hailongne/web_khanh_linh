import React from "react";
import { HeadingBlockData } from "./types";

type Props = {
  block: HeadingBlockData;
};

function slugifyHeading(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/[àáảãạâầấẩẫậăằắẳẵặ]/g, "a")
    .replace(/[èéẻẽẹêềếểễệ]/g, "e")
    .replace(/[ìíỉĩị]/g, "i")
    .replace(/[òóỏõọôồốổỗộơờớởỡợ]/g, "o")
    .replace(/[ùúủũụưừứửữự]/g, "u")
    .replace(/[ỳýỷỹỵ]/g, "y")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function HeadingBlock({ block }: Props) {
  const text = block.text || block.content || "";
  if (!text) return null;

  const level = block.level || 2;
  const headingId = block.id || slugifyHeading(text);

  switch (level) {
    case 1:
      // Map level 1 block to h2 so the article page title remains the sole <h1> tag
      return <h2 id={headingId} className="blog-block-heading blog-block-heading--h1">{text}</h2>;
    case 2:
      return <h2 id={headingId} className="blog-block-heading blog-block-heading--h2">{text}</h2>;
    case 3:
      return <h3 id={headingId} className="blog-block-heading blog-block-heading--h3">{text}</h3>;
    case 4:
      return <h4 id={headingId} className="blog-block-heading blog-block-heading--h4">{text}</h4>;
    default:
      return <h2 id={headingId} className="blog-block-heading blog-block-heading--h2">{text}</h2>;
  }
}
