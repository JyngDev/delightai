"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Agent, EnvironmentType, getEnvInstance, Workspace } from "@/lib/mock-data";
import AgentCard, { AddAgentCard } from "./AgentCard";
import NewAgentDialog from "./NewAgentDialog";


function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatVersion(v: string): string {
  const stripped = v.replace(/^v0\./, "").replace(/^v/, "");
  return `Version ${stripped}`;
}

function formatConvShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function Sparkline({ data, color = "#171717" }: { data: number[]; color?: string }) {
  const w = 100, h = 32;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / range) * (h - 4) - 2 }));
  const t = 0.4;
  const smooth = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = pts[i - 1]; const dx = (pt.x - prev.x) * t;
    return `${acc} C ${prev.x + dx},${prev.y} ${pt.x - dx},${pt.y} ${pt.x},${pt.y}`;
  }, "");
  const fillD = `${smooth} L ${w},${h} L 0,${h} Z`;
  const gradId = `sg-ws-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: "32px" }} preserveAspectRatio="none">
      <defs><linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.12" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      <path d={fillD} fill={`url(#${gradId})`} vectorEffect="non-scaling-stroke" />
      <path d={smooth} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const HEALTH_COLOR: Record<string, string> = {
  healthy: "#16a34a",
  warning: "#f59e0b",
  error: "#dc2626",
};

const CARD_SHADOW_K = "rgba(0,0,0,0.07) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 4px";
const CARD_SHADOW_K_HOVER = "rgba(0,0,0,0.12) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 6px 12px";

const PERSON_AVATARS_K: Record<string, string> = {
  "Deco":            "https://i.pravatar.cc/48?img=3",
  "Pedri González":  "https://i.pravatar.cc/48?img=12",
  "Raphinha":        "https://i.pravatar.cc/48?img=15",
  "Lamine Yamal":    "https://i.pravatar.cc/48?img=8",
};
const AVATAR_COLORS_K = ["#6366f1", "#0284c7", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2"];
function avatarColorK(name: string): string {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS_K[Math.abs(hash) % AVATAR_COLORS_K.length];
}

function KanbanCard({
  agent, orgSlug, wsSlug, envType, children,
}: {
  agent: Agent; orgSlug: string; wsSlug: string; envType: string; children: ReactNode;
}) {
  const showAlert = !agent.metrics?.alertEnv || agent.metrics.alertEnv === envType;
  const contributors = [...new Set(
    [...agent.instances.map((i) => i.deployedBy), agent.lastEditedBy].filter(Boolean) as string[]
  )];
  const shown = contributors.slice(0, 3);
  const overflow = contributors.length - shown.length;

  return (
    <div
      className="rounded-xl bg-white cursor-pointer transition-all duration-150 flex flex-col overflow-hidden"
      style={{ boxShadow: CARD_SHADOW_K }}
      onClick={() => { window.location.href = `/org/${orgSlug}/ws/${wsSlug}/agent/${agent.slug}`; }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = CARD_SHADOW_K_HOVER; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = CARD_SHADOW_K; }}
    >
      <div className="px-5 py-4 flex-1 flex flex-col">
        {/* Name + menu */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[16px] font-semibold text-[#171717] leading-snug" style={{ letterSpacing: "-0.2px" }}>
            {agent.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            {showAlert && (agent.metrics?.alertSeverity?.critical ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#dc2626]">
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ background: "#dc2626" }} />
                  <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "#dc2626" }} />
                </span>
                {agent.metrics!.alertSeverity!.critical}
              </span>
            )}
            {showAlert && (agent.metrics?.alertSeverity?.warning ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#dc2626]">
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ background: "#dc2626" }} />
                  <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "#dc2626" }} />
                </span>
                {agent.metrics!.alertSeverity!.warning}
              </span>
            )}
            {showAlert && (agent.metrics?.alertSeverity?.info ?? 0) > 0 && (
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
        {/* Env-specific content */}
        <div className="mt-4 flex-1 flex flex-col">
          {children}
        </div>
      </div>
      {/* Footer */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderTop: "1px solid #f0f0f0", background: "#fafafa" }}
      >
        <div className="flex items-center">
          {shown.map((name, i) => {
            const src = PERSON_AVATARS_K[name];
            return src ? (
              <img
                key={name} src={src} alt={name} title={name}
                className="w-6 h-6 rounded-full shrink-0 object-cover"
                style={{ marginLeft: i > 0 ? "-8px" : "0", zIndex: i + 1, position: "relative", boxShadow: "0 0 0 1px #ffffff" }}
              />
            ) : (
              <div
                key={name}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ background: avatarColorK(name), marginLeft: i > 0 ? "-8px" : "0", zIndex: i + 1, position: "relative", boxShadow: "0 0 0 1px #ffffff" }}
                title={name}
              >
                {name[0].toUpperCase()}
              </div>
            );
          })}
          {overflow > 0 && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ background: "#c4c4c4", marginLeft: "-8px", position: "relative", zIndex: shown.length + 1, boxShadow: "0 0 0 1px #ffffff" }}
            >
              +{overflow}
            </div>
          )}
        </div>
        <p className="text-[11px] text-[#a1a1aa]">{timeAgo(agent.lastEditedAt)}</p>
      </div>
    </div>
  );
}

