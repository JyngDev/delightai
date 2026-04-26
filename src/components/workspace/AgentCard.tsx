"use client";

import { Agent, getEnvInstance } from "@/lib/mock-data";

const CARD_SHADOW = "rgba(0,0,0,0.07) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 4px";
const CARD_SHADOW_HOVER = "rgba(0,0,0,0.12) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 6px 12px";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatConversations(n: number) {
  if (n === 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}

function formatVersion(v: string): string {
  const stripped = v.replace(/^v0\./, "").replace(/^v/, "");
  return `Version ${stripped}`;
}

function parseVersion(v: string): number[] {
  return v.replace(/^v/, "").split(".").map(Number);
}

function isNewer(a: string, b: string): boolean {
  if (!a || !b) return false;
  const av = parseVersion(a);
  const bv = parseVersion(b);
  for (let i = 0; i < Math.max(av.length, bv.length); i++) {
    const ai = av[i] ?? 0;
    const bi = bv[i] ?? 0;
    if (ai > bi) return true;
    if (ai < bi) return false;
  }
  return false;
}

type LabelType = "LIVE" | "IN_REVIEW" | "IN_DEVELOPMENT" | "NOT_DEPLOYED";

const LABEL_CONFIG: Record<LabelType, {
  text: string;
  bg: string;
  stripBg: string;
  color: string;
  dot: string;
  tooltip: string;
}> = {
  LIVE: {
    text: "Production",
    bg: "#f0fdf4",
    stripBg: "#f0fdf4",
    color: "#15803d",
    dot: "#16a34a",
    tooltip: "Production 환경에서 실사용자에게 서비스 중",
  },
  IN_REVIEW: {
    text: "Staging",
    bg: "#fff7ed",
    stripBg: "#fff7ed",
    color: "#c2410c",
    dot: "#f97316",
    tooltip: "Staging 환경에서 QA 검증 대기 중",
  },
  IN_DEVELOPMENT: {
    text: "Development",
    bg: "#fefce8",
    stripBg: "#fefce8",
    color: "#a16207",
    dot: "#eab308",
    tooltip: "Development 환경에서 새 버전 작업 중",
  },
  NOT_DEPLOYED: {
    text: "Not Deployed",
    bg: "#f4f4f5",
    stripBg: "#f9f9f9",
    color: "#71717a",
    dot: "#d4d4d8",
    tooltip: "어느 환경에도 배포되지 않음",
  },
};

const AVATAR_COLORS = ["#6366f1", "#0284c7", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2"];

function avatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const PERSON_AVATARS: Record<string, string> = {
  "Deco":            "https://i.pravatar.cc/48?img=3",
  "Pedri González":  "https://i.pravatar.cc/48?img=12",
  "Raphinha":        "https://i.pravatar.cc/48?img=15",
  "Lamine Yamal":    "https://i.pravatar.cc/48?img=8",
};

const HEALTH_DOT: Record<string, string> = {
  healthy: "#16a34a",
  warning: "#d97706",
  error:   "#dc2626",
};

function computeLabels(agent: Agent): LabelType[] {
  const prod    = getEnvInstance(agent, "production");
  const staging = getEnvInstance(agent, "staging");
  const dev     = getEnvInstance(agent, "development");
  const labels: LabelType[] = [];

  if (prod) {
    labels.push("LIVE");
    if (staging && staging.version !== prod.version) labels.push("IN_REVIEW");
    if (dev && dev.version !== prod.version)         labels.push("IN_DEVELOPMENT");
  } else if (staging) {
    labels.push("IN_REVIEW");
    if (dev && dev.version !== staging.version)      labels.push("IN_DEVELOPMENT");
  } else if (dev) {
    labels.push("IN_DEVELOPMENT");
  } else {
    labels.push("NOT_DEPLOYED");
  }

  return labels;
}

interface AgentCardProps {
  agent: Agent;
  orgSlug: string;
  wsSlug: string;
}

export default function AgentCard({ agent, orgSlug, wsSlug }: AgentCardProps) {
  const prod    = getEnvInstance(agent, "production");
  const staging = getEnvInstance(agent, "staging");
  const dev     = getEnvInstance(agent, "development");

  const labels   = computeLabels(agent);
  const isLive   = labels.includes("LIVE");
  const inReview = labels.includes("IN_REVIEW");
  const inDev    = labels.includes("IN_DEVELOPMENT");

  const labelCfg = LABEL_CONFIG[labels[0]];

  const convLabel  = agent.metrics ? formatConversations(agent.metrics.conversationsLast7Days) : null;
  const alertCount = agent.metrics?.alertCount ?? 0;
  const csat       = agent.metrics?.csat;
  const resolution = agent.metrics?.resolutionRate;

  const envNodes = [
    {
      key: "dev",
      label: "DEV",
      instance: dev,
      isHighlighted: inDev && isNewer(dev?.version ?? "", prod?.version ?? staging?.version ?? ""),
    },
    {
      key: "stg",
      label: "STG",
      instance: staging,
      isHighlighted: inReview,
    },
    {
      key: "prod",
      label: "PROD",
      instance: prod,
      isHighlighted: isLive,
    },
  ] as const;

  const ENV_FULL_NAME: Record<string, string> = {
    dev: "Development",
    stg: "Staging",
    prod: "Production",
  };

  return (
    <div
      className="rounded-xl bg-white cursor-pointer transition-all duration-150 flex flex-col overflow-hidden"
      style={{ boxShadow: CARD_SHADOW }}
      onClick={() => { window.location.href = `/org/${orgSlug}/ws/${wsSlug}/agent/${agent.slug}`; }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = CARD_SHADOW_HOVER; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = CARD_SHADOW; }}
    >
      {/* Body */}
      <div className="px-5 py-4 flex-1 flex flex-col">

        {/* Name + menu row */}
        <div className="flex items-start justify-between gap-2">
          <span
            className="text-[16px] font-semibold text-[#171717] leading-snug"
            style={{ letterSpacing: "-0.2px" }}
          >
            {agent.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            {(agent.metrics?.alertSeverity?.critical ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#dc2626]">
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ background: "#dc2626" }} />
                  <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "#dc2626" }} />
                </span>
                {agent.metrics!.alertSeverity!.critical}
              </span>
            )}
            {(agent.metrics?.alertSeverity?.warning ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#dc2626]">
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ background: "#dc2626" }} />
                  <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "#dc2626" }} />
                </span>
                {agent.metrics!.alertSeverity!.warning}
              </span>
            )}
            {(agent.metrics?.alertSeverity?.info ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#a16207]">
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ background: "#eab308" }} />
                  <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "#eab308" }} />
                </span>
                {agent.metrics!.alertSeverity!.info}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {agent.description && (
          <p className="mt-0.5 text-[12px] text-[#888888] leading-relaxed line-clamp-2">
            {agent.description}
          </p>
        )}

        {/* Divider */}
        <div className="mt-4" style={{ height: "1px", background: "#f0f0f0" }} />

        {/* Environment pipeline — 1×3 rows */}
        <div className="mt-4 relative flex flex-col gap-4">
          {/* Continuous connector line from first dot center to last dot center */}
          <div
            className="absolute"
            style={{ left: "2.5px", top: "7px", bottom: "7px", width: "1px", background: "#e4e4e7" }}
          />
          {envNodes.map((node) => {
            const isActive = node.instance !== null;
            const ENV_COLOR: Record<string, { dot: string; text: string }> = {
              dev:  { dot: "#eab308", text: "#a16207" },
              stg:  { dot: "#f97316", text: "#c2410c" },
              prod: { dot: "#16a34a", text: "#15803d" },
            };
            const cfg = ENV_COLOR[node.key];

            const isSuspended = node.instance?.suspended ?? false;
            const dotColor = !isActive ? "#d4d4d8" : isSuspended ? "#a1a1aa" : cfg.dot;
            const textColor = !isActive ? "#d4d4d8" : isSuspended ? "#a1a1aa" : cfg.text;

            return (
              <div key={node.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 relative z-10"
                    style={{ background: dotColor }}
                  />
                  <span
                    className="text-[14px] font-normal leading-none"
                    style={{ color: textColor }}
                  >
                    {ENV_FULL_NAME[node.key]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isSuspended && (
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: "#f4f4f5", color: "#888888" }}>Suspended</span>
                  )}
                  <span
                    className="text-[14px] font-normal leading-none"
                    style={{ color: textColor }}
                  >
                    {node.instance?.version ? formatVersion(node.instance.version) : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer */}
      {(() => {
        const contributors = [...new Set(
          [...agent.instances.map((i) => i.deployedBy), agent.lastEditedBy].filter(Boolean) as string[]
        )];
        const shown = contributors.slice(0, 3);
        const overflow = contributors.length - shown.length;
        return (
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderTop: "1px solid #f0f0f0", background: "#fafafa" }}
          >
            <div className="flex items-center">
              {shown.map((name, i) => {
                const src = PERSON_AVATARS[name];
                return src ? (
                  <img
                    key={name}
                    src={src}
                    alt={name}
                    title={name}
                    className="w-6 h-6 rounded-full shrink-0 object-cover"
                    style={{
                      marginLeft: i > 0 ? "-8px" : "0",
                      zIndex: i + 1,
                      position: "relative",
                      boxShadow: "0 0 0 1px #ffffff",
                    }}
                  />
                ) : (
                  <div
                    key={name}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{
                      background: avatarColor(name),
                      marginLeft: i > 0 ? "-8px" : "0",
                      zIndex: i + 1,
                      position: "relative",
                      boxShadow: "0 0 0 1px #ffffff",
                    }}
                    title={name}
                  >
                    {name[0].toUpperCase()}
                  </div>
                );
              })}
              {overflow > 0 && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                  style={{
                    background: "#c4c4c4",
                    marginLeft: "-8px",
                    position: "relative",
                    zIndex: shown.length + 1,
                    boxShadow: "0 0 0 1px #ffffff",
                  }}
                >
                  +{overflow}
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#a1a1aa]">{timeAgo(agent.lastEditedAt)}</p>
          </div>
        );
      })()}
    </div>
  );
}

export function AddAgentCard({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl flex flex-col items-center justify-center gap-2 w-full text-[#c4c4c4] hover:text-[#888888] hover:bg-[#fafafa] transition-all"
      style={{ border: "1.5px dashed #e4e4e7", height: "234px" }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f4f4f5" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-[12px] font-medium">New Agent</span>
    </button>
  );
}
