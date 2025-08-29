"use client";

import * as React from "react";
import TeamRowContainer, { AVATAR_SIZE } from "./TeamRowContainer";
import { EditButton } from "@/components/common/EditButton";
import { DeleteButton } from "@/components/players/DeletePlayerButton";

export type TeamOut = {
  _id: string;
  tournamentId: string;
  groupId?: string;
  name: string;
  manager: string; // email
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

interface TeamRowProps {
  team: TeamOut;
  tid: string;
}

export default function TeamRow({ team, tid }: TeamRowProps) {
  const href = `/tournaments/${tid}/teams/${team._id}`;

  return (
    <TeamRowContainer
      href={href}
      primary={
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Absolutely-position initials over the avatar area for perfect alignment */}
          <div
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              position: "absolute",
              marginLeft: -AVATAR_SIZE - 12, // counter the container's avatar box space
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
              fontSize: 12,
              fontWeight: 700,
              color: "#444",
            }}
            aria-hidden
          >
            {initials(team.name)}
          </div>
          <span style={{ fontWeight: 600 }}>{team.name}</span>
        </div>
      }
      secondary={<span>{team.manager}</span>}
      meta={
        team.groupId ? (
          <span
            style={{
              fontSize: 12,
              border: "1px solid #e5e5e5",
              padding: "2px 6px",
              borderRadius: 999,
              background: "#fafafa",
            }}
          >
            Group: {team.groupId}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "#888" }}>Ungrouped</span>
        )
      }
      actions={
        <>
          <DeleteButton id={team._id} tid={tid} />
          <EditButton path={`/tournaments/${tid}/teams/edit/${team._id}`} />
        </>
      }
    />
  );
}
