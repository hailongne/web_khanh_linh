import React from "react";
import { BlogBlock } from "./types";
import ParagraphBlock from "./ParagraphBlock";
import HeadingBlock from "./HeadingBlock";
import ImageBlock from "./ImageBlock";
import GalleryBlock from "./GalleryBlock";
import QuoteBlock from "./QuoteBlock";
import DividerBlock from "./DividerBlock";
import YoutubeBlock from "./YoutubeBlock";

type Props = {
  blocks: BlogBlock[];
};

export default function BlockRenderer({ blocks }: Props) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return <p style={{ color: "#64748b", fontStyle: "italic" }}>Nội dung bài viết đang được cập nhật...</p>;
  }

  return (
    <div className="blog-blocks-container">
      {blocks.map((block) => {
        if (!block || !block.type) return null;

        switch (block.type) {
          case "paragraph":
            return <ParagraphBlock key={block.id} block={block} />;
          case "heading":
            return <HeadingBlock key={block.id} block={block} />;
          case "image":
            return <ImageBlock key={block.id} block={block} />;
          case "gallery":
            return <GalleryBlock key={block.id} block={block} />;
          case "quote":
            return <QuoteBlock key={block.id} block={block} />;
          case "divider":
            return <DividerBlock key={block.id} block={block} />;
          case "youtube":
            return <YoutubeBlock key={block.id} block={block} />;
          default:
            console.warn(`Unsupported block type: ${(block as any).type}`);
            return null;
        }
      })}
    </div>
  );
}
