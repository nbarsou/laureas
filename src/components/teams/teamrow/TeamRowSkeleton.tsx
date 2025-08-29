"use client";

import * as React from "react";
import TeamRowContainer from "./TeamRowContainer";

/** simple utility for gray bars */
function Bar({ w, h = 12 }: { w: number | string; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        background:
          "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 37%, #f0f0f0 63%)",
        borderRadius: 6,
        animation: "shimmer 1.2s infinite",
        backgroundSize: "400% 100%",
      }}
    />
  );
}

/** Inject a tiny keyframes block once */
const styleTag =
  typeof document !== "undefined" && !document.getElementById("skeleton-kf")
    ? (() => {
        const el = document.createElement("style");
        el.id = "skeleton-kf";
        el.innerHTML = `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }`;
        document.head.appendChild(el);
        return el;
      })()
    : null;

export default function TeamRowSkeleton() {
  return (
    <TeamRowContainer
      skeleton
      /* No href so it’s not clickable while loading */
      primary={<Bar w={140} h={14} />}
      secondary={
        <div style={{ marginTop: 4 }}>
          <Bar w={120} h={10} />
        </div>
      }
      meta={<Bar w={80} h={12} />}
      actions={<Bar w={56} h={28} />}
    />
  );
}
