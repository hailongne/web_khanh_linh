import React from "react";
import { YoutubeBlockData } from "./types";
import { getYouTubeVideoId } from "../../lib/youtubeUtils";

type Props = {
  block: YoutubeBlockData;
};

export default function YoutubeBlock({ block }: Props) {
  const url = block.url || block.src || "";
  if (!url) return null;

  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return (
      <div className="blog-block-youtube" style={{ padding: "20px", background: "#fef2f2", border: "1px dashed #fca5a5", borderRadius: "12px", color: "#991b1b", fontSize: "0.88rem" }}>
        ⚠️ Đường dẫn Video Youtube không hợp lệ: <code>{url}</code>
      </div>
    );
  }

  return (
    <div className="blog-block-youtube">
      <div className="blog-block-youtube__wrapper">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Youtube Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="blog-block-youtube__iframe"
        />
      </div>
    </div>
  );
}
