import React from "react";
import { DividerBlockData } from "./types";

type Props = {
  block?: DividerBlockData;
};

export default function DividerBlock(_props?: Props) {
  return <hr className="blog-block-divider" />;
}
