"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { EntryPageData, getEnvInstance, Workspace, WorkspaceMember } from "@/lib/mock-data";
import NewWorkspaceDialog from "@/components/workspace/NewWorkspaceDialog";
import OnboardingDialog from "@/components/entry/OnboardingDialog";

// ─── Utilities ───────────────────────────────────────────────────────────────

function formatVersion(v: string): string {
  const stripped = v.replace(/^v0\./, "").replace(/^v/, "");
  return `Version ${stripped}`;
}

function formatConvShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const CARD_SHADOW       = "rgba(0,0,0,0.07) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 4px";
const CARD_SHADOW_HOVER = "rgba(0,0,0,0.12) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 6px 12px";
const BORDER_SHADOW     = "rgba(0,0,0,0.08) 0px 0px 0px 1px";

const ENV_CFG = {
  development: { dot: "#eab308", text: "#a16207", label: "Development" },
  staging:     { dot: "#f97316", text: "#c2410c", label: "Staging"     },
  production:  { dot: "#16a34a", text: "#15803d", label: "Production"  },
} as const;

const AVATAR_COLORS = ["#6366f1", "#0284c7", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2"];
function avatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── MemberAvatar ─────────────────────────────────────────────────────────────

function MemberAvatar({
  member,
  size = 24,
  style,
}: {
  member: WorkspaceMember;
  size?: number;
  style?: React.CSSProperties;
}) {
  const sz = `${size}px`;
  const fontSize = `${Math.floor(size * 0.38)}px`;
  return member.avatarUrl ? (
    <img
      src={member.avatarUrl}
      alt={member.name}
      title={member.name}
      className="rounded-full shrink-0 object-cover"
      style={{ width: sz, height: sz, ...style }}
    />
  ) : (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: sz, height: sz, background: avatarColor(member.name), fontSize, ...style }}
      title={member.name}
    >
      {member.name[0].toUpperCase()}
    </div>
  );
}

// ─── MemberAvatarStack ────────────────────────────────────────────────────────

