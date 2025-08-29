"use client";

import * as React from "react";
import ClickableRow from "@/components/common/ClickableRow";

export interface TeamRowContainerProps {
  /** When present, the whole row is clickable using your ClickableRow */
  href?: string;
  /** Right-most cell actions (Edit/Delete, etc.) */
  actions?: React.ReactNode;
  /** Main line (team name or its skeleton) */
  primary: React.ReactNode;
  /** Secondary line under the primary (manager email or its skeleton) */
  secondary?: React.ReactNode;
  /** Middle column content (e.g., group badge or count) */
  meta?: React.ReactNode;
  /** If true, apply skeleton-friendly aria/semantics */
  skeleton?: boolean;
}

/** Sizing lives here so TeamRow and TeamRowSkeleton stay identical */
export const ROW_HEIGHT = 56;
export const AVATAR_SIZE = 32;

const cellStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e5e5",
  padding: "6px",
  verticalAlign: "middle",
};

function BaseRow({
  href,
  children,
}: React.PropsWithChildren<{ href?: string }>) {
  if (href) return <ClickableRow href={href}>{children}</ClickableRow>;
  return <tr>{children}</tr>;
}

export default function TeamRowContainer({
  href,
  actions,
  primary,
  secondary,
  meta,
  skeleton,
}: TeamRowContainerProps) {
  return (
    <BaseRow href={href}>
      {/* Primary cell: avatar + stacked text */}
      <td
        style={{
          ...cellStyle,
          height: ROW_HEIGHT,
          /* keep layout stable even if content wraps */
          whiteSpace: "nowrap",
        }}
        aria-busy={skeleton || undefined}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar placeholder lives here so size is consistent for both real & skeleton */}
          <div
            aria-hidden
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: "50%",
              background: "#f1f1f1",
              border: "1px solid #e5e5e5",
              display: "grid",
              placeItems: "center",
              fontSize: 12,
              fontWeight: 600,
              flex: "0 0 auto",
            }}
            title="Team logo"
          >
            {/* Children decide whether to show initials or keep empty for skeleton */}
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", minWidth: 160 }}
          >
            <div style={{ lineHeight: 1.2 }}>{primary}</div>
            {secondary ? (
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                {secondary}
              </div>
            ) : null}
          </div>
        </div>
      </td>

      {/* Meta cell (group, badges, counts, etc.) */}
      <td style={{ ...cellStyle, minWidth: 120 }}>{meta}</td>

      {/* Actions (aligned right, no row link) */}
      <td
        data-no-row-link
        style={{
          ...cellStyle,
          textAlign: "right",
          whiteSpace: "nowrap",
          width: 1,
        }}
      >
        <div style={{ display: "inline-flex", gap: 8 }}>{actions}</div>
      </td>
    </BaseRow>
  );
}
