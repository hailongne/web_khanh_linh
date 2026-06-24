"use client";

import React from "react";

type IconProps = { width?: number; height?: number; className?: string };

export function VNFlag({ width = 20, height = 14, className = "" }: IconProps) {
  // Use a 3:2 viewBox (width:height = 3:2) and render a centered 5-point star
  const cx = 96 / 2; // 48
  const cy = 64 / 2; // 32
  const outerR = 23; // radius of star tips (tuned to visually match previous size)
  const innerR = outerR * 0.382;

  const pts: string[] = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = ((-90 + i * 72) * Math.PI) / 180;
    const innerAngle = ((-90 + i * 72 + 36) * Math.PI) / 180;
    const ox = cx + outerR * Math.cos(outerAngle);
    const oy = cy + outerR * Math.sin(outerAngle);
    pts.push(`${ox.toFixed(3)},${oy.toFixed(3)}`);
    const ix = cx + innerR * Math.cos(innerAngle);
    const iy = cy + innerR * Math.sin(innerAngle);
    pts.push(`${ix.toFixed(3)},${iy.toFixed(3)}`);
  }

  const points = pts.join(" ");

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 96 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ borderRadius: 6, overflow: "hidden", display: "block" }}
    >
      <rect width="96" height="64" fill="#da251d" rx="6" />
      <polygon fill="#ffde00" points={points} />
    </svg>
  );
}

export function USFlag({ width = 20, height = 14, className = "" }: IconProps) {
  // Use a 19:10 proportion (width:height = 19:10) for a realistic US flag
  const viewW = 190;
  const viewH = 100;
  const stripes = Array.from({ length: 13 }, (_, i) => i);
  const stripeH = viewH / 13;
  const unionW = Math.round(viewW * 0.4 * 100) / 100; // ~40% of fly (common approximation)
  const unionH = stripeH * 7; // union covers 7 stripes vertically

  function starPoints(cx: number, cy: number, outerR: number) {
    const innerR = outerR * 0.382;
    const pts: string[] = [];
    for (let i = 0; i < 5; i++) {
      const outerAngle = ((-90 + i * 72) * Math.PI) / 180;
      const innerAngle = ((-90 + i * 72 + 36) * Math.PI) / 180;
      const ox = cx + outerR * Math.cos(outerAngle);
      const oy = cy + outerR * Math.sin(outerAngle);
      pts.push(`${ox.toFixed(3)},${oy.toFixed(3)}`);
      const ix = cx + innerR * Math.cos(innerAngle);
      const iy = cy + innerR * Math.sin(innerAngle);
      pts.push(`${ix.toFixed(3)},${iy.toFixed(3)}`);
    }
    return pts.join(" ");
  }

  const uid = React.useId().replace(/[:.]/g, "");
  const clipId = `flag-clip-us-${uid}`;

  const stars: React.ReactNode[] = [];
  const hx = unionW / 6; // base horizontal spacing
  const vy = unionH / 9; // vertical spacing (9 rows)
  const outerR = vy * 0.4;
  for (let row = 0; row < 9; row++) {
    const isSix = row % 2 === 0;
    const count = isSix ? 6 : 5;
    for (let i = 0; i < count; i++) {
      const cx = isSix ? (i + 0.5) * hx : (i + 1) * hx;
      const cy = (row + 0.5) * vy;
      stars.push(<polygon key={`s-${row}-${i}`} points={starPoints(cx, cy, outerR)} fill="#fff" />);
    }
  }

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${viewW} ${viewH}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ borderRadius: 6, overflow: "hidden", display: "block" }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={viewW} height={viewH} rx="6" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {stripes.map((i) => (
          <rect key={i} y={i * stripeH} width={viewW} height={stripeH} fill={i % 2 === 0 ? "#b22234" : "#fff"} />
        ))}

        <rect width={unionW} height={unionH} fill="#3c3b6e" />
        <g transform="translate(0,0)">{stars}</g>
      </g>
    </svg>
  );
}

export default VNFlag;
