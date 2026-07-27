import React from "react";
import { ParagraphBlockData } from "./types";

type Props = {
  block: ParagraphBlockData;
};

export default function ParagraphBlock({ block }: Props) {
  const text = block.text || block.content || "";
  if (!text) return null;

  return (
    <p className="blog-block-paragraph">
      {text}
    </p>
  );
}