function DevCard({ agent, orgSlug, wsSlug }: { agent: Agent; orgSlug: string; wsSlug: string }) {
  const env = getEnvInstance(agent, "development");
  return (
    <KanbanCard agent={agent} orgSlug={orgSlug} wsSlug={wsSlug} envType="development">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#eab308" }} />
          <span className="text-[14px] font-normal leading-none" style={{ color: "#a16207" }}>Development</span>
        </div>
        <span className="text-[14px] font-normal leading-none" style={{ color: "#a16207" }}>{env?.version ? formatVersion(env.version) : "—"}</span>
      </div>
    </KanbanCard>
  );
}

function StagingCard({ agent, orgSlug, wsSlug }: { agent: Agent; orgSlug: string; wsSlug: string }) {
  const env = getEnvInstance(agent, "staging");
  return (
    <KanbanCard agent={agent} orgSlug={orgSlug} wsSlug={wsSlug} envType="staging">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#f97316" }} />
          <span className="text-[14px] font-normal leading-none" style={{ color: "#c2410c" }}>Staging</span>
        </div>
        <span className="text-[14px] font-normal leading-none" style={{ color: "#c2410c" }}>{env?.version ? formatVersion(env.version) : "—"}</span>
      </div>
    </KanbanCard>
  );
}

function ProdCard({ agent, orgSlug, wsSlug }: { agent: Agent; orgSlug: string; wsSlug: string }) {
  const env = getEnvInstance(agent, "production");
  const suspended = env?.suspended ?? false;
  return (
    <KanbanCard agent={agent} orgSlug={orgSlug} wsSlug={wsSlug} envType="production">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: suspended ? "#a1a1aa" : "#16a34a" }} />
          <span className="text-[14px] font-normal leading-none" style={{ color: suspended ? "#a1a1aa" : "#15803d" }}>Production</span>
        </div>
        <div className="flex items-center gap-2">
          {suspended && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: "#f4f4f5", color: "#888888" }}>Suspended</span>
          )}
          <span className="text-[14px] font-normal leading-none" style={{ color: suspended ? "#a1a1aa" : "#15803d" }}>{env?.version ? formatVersion(env.version) : "—"}</span>
        </div>
      </div>
    </KanbanCard>
  );
}

interface PipelineViewProps {
  agents: Agent[];
  orgSlug: string;
  wsSlug: string;
}

