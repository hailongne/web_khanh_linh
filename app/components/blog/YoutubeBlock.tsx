import React from "react";
import { YoutubeBlockData } from "./types";

type Props = {
  block: YoutubeBlockData;
};

export default function YoutubeBlock({ block }: Props) {
  const url = block.url || block.src || "";
  if (!url) return null;

  // Extract Youtube Embed Video ID
  let videoId = "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    videoId = match[2];
  }

  if (!videoId) return null;

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
