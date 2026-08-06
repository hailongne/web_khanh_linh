import React from "react";
import { DividerBlockData } from "./types";

type Props = {
  block?: DividerBlockData;
};

export default function DividerBlock({ block: _block }: Props) {
  return <hr className="blog-block-divider" />;
}