function PipelineView({ agents, orgSlug, wsSlug }: PipelineViewProps) {
  const devAgents     = agents.filter((a) => getEnvInstance(a, "development") !== null);
  const stagingAgents = agents.filter((a) => getEnvInstance(a, "staging") !== null);
  const prodAgents    = agents.filter((a) => getEnvInstance(a, "production") !== null);

  const columns = [
    {
      key: "dev",
      label: "Development",
      headerBg: "#fefce8",
      headerColor: "#a16207",
      agents: devAgents,
      CardComponent: DevCard,
    },
    {
      key: "stg",
      label: "Staging",
      headerBg: "#fff7ed",
      headerColor: "#c2410c",
      agents: stagingAgents,
      CardComponent: StagingCard,
    },
    {
      key: "prod",
      label: "Production",
      headerBg: "#f0fdf4",
      headerColor: "#15803d",
      agents: prodAgents,
      CardComponent: ProdCard,
    },
  ] as const;

  return (
    <div className="flex gap-3" style={{ alignItems: "flex-start" }}>
      {columns.map((col) => (
        <div key={col.key} className="flex-1 min-w-0 rounded-xl overflow-hidden">
          {/* Column header */}
          <div className="px-3.5 pt-4 pb-1.5 flex items-center gap-2" style={{ background: "#fafafa" }}>
            <span className="text-[13px] font-semibold" style={{ color: col.headerColor }}>
              {col.label} {col.agents.length}
            </span>
          </div>
          {/* Column body */}
          <div className="p-2.5 flex flex-col gap-2" style={{ background: "#fafafa", minHeight: "200px" }}>
            {col.agents.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-10 text-center">
                <p className="text-[12px] text-[#c4c4c4] leading-relaxed">
                  이 환경에는<br />배포된 Agent가<br />없습니다
                </p>
              </div>
            ) : (
              col.agents.map((agent) => (
                <col.CardComponent key={agent.id} agent={agent} orgSlug={orgSlug} wsSlug={wsSlug} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface WorkspaceHomeProps {
  workspace: Workspace;
  orgSlug: string;
  orgName: string;
}

export default function WorkspaceHome({ workspace, orgSlug, orgName }: WorkspaceHomeProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list" | "pipeline">("grid");
  const [sort, setSort] = useState("last-edited");
  const [showNewAgent, setShowNewAgent] = useState(false);
  const filtered = workspace.agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    if (sort === "created") return new Date(a.lastEditedAt).getTime() - new Date(b.lastEditedAt).getTime();
    return new Date(b.lastEditedAt).getTime() - new Date(a.lastEditedAt).getTime();
  });

  const tm = workspace.teamMetrics;
  const hasAgents = workspace.agents.length > 0;

  return (
    <div>
      {/* Breadcrumb row — same height as sidebar logo row (h-12) */}
      <div className="px-8 h-12 flex items-center gap-1.5 text-[12px] shrink-0" style={{ borderBottom: "1px solid #f4f4f5" }}>
        <Link href={`/org/${orgSlug}`} className="text-[#a1a1aa] hover:text-[#555555] transition-colors">
          {orgName}
        </Link>
        <span className="text-[#d4d4d8] select-none">/</span>
        <span className="text-[#171717] font-medium">{workspace.name}</span>
      </div>
      <div className="px-8 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-8 mb-8 -mx-8 px-8 border-b border-[#f4f4f5]">
        <div className="flex items-center gap-4">
          {workspace.coverImage && (
            <img
              src={workspace.coverImage}
              alt=""
              className="w-9 h-9 rounded-lg object-cover shrink-0"
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
            />
          )}
          <h1
            className="text-[28px] font-semibold text-[#171717] leading-tight"
            style={{ letterSpacing: "-0.4px" }}
          >
            {workspace.name}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNewAgent(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white hover:opacity-85 transition-opacity"
            style={{ background: "#171717" }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New Agent
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1.5 11c0-2.2 2-4 5-4s5 1.8 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Invite
          </button>
          <Link
            href={`/org/${orgSlug}/ws/${workspace.slug}/settings/general`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Workspace Settings
          </Link>
        </div>
      </div>

      {/* Block B: Team Dashboard */}
      {hasAgents && tm && (
        <div className="mt-8 mb-8">
          <h2 className="text-[20px] font-medium text-[#171717] mb-4" style={{ letterSpacing: "-0.3px" }}>Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Conversations Today */}
            <div className="group metric-card rounded-xl overflow-hidden flex flex-col cursor-pointer" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
              <div className="relative px-5 pt-4 pb-4">
                <div className="absolute right-4 top-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-[#a1a1aa]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="text-[12px] font-normal text-[#a1a1aa] tracking-wide mb-3">Conversations Today</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-[28px] font-semibold text-[#171717] leading-none" style={{ letterSpacing: "-0.5px" }}>
                    {tm.conversationsToday.value.toLocaleString()}
                  </p>
                  <span className="text-[12px] font-medium" style={{ color: tm.conversationsToday.changePercent >= 0 ? "#15803d" : "#dc2626" }}>
                    {tm.conversationsToday.changePercent >= 0 ? "↑" : "↓"}{Math.abs(tm.conversationsToday.changePercent)}%
                  </span>
                </div>
              </div>
              <Sparkline data={[2800, 3100, 2600, 3400, 2900, 3600, tm.conversationsToday.value]} color="#a3a3a3" />
            </div>

            {/* Avg CSAT */}
            <div className="group metric-card rounded-xl overflow-hidden flex flex-col cursor-pointer" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
              <div className="relative px-5 pt-4 pb-4">
                <div className="absolute right-4 top-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-[#a1a1aa]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="text-[12px] font-normal text-[#a1a1aa] tracking-wide mb-3">Avg CSAT</p>
                <div className="flex items-baseline gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-[28px] font-semibold text-[#171717] leading-none" style={{ letterSpacing: "-0.5px" }}>
                      {tm.avgCsat.value.toFixed(1)}
                    </p>
                    <p className="text-[13px] text-[#a1a1aa]">/ 5</p>
                  </div>
                  <span className="text-[12px] font-medium" style={{ color: tm.avgCsat.change >= 0 ? "#15803d" : "#dc2626" }}>
                    {tm.avgCsat.change >= 0 ? "↑" : "↓"}{Math.abs(tm.avgCsat.change).toFixed(1)}
                  </span>
                </div>
              </div>
              <Sparkline data={[3.6, 3.4, 3.8, 3.5, 3.9, 4.0, tm.avgCsat.value]} color="#93c5fd" />
            </div>

            {/* Alerts */}
            {(() => {
              const totalAlerts = tm.alerts.critical + tm.alerts.warning + tm.alerts.info;
              const alertColor = totalAlerts === 0 ? "#86efac" : "#fca5a5";
              const alertData = totalAlerts === 0
                ? [2, 1, 3, 1, 2, 0, 0]
                : [1, 3, 2, 4, 3, 5, totalAlerts];
              return (
                <div className="group metric-card rounded-xl overflow-hidden flex flex-col cursor-pointer" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
                  <div className="relative px-5 pt-4 pb-4">
                    <div className="absolute right-4 top-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-[#a1a1aa]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p className="text-[12px] font-normal text-[#a1a1aa] tracking-wide mb-3">Alerts</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-[28px] font-semibold leading-none" style={{ letterSpacing: "-0.5px", color: totalAlerts === 0 ? "#15803d" : "#171717" }}>
                        {totalAlerts}
                      </p>
                      {totalAlerts === 0 && (
                        <span className="text-[12px] font-medium text-[#15803d]">All clear</span>
                      )}
                    </div>
                  </div>
                  <Sparkline data={alertData} color={alertColor} />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Agents title */}
      {hasAgents && <div className="mt-10 mb-3">
        <h2 className="text-[20px] font-medium text-[#171717]" style={{ letterSpacing: "-0.3px" }}>Agents</h2>
      </div>}
      {hasAgents && <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] pointer-events-none">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" />
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents..."
              className="pl-8 pr-3 py-1.5 text-[14px] rounded-md outline-none bg-white"
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px", width: "240px" }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none text-[13px] text-[#666666] pl-3 pr-7 py-1.5 rounded-md bg-white outline-none cursor-pointer"
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px", width: "128px" }}
            >
              <option value="last-edited">Last edited</option>
              <option value="name-asc">Name (A→Z)</option>
              <option value="name-desc">Name (Z→A)</option>
              <option value="created">Created</option>
            </select>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a1a1aa] pointer-events-none">
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex rounded-md overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px", height: "34px" }}>
            {([
              { v: "grid", title: "Grid view", icon: (active: boolean) => (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" stroke={active ? "#171717" : "#a1a1aa"} strokeWidth="1.2" />
                  <rect x="8" y="1" width="5" height="5" rx="1" stroke={active ? "#171717" : "#a1a1aa"} strokeWidth="1.2" />
                  <rect x="1" y="8" width="5" height="5" rx="1" stroke={active ? "#171717" : "#a1a1aa"} strokeWidth="1.2" />
                  <rect x="8" y="8" width="5" height="5" rx="1" stroke={active ? "#171717" : "#a1a1aa"} strokeWidth="1.2" />
                </svg>
              )},
              { v: "list", title: "List view", icon: (active: boolean) => (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 3h12M1 7h12M1 11h12" stroke={active ? "#171717" : "#a1a1aa"} strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )},
              { v: "pipeline", title: "Pipeline view", icon: (active: boolean) => (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="3.5" height="12" rx="1" stroke={active ? "#171717" : "#a1a1aa"} strokeWidth="1.2" />
                  <rect x="5.25" y="1" width="3.5" height="12" rx="1" stroke={active ? "#171717" : "#a1a1aa"} strokeWidth="1.2" />
                  <rect x="9.5" y="1" width="3.5" height="12" rx="1" stroke={active ? "#171717" : "#a1a1aa"} strokeWidth="1.2" />
                </svg>
              )},
            ] as const).map(({ v, title, icon }, i) => {
              const active = view === v;
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="group flex items-center justify-center px-2.5 transition-colors"
                  style={{
                    background: active ? "#f4f4f5" : "#ffffff",
                    borderLeft: i > 0 ? "1px solid #f0f0f0" : "none",
                  }}
                  title={title}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "#f9f9f9"; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "#ffffff"; }}
                >
                  {icon(active)}
                </button>
              );
            })}
          </div>
        </div>
      </div>}


      {/* Empty state */}
      {workspace.agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h3 className="text-[18px] font-semibold text-[#171717] mb-2" style={{ letterSpacing: "-0.3px" }}>
            Create your first agent
          </h3>
          <p className="text-[14px] text-[#888888] mb-6" style={{ maxWidth: "360px" }}>
            Automate customer experiences and boost team productivity with AI agents.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewAgent(true)}
              className="px-4 py-2 rounded-md text-[14px] font-medium text-white hover:opacity-85 transition-opacity"
              style={{ background: "#171717" }}
            >
              + New Agent
            </button>
            <button
              className="px-4 py-2 rounded-md text-[14px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors"
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
            >
              Browse templates
            </button>
          </div>
        </div>
      ) : view === "grid" ? (
        /* Grid view */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((agent) => (
            <AgentCard key={agent.id} agent={agent} orgSlug={orgSlug} wsSlug={workspace.slug} />
          ))}
          <AddAgentCard onClick={() => setShowNewAgent(true)} />
        </div>
      ) : view === "list" ? (
        /* List view */
        <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          <table className="w-full text-[14px]">
            <thead>
              <tr style={{ borderBottom: "1px solid #f4f4f5", background: "#fafafa" }}>
                {["Name", "Environments", "Contributors", "Last Edited"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#a1a1aa] tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((agent, i) => {
                const ENV_CONFIG: Record<EnvironmentType, { label: string; dot: string; text: string }> = {
                  development: { label: "Development", dot: "#eab308", text: "#a16207" },
                  staging:     { label: "Staging",     dot: "#f97316", text: "#c2410c" },
                  production:  { label: "Production",  dot: "#16a34a", text: "#15803d" },
                };
                const contributors = [...new Set(
                  [...agent.instances.map((inst) => inst.deployedBy), agent.lastEditedBy].filter(Boolean) as string[]
                )];
                const shown = contributors.slice(0, 3);
                const overflow = contributors.length - shown.length;

                return (
                  <tr
                    key={agent.id}
                    className="hover:bg-[#fafafa] transition-colors cursor-pointer"
                    style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}
                    onClick={() => { window.location.href = `/org/${orgSlug}/ws/${workspace.slug}/agent/${agent.slug}`; }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-[16px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.2px" }}>{agent.name}</p>
                      {agent.description && (
                        <p className="text-[12px] text-[#888888] truncate max-w-xs mt-0.5">{agent.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {(["development", "staging", "production"] as const).map((env) => {
                          const inst = getEnvInstance(agent, env);
                          const cfg = ENV_CONFIG[env];
                          const showEnvAlert = agent.metrics?.alertEnv === env;
                          return (
                            <div key={env} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: inst?.suspended ? "#a1a1aa" : inst ? cfg.dot : "#d4d4d8" }} />
                              <span className="text-[14px] font-normal" style={{ color: inst?.suspended ? "#a1a1aa" : inst ? cfg.text : "#d4d4d8" }}>
                                {cfg.label}
                              </span>
                              {inst?.version && (
                                <span className="text-[14px]" style={{ color: inst?.suspended ? "#a1a1aa" : inst ? cfg.text : "#d4d4d8" }}>{formatVersion(inst.version)}</span>
                              )}
                              {inst?.suspended && (
                                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: "#f4f4f5", color: "#888888" }}>Suspended</span>
                              )}
                              {showEnvAlert && (agent.metrics?.alertSeverity?.critical ?? 0) > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="relative flex w-2 h-2 shrink-0">
                                    <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ background: "#dc2626" }} />
                                    <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "#dc2626" }} />
                                  </span>
                                  <span className="text-[12px] font-semibold text-[#dc2626]">{agent.metrics!.alertSeverity!.critical}</span>
                                </span>
                              )}
                              {showEnvAlert && (agent.metrics?.alertSeverity?.warning ?? 0) > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="relative flex w-2 h-2 shrink-0">
                                    <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ background: "#dc2626" }} />
                                    <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "#dc2626" }} />
                                  </span>
                                  <span className="text-[12px] font-semibold text-[#dc2626]">{agent.metrics!.alertSeverity!.warning}</span>
                                </span>
                              )}
                              {showEnvAlert && (agent.metrics?.alertSeverity?.info ?? 0) > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="relative flex w-2 h-2 shrink-0">
                                    <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ background: "#eab308" }} />
                                    <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "#eab308" }} />
                                  </span>
                                  <span className="text-[12px] font-semibold text-[#a16207]">{agent.metrics!.alertSeverity!.info}</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {shown.map((name, idx) => {
                          const src = PERSON_AVATARS_K[name];
                          return src ? (
                            <img key={name} src={src} alt={name} title={name}
                              className="w-6 h-6 rounded-full shrink-0 object-cover"
                              style={{ marginLeft: idx > 0 ? "-8px" : "0", zIndex: idx + 1, position: "relative", boxShadow: "0 0 0 1px #ffffff" }}
                            />
                          ) : (
                            <div key={name}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                              style={{ background: avatarColorK(name), marginLeft: idx > 0 ? "-8px" : "0", zIndex: idx + 1, position: "relative", boxShadow: "0 0 0 1px #ffffff" }}
                              title={name}
                            >
                              {name[0].toUpperCase()}
                            </div>
                          );
                        })}
                        {overflow > 0 && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                            style={{ background: "#c4c4c4", marginLeft: "-8px", position: "relative", zIndex: shown.length + 1, boxShadow: "0 0 0 1px #ffffff" }}>
                            +{overflow}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#aaaaaa]">
                      {timeAgo(agent.lastEditedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && search && (
            <div className="px-4 py-8 text-center text-[14px] text-[#a1a1aa]">
              "{search}"에 대한 결과가 없습니다.
            </div>
          )}
        </div>
      ) : (
        /* Pipeline view — kanban: DEV | STG | PROD */
        <PipelineView agents={sorted} orgSlug={orgSlug} wsSlug={workspace.slug} />
      )}

      {/* No search results in grid/list */}
      {(view === "grid" || view === "list") && workspace.agents.length > 0 && filtered.length === 0 && (
        <div className="py-16 text-center text-[14px] text-[#a1a1aa]">
          "{search}"에 대한 결과가 없습니다.
        </div>
      )}

      {showNewAgent && <NewAgentDialog onClose={() => setShowNewAgent(false)} />}
      </div>
    </div>
  );
}
