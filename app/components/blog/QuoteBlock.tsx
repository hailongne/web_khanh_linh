import React from "react";
import { QuoteBlockData } from "./types";

type Props = {
  block: QuoteBlockData;
};

export default function QuoteBlock({ block }: Props) {
  const text = block.text || block.content || "";
  if (!text) return null;

  return (
    <blockquote className="blog-block-quote">
      <p className="blog-block-quote__text">“{text}”</p>
      {block.author && (
        <cite className="blog-block-quote__author">— {block.author}</cite>
      )}
    </blockquote>
  );
}