function MemberAvatarStack({ members, max = 5 }: { members: WorkspaceMember[]; max?: number }) {
  const shown    = members.slice(0, max);
  const overflow = members.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((m, i) => (
        <MemberAvatar
          key={m.name}
          member={m}
          size={24}
          style={{
            marginLeft: i > 0 ? "-7px" : "0",
            zIndex: i + 1,
            position: "relative",
            boxShadow: "0 0 0 2px #ffffff",
          }}
        />
      ))}
      {overflow > 0 && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
          style={{
            background: "#e4e4e7",
            color: "#888888",
            marginLeft: "-7px",
            position: "relative",
            zIndex: shown.length + 1,
            boxShadow: "0 0 0 2px #ffffff",
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data, color = "#171717" }: { data: number[]; color?: string }) {
  const w = 100, h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));

  // Smooth cubic bezier through points (tension 0.2 = subtle curve)
  const t = 0.4;
  const smooth = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = pts[i - 1];
    const dx = (pt.x - prev.x) * t;
    return `${acc} C ${prev.x + dx},${prev.y} ${pt.x - dx},${pt.y} ${pt.x},${pt.y}`;
  }, "");

  const fillD = `${smooth} L ${w},${h} L 0,${h} Z`;
  const gradId = `sg-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: "32px" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} vectorEffect="non-scaling-stroke" />
      <path d={smooth} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ─── PulseDot ─────────────────────────────────────────────────────────────────

function PulseDot({ color, size = 6 }: { color: string; size?: number }) {
  const sz = `${size}px`;
  return (
    <span className="relative flex shrink-0" style={{ width: sz, height: sz }}>
      <span
        className="animate-ping absolute inset-0 rounded-full opacity-75"
        style={{ background: color }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ width: sz, height: sz, background: color }}
      />
    </span>
  );
}

// ─── Left: ActiveIssues ───────────────────────────────────────────────────────

type IssueItem = {
  workspace: Workspace;
  agent: Workspace["agents"][number];
};

function ActiveIssuesPanel({
  issues,
  orgSlug,
}: {
  issues: IssueItem[];
  orgSlug: string;
}) {
  if (issues.length === 0) return null;
  return (
    <section>
      <h2 className="text-[20px] font-semibold text-[#171717] mb-4" style={{ letterSpacing: "-0.3px" }}>
        Active Issues
      </h2>

      <div className="rounded-xl overflow-hidden" style={{ boxShadow: BORDER_SHADOW }}>
        {issues.map(({ workspace, agent }, i) => {
          const sev   = agent.metrics!.alertSeverity!;
          const env   = agent.metrics!.alertEnv!;
          const envCfg = ENV_CFG[env];
          const isWarn = (sev.critical + sev.warning) > 0;
          const dotColor   = isWarn ? "#dc2626" : "#eab308";
          const labelColor = isWarn ? "#dc2626" : "#a16207";
          const labelBg    = isWarn ? "#fff1f2" : "#fefce8";
          const severityLabel =
            sev.critical > 0 ? "Critical" : sev.warning > 0 ? "Warning" : "Info";
          const alertCount = sev.critical + sev.warning + sev.info;

          return (
            <Link
              key={agent.id}
              href={`/org/${orgSlug}/ws/${workspace.slug}/agent/${agent.slug}?env=${env}&tab=overview`}
              className="group relative flex flex-col gap-2 px-4 py-3.5 hover:bg-[#fafafa] transition-colors"
              style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}
            >
              {/* Top row: severity badge only */}
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: labelBg, color: labelColor }}
                >
                  {severityLabel}
                </span>
              </div>

              {/* Agent + message + workspace */}
              <div className="pr-5">
                <p className="text-[14px] font-semibold text-[#171717] leading-snug">
                  {agent.name}
                </p>
                {agent.metrics?.alertMessage && (
                  <p className="text-[14px] text-[#171717] leading-relaxed mt-0.5">
                    {agent.metrics.alertMessage}
                  </p>
                )}
                <p className="text-[12px] text-[#a1a1aa] mt-0.5">
                  {workspace.name}
                </p>
              </div>

              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] transition-all duration-200 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
              >
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ─── Left: MembersPanel ───────────────────────────────────────────────────────

type MemberEntry = { member: WorkspaceMember; workspaces: Workspace[] };

function MembersPanel({ members }: { members: MemberEntry[] }) {
  return (
    <section>
      <h2 className="text-[20px] font-semibold text-[#171717] mb-4" style={{ letterSpacing: "-0.3px" }}>
        Members
      </h2>

      <div className="rounded-xl overflow-hidden" style={{ boxShadow: BORDER_SHADOW }}>
        <div className="overflow-y-auto" style={{ maxHeight: "502px" }}>
        {members.map(({ member }, i) => (
          <div
            key={member.name}
            className="group relative flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] transition-colors cursor-pointer"
            style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}
          >
            <MemberAvatar member={member} size={28} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#171717] truncate">{member.name}</p>
              {member.role && (
                <p className="text-[12px] text-[#a1a1aa] mt-px">{member.role}</p>
              )}
            </div>
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              className="text-[#a1a1aa] transition-all duration-200 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
            >
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}

// ─── Right: WorkspaceListItem ─────────────────────────────────────────────────

function WorkspaceListItem({
  workspace,
  orgSlug,
}: {
  workspace: Workspace;
  orgSlug: string;
}) {
  const tm       = workspace.teamMetrics;
  const critWarn = tm ? tm.alerts.critical + tm.alerts.warning : 0;
  const infoOnly = tm ? tm.alerts.info : 0;

  return (
    <Link
      href={`/org/${orgSlug}/ws/${workspace.slug}`}
      className="group relative rounded-xl bg-white overflow-hidden transition-all duration-150 hover:bg-[#fafafa]"
      style={{ boxShadow: CARD_SHADOW }}
    >
      {/* Main */}
      <div className="flex items-center flex-1 min-w-0 px-5 py-4 pr-4">
        <div className={`flex flex-1 min-w-0 ${tm ? "items-start" : "items-center"} gap-3`}>
            {/* 64×64 thumbnail */}
            <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 64, height: 64 }}>
              {workspace.coverImage ? (
                <img src={workspace.coverImage} alt={workspace.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: workspace.color ?? "#f4f4f5" }}>
                  {workspace.iconEmoji}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-semibold text-[#171717] leading-snug" style={{ letterSpacing: "-0.2px" }}>
                  {workspace.name}
                </h3>
                {critWarn > 0 && (
                  <span className="flex items-center gap-1.5">
                    <PulseDot color="#dc2626" size={6} />
                    <span className="text-[12px] font-semibold text-[#dc2626]">{critWarn}</span>
                  </span>
                )}
                {infoOnly > 0 && (
                  <span className="flex items-center gap-1.5">
                    <PulseDot color="#eab308" size={6} />
                    <span className="text-[12px] font-semibold text-[#a16207]">{infoOnly}</span>
                  </span>
                )}
              </div>
              {workspace.description && (
                <p className="text-[14px] text-[#171717] mt-0.5 line-clamp-1">
                  {workspace.description}
                </p>
              )}
              {/* Metrics */}
              {tm && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[12px] text-[#888888]">
                    <span className="font-semibold text-[#171717]">{formatConvShort(tm.conversationsToday.value)}</span>
                    {" "}conversations
                  </span>
                  <span className="text-[12px] text-[#888888]">
                    <span className="font-semibold text-[#171717]">{tm.avgCsat.value.toFixed(1)}</span>
                    /5 CSAT
                  </span>
                  <span className="text-[12px] text-[#888888]">
                    <span className="font-semibold text-[#171717]">{tm.activeAgents.active}</span>
                    /{tm.activeAgents.total} active
                  </span>
                </div>
              )}
            </div>
        </div>
        <div className="shrink-0 ml-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-[#a1a1aa]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Member avatars + agent count */}
      <div
        className="px-5 py-2.5 flex items-center justify-between"
        style={{ borderTop: "1px solid #f0f0f0", background: "#fafafa" }}
      >
        {workspace.members && workspace.members.length > 0
          ? <MemberAvatarStack members={workspace.members} max={6} />
          : <span />
        }
        <span className="text-[12px] text-[#a1a1aa]">
          {workspace.memberCount} members · {workspace.agents.length} agents
        </span>
      </div>
    </Link>
  );
}

// ─── Right: AgentListItem ─────────────────────────────────────────────────────

function AgentListItem({
  agent,
  workspace,
  orgSlug,
  isFirst,
}: {
  agent: Workspace["agents"][number];
  workspace: Workspace;
  orgSlug: string;
  isFirst: boolean;
}) {
  const dev  = getEnvInstance(agent, "development");
  const stg  = getEnvInstance(agent, "staging");
  const prod = getEnvInstance(agent, "production");
  const alertEnv   = agent.metrics?.alertEnv;
  const alertSev   = agent.metrics?.alertSeverity;
  const alertCount = agent.metrics?.alertCount ?? 0;
  const isWarnAlert = alertSev ? (alertSev.critical + alertSev.warning) > 0 : false;

  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  return (
    <>
      {tooltip && (
        <div
          className="fixed z-9999 pointer-events-none whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium text-white"
          style={{ background: "#171717", top: tooltip.y - 32, left: tooltip.x, transform: "translateX(-50%)" }}
        >
          {tooltip.text}
        </div>
      )}
      <Link
        href={`/org/${orgSlug}/ws/${workspace.slug}/agent/${agent.slug}`}
        className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#fafafa] transition-colors"
        style={{ borderTop: !isFirst ? "1px solid #f4f4f5" : undefined }}
      >
        <div className="flex-1 min-w-0">
          <span className="text-[16px] font-semibold text-[#171717] truncate">{agent.name}</span>
          <p className="text-[12px] text-[#a1a1aa] mt-0.5">
            {workspace.name}
          </p>
        </div>

        {/* Env pipeline labels */}
        <div className="flex items-center gap-3 shrink-0">
          {(["development", "staging", "production"] as const).map((env) => {
            const inst = env === "development" ? dev : env === "staging" ? stg : prod;
            const cfg  = ENV_CFG[env];
            const inactive = !inst || inst.suspended;
            const isAlertEnv = alertCount > 0 && alertEnv === env;
            const sev = agent.metrics?.alertSeverity;
            const envAlertCount = isAlertEnv ? alertCount : 0;
            const isWarn = isAlertEnv && sev ? (sev.critical + sev.warning) > 0 : false;
            const pulseDotColor = isWarn ? "#dc2626" : "#eab308";
            const labelColor = inactive ? "#d4d4d8" : cfg.text;
            const LABEL: Record<string, string> = { development: "Development", staging: "Staging", production: "Production" };
            const tooltipText = inst
              ? `${cfg.label} · ${formatVersion(inst.version)}${inst.suspended ? " · Suspended" : ""}`
              : `${cfg.label} · Not deployed`;

            return (
              <span
                key={env}
                className="flex items-center gap-1"
                onMouseEnter={(e) => {
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setTooltip({ text: tooltipText, x: r.left + r.width / 2, y: r.top });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <span className="text-[14px] font-medium leading-none" style={{ color: labelColor }}>
                  {LABEL[env]}
                </span>
                {envAlertCount > 0 && (
                  <>
                    <span className="relative flex w-1.5 h-1.5 shrink-0 ml-0.5">
                      <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ background: pulseDotColor }} />
                      <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ background: pulseDotColor }} />
                    </span>
                    <span className="text-[11px] font-semibold leading-none" style={{ color: pulseDotColor }}>
                      {envAlertCount}
                    </span>
                  </>
                )}
              </span>
            );
          })}
        </div>

      {/* Chevron */}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#c4c4c4] shrink-0">
        <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
    </>
  );
}

// ─── OrgHome ──────────────────────────────────────────────────────────────────

export default function OrgHome({ data }: { data: EntryPageData }) {
  const { organization, workspaces } = data;
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);

  // ── Aggregate KPIs ────────────────────────────────────────────────────────
  const wsWithMetrics  = workspaces.filter((ws) => ws.teamMetrics);
  const totalConvos    = wsWithMetrics.reduce((s, ws) => s + ws.teamMetrics!.conversationsToday.value, 0);
  const totalAgents    = workspaces.reduce((s, ws) => s + ws.agents.length, 0);
  const activeAgents   = wsWithMetrics.reduce((s, ws) => s + ws.teamMetrics!.activeAgents.active, 0);
  const totalCritical  = wsWithMetrics.reduce((s, ws) => s + ws.teamMetrics!.alerts.critical, 0);
  const totalWarning   = wsWithMetrics.reduce((s, ws) => s + ws.teamMetrics!.alerts.warning, 0);
  const totalInfo      = wsWithMetrics.reduce((s, ws) => s + ws.teamMetrics!.alerts.info, 0);
  const totalAlerts    = totalCritical + totalWarning + totalInfo;
  const avgCsat        = wsWithMetrics.length > 0
    ? wsWithMetrics.reduce((s, ws) => s + ws.teamMetrics!.avgCsat.value, 0) / wsWithMetrics.length
    : null;
  const avgConvosChange = wsWithMetrics.length > 0
    ? wsWithMetrics.reduce((s, ws) => s + ws.teamMetrics!.conversationsToday.changePercent, 0) / wsWithMetrics.length
    : null;
  const avgCsatChange  = wsWithMetrics.length > 0
    ? wsWithMetrics.reduce((s, ws) => s + ws.teamMetrics!.avgCsat.change, 0) / wsWithMetrics.length
    : null;

  // ── Active Issues ─────────────────────────────────────────────────────────
  const activeIssues: IssueItem[] = workspaces
    .flatMap((ws) =>
      ws.agents
        .filter((a) => (a.metrics?.alertCount ?? 0) > 0 && a.metrics?.alertSeverity && a.metrics.alertEnv)
        .map((a) => ({ workspace: ws, agent: a }))
    )
    .sort((a, b) => {
      const score = (m: typeof a.agent.metrics) =>
        ((m?.alertSeverity?.critical ?? 0) * 100) +
        ((m?.alertSeverity?.warning  ?? 0) * 10)  +
        (m?.alertSeverity?.info      ?? 0);
      return score(b.agent.metrics) - score(a.agent.metrics);
    });

  // ── All members deduplicated ───────────────────────────────────────────────
  const membersMap = new Map<string, MemberEntry>();
  for (const ws of workspaces) {
    for (const m of ws.members ?? []) {
      if (!membersMap.has(m.name)) {
        membersMap.set(m.name, { member: m, workspaces: [ws] });
      } else {
        membersMap.get(m.name)!.workspaces.push(ws);
      }
    }
  }
  const allMembers = Array.from(membersMap.values());

  // ── All agents flat ───────────────────────────────────────────────────────
  const allAgents = workspaces.flatMap((ws) =>
    ws.agents.map((agent) => ({ agent, workspace: ws }))
  );

  return (
    <>
    <OnboardingDialog />
    {showNewWorkspace && <NewWorkspaceDialog onClose={() => setShowNewWorkspace(false)} />}
    <div className="px-8 pt-8 pb-20">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-8 mb-8 -mx-8 px-8 border-b border-[#f4f4f5]">
        <div className="flex items-center gap-4">
          <h1
            className="text-[28px] font-semibold text-[#171717] leading-tight"
            style={{ letterSpacing: "-0.4px" }}
          >
            {organization.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNewWorkspace(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white hover:opacity-85 transition-opacity cursor-pointer"
            style={{ background: "#171717" }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New Workspace
          </button>
          <Link
            href={`/org/${organization.slug}/settings/general`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Org Settings
          </Link>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="flex gap-10 items-start">

        {/* ── Left column: overview + tabs + list ───────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-10">

          {/* Overview KPIs */}
          {wsWithMetrics.length > 0 && (
            <div>
            <h2 className="text-[20px] font-semibold text-[#171717] mb-4" style={{ letterSpacing: "-0.3px" }}>Overview</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="group metric-card rounded-xl overflow-hidden flex flex-col cursor-pointer" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
                <div className="relative px-5 pt-4 pb-4">
                  <p className="text-[12px] font-normal text-[#a1a1aa] tracking-wide mb-3">Conversations Today</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-[28px] font-semibold text-[#171717] leading-none" style={{ letterSpacing: "-0.5px" }}>
                      {formatConvShort(totalConvos)}
                    </p>
                    {avgConvosChange !== null && (
                      <span className="text-[12px] font-medium" style={{ color: avgConvosChange >= 0 ? "#15803d" : "#dc2626" }}>
                        {avgConvosChange >= 0 ? "↑" : "↓"} {Math.abs(avgConvosChange).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className="absolute right-4 top-4 text-[#a1a1aa] opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="mt-auto">
                  <Sparkline data={[3200, 2400, 3600, 2800, 3900, 2600, 3842]} color="#a3a3a3" />
                </div>
              </div>

              <div className="group metric-card rounded-xl overflow-hidden flex flex-col cursor-pointer" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
                <div className="relative px-5 pt-4 pb-4">
                  <p className="text-[12px] font-normal text-[#a1a1aa] tracking-wide mb-3">Avg CSAT</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-[28px] font-semibold text-[#171717] leading-none" style={{ letterSpacing: "-0.5px" }}>
                      {avgCsat ? avgCsat.toFixed(1) : "—"}
                    </p>
                    {avgCsat && <p className="text-[13px] text-[#a1a1aa]">/ 5</p>}
                    {avgCsatChange !== null && (
                      <span className="text-[12px] font-medium" style={{ color: avgCsatChange >= 0 ? "#15803d" : "#dc2626" }}>
                        {avgCsatChange >= 0 ? "↑" : "↓"} {Math.abs(avgCsatChange).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className="absolute right-4 top-4 text-[#a1a1aa] opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="mt-auto">
                  <Sparkline data={[3.5, 3.6, 3.8, 3.7, 3.9, 4.1, 4.3]} color="#93c5fd" />
                </div>
              </div>

              <div className="group metric-card rounded-xl overflow-hidden flex flex-col cursor-pointer" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
                <div className="relative px-5 pt-4 pb-4">
                  <p className="text-[12px] font-normal text-[#a1a1aa] tracking-wide mb-3">Alerts</p>
                  <p className="text-[28px] font-semibold leading-none" style={{ letterSpacing: "-0.5px", color: totalAlerts === 0 ? "#15803d" : "#171717" }}>
                    {totalAlerts}
                  </p>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className="absolute right-4 top-4 text-[#a1a1aa] opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="mt-auto">
                  <Sparkline data={[5, 3, 6, 4, 7, 5, totalAlerts]} color={totalAlerts === 0 ? "#86efac" : "#fca5a5"} />
                </div>
              </div>

            </div>
            </div>
          )}

          {/* Workspaces */}
          <section>
            <h2 className="text-[20px] font-semibold text-[#171717] mb-4" style={{ letterSpacing: "-0.3px" }}>
              Workspaces
            </h2>
            <div className="flex flex-col gap-3">
              {workspaces.map((ws) => (
                <WorkspaceListItem key={ws.id} workspace={ws} orgSlug={organization.slug} />
              ))}
              <button
                onClick={() => setShowNewWorkspace(true)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-[13px] font-medium text-[#c4c4c4] hover:text-[#888888] hover:bg-[#fafafa] transition-all cursor-pointer"
                style={{ border: "1.5px dashed #e4e4e7" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                New Workspace
              </button>
            </div>
          </section>

          {/* Agents */}
          <section>
            <h2 className="text-[20px] font-semibold text-[#171717] mb-4" style={{ letterSpacing: "-0.3px" }}>
              Agents
            </h2>
            <div className="rounded-xl overflow-hidden" style={{ boxShadow: BORDER_SHADOW }}>
              {allAgents.map(({ agent, workspace }, i) => (
                <AgentListItem
                  key={agent.id}
                  agent={agent}
                  workspace={workspace}
                  orgSlug={organization.slug}
                  isFirst={i === 0}
                />
              ))}
            </div>
          </section>
        </div>

        {/* ── Right column: issues + members ─────────────────────────────── */}
        <div className="w-90 shrink-0 flex flex-col gap-10">

          <ActiveIssuesPanel issues={activeIssues} orgSlug={organization.slug} />
          {allMembers.length > 0 && <MembersPanel members={allMembers} />}

        </div>
      </div>
    </div>
    </>
  );
}
