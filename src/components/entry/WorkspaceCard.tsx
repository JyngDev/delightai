"use client";

import Link from "next/link";
import { getEnvInstance, Workspace } from "@/lib/mock-data";
import EnvBadge from "./EnvBadge";

const CARD_SHADOW = "rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px, #fafafa 0px 0px 0px 1px";
const CARD_SHADOW_HOVER = "rgba(0,0,0,0.12) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 4px 8px, #fafafa 0px 0px 0px 1px";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "방금 전";
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

interface WorkspaceCardProps {
  workspace: Workspace;
  orgSlug: string;
}

export default function WorkspaceCard({ workspace, orgSlug }: WorkspaceCardProps) {
  const visibleAgents = workspace.agents.slice(0, 5);
  const overflow = workspace.agents.length - 5;

  return (
    <Link
      href={`/org/${orgSlug}/ws/${workspace.slug}`}
      className="block rounded-lg bg-white group transition-all duration-150"
      style={{ boxShadow: CARD_SHADOW }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = CARD_SHADOW_HOVER;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = CARD_SHADOW;
      }}
    >
      {/* Card header */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg text-lg flex-shrink-0"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
          >
            {workspace.iconEmoji}
          </div>
          <div className="min-w-0">
            <h3
              className="text-[15px] font-semibold text-[#171717] leading-5 truncate"
              style={{ letterSpacing: "-0.2px" }}
            >
              {workspace.name}
            </h3>
            <p className="text-[12px] text-[#666666] mt-0.5">
              {workspace.agents.length} Agents · {workspace.memberCount} Members
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #f4f4f5" }} />

      {/* Agent list */}
      <div className="p-3">
        {workspace.agents.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-[13px] text-[#a1a1aa] mb-2">아직 Agent가 없어요</p>
            <button
              className="text-[12px] font-medium text-[#0068d6] hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              + New Agent
            </button>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {visibleAgents.map((agent) => (
              <li key={agent.id}>
                <button
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left hover:bg-[#fafafa] transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/org/${orgSlug}/ws/${workspace.slug}/agent/${agent.slug}`;
                  }}
                >
                  <span className="flex-1 text-[13px] font-medium text-[#171717] truncate">
                    {agent.name}
                  </span>
                  <span className="text-[11px] text-[#a1a1aa] flex-shrink-0">
                    {timeAgo(agent.lastEditedAt)}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {(["development", "staging", "production"] as const).map((env) => {
                      const inst = getEnvInstance(agent, env);
                      return (
                        <EnvBadge
                          key={env}
                          env={env}
                          active={inst !== null}
                          version={inst?.version ?? ""}
                        />
                      );
                    })}
                  </div>
                </button>
              </li>
            ))}
            {overflow > 0 && (
              <li className="px-2 py-1.5">
                <span className="text-[12px] text-[#a1a1aa]">+ {overflow}개 더</span>
              </li>
            )}
          </ul>
        )}
      </div>
    </Link>
  );
}
