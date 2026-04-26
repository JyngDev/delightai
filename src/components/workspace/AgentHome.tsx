"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Agent, AgentEnvironmentInstance, getEnvInstance } from "@/lib/mock-data";

// ── types & helpers ──────────────────────────────────────────────────────────

type EnvType = "development" | "staging" | "production";
type TabType = "overview" | "build" | "test" | "evaluate";
type BuildSection = "instructions" | "knowledgebase" | "actionbooks" | "tools" | "safeguards" | "model" | "channels";

function timeAgo(iso: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function formatVersion(v: string): string {
  const stripped = v.replace(/^v0\./, "").replace(/^v/, "");
  const formatted = /^\d+$/.test(stripped) ? `${stripped}.0` : stripped;
  return `Version ${formatted}`;
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
  const gradId = `sg-ag-${color.replace("#", "")}`;
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


// ── constants ────────────────────────────────────────────────────────────────

const ENV_CFG = {
  development: { label: "Development", short: "DEV", dot: "#eab308", text: "#a16207", bg: "#fefce8", ring: "#d97706" },
  staging:     { label: "Staging",     short: "STG", dot: "#f97316", text: "#c2410c", bg: "#fff7ed", ring: "#f97316" },
  production:  { label: "Production",  short: "PROD", dot: "#16a34a", text: "#15803d", bg: "#f0fdf4", ring: "#16a34a" },
} as const;

const HEALTH_COLORS: Record<string, string> = {
  healthy: "#16a34a",
  warning: "#d97706",
  error: "#dc2626",
  unknown: "#d4d4d8",
};

const BUILD_SECTIONS: { key: BuildSection; label: string }[] = [
  { key: "instructions",  label: "Instructions" },
  { key: "knowledgebase", label: "Knowledgebase" },
  { key: "actionbooks",   label: "Actionbooks" },
  { key: "tools",         label: "Tools" },
  { key: "safeguards",    label: "Safeguards" },
  { key: "model",         label: "Model" },
  { key: "channels",      label: "Channels" },
];

const MOCK_CHANGES = [
  { id: "instructions", label: "Instructions updated", detail: 'Added "polite tone" guideline' },
  { id: "knowledgebase", label: "Knowledgebase added", detail: "+ 2026 Pricing FAQ" },
  { id: "actionbooks", label: "Actionbook updated", detail: "Refund handling steps improved" },
  { id: "safeguards", label: "Safeguards updated", detail: "PII filter enhanced" },
  { id: "model", label: "Model changed", detail: "GPT-4 → GPT-4 Turbo" },
];

const MOCK_CHAT: { role: "user" | "agent"; text: string; sources?: { kb: string; tool: string; tokens: number; time: string } }[] = [
  { role: "user", text: "Hi, I'd like to buy 2 tickets for the El Clásico on March 12th." },
  {
    role: "agent",
    text: "Hello! I can help you with that. For El Clásico on March 12th at Camp Nou, available seats include:\n\n• Gol Sud (South Goal): 2 seats at €85 each\n• Lateral (Side): 4 seats at €145 each\n• Main Tribune: 1 seat at €220\n\nWhich section would you prefer?",
    sources: { kb: "Match Schedule 2026", tool: "ticket_lookup", tokens: 842, time: "1.2s" },
  },
  { role: "user", text: "I'll take the 2 seats in Gol Sud please." },
  {
    role: "agent",
    text: "Perfect! Processing your request for 2 seats in Gol Sud at €85 each (total: €170).\n\nTo complete the purchase, I'll need:\n1. Your Membership ID (or guest checkout)\n2. Payment method\n\nWould you like to proceed with your registered account?",
    sources: { kb: "Ticket Policy", tool: "ticket_booking_api", tokens: 521, time: "0.9s" },
  },
];

const MOCK_CONVERSATIONS = [
  { time: "14m ago", user: "User #2291", intent: "Ticket purchase",  csat: 5, confidence: 0.97, status: "resolved" },
  { time: "28m ago", user: "User #7734", intent: "Refund request",   csat: 3, confidence: 0.52, status: "escalated" },
  { time: "41m ago", user: "User #1102", intent: "Seat upgrade",     csat: 4, confidence: 0.88, status: "resolved" },
  { time: "55m ago", user: "User #8832", intent: "Membership query", csat: 5, confidence: 0.94, status: "resolved" },
  { time: "1h ago",  user: "User #3310", intent: "Match schedule",   csat: 5, confidence: 0.99, status: "resolved" },
  { time: "1h ago",  user: "User #6621", intent: "Merch query",      csat: 2, confidence: 0.41, status: "escalated" },
];

// ── Composite Labels ─────────────────────────────────────────────────────────

function CompositeLabels({ agent }: { agent: Agent }) {
  const prod    = getEnvInstance(agent, "production");
  const staging = getEnvInstance(agent, "staging");
  const dev     = getEnvInstance(agent, "development");

  const labels: { text: string; bg: string; color: string; dot: string }[] = [];
  if (prod) labels.push({ text: "LIVE", bg: "#f0fdf4", color: "#15803d", dot: "#16a34a" });
  if (staging && (!prod || staging.version !== prod.version))
    labels.push({ text: "IN REVIEW", bg: "#fff7ed", color: "#c2410c", dot: "#f97316" });
  if (dev && (!prod || dev.version !== prod.version))
    labels.push({ text: "IN DEVELOPMENT", bg: "#fefce8", color: "#a16207", dot: "#eab308" });
  if (!prod && !staging && !dev)
    labels.push({ text: "NOT DEPLOYED", bg: "#f4f4f5", color: "#71717a", dot: "#d4d4d8" });

  return (
    <div className="flex items-center gap-1.5 mt-1">
      {labels.map((l) => (
        <span
          key={l.text}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
          style={{ background: l.bg, color: l.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: l.dot }} />
          {l.text}
        </span>
      ))}
    </div>
  );
}

// ── Promote Dialog ───────────────────────────────────────────────────────────

function PromoteDialog({
  from, to, onClose, onConfirm,
}: {
  from: EnvType; to: "staging" | "production"; onClose: () => void; onConfirm: () => void;
}) {
  const [step, setStep] = useState<"detecting" | "select" | "confirm">("detecting");
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_CHANGES.map((c) => [c.id, true]))
  );

  useEffect(() => {
    const t = setTimeout(() => setStep("select"), 1200);
    return () => clearTimeout(t);
  }, []);

  const selectedCount = Object.values(checked).filter(Boolean).length;
  const fromCfg = ENV_CFG[from];
  const toCfg = ENV_CFG[to];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.3)" }}
      onClick={onClose}
    >
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4" style={{ borderBottom: "1px solid #f4f4f5" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold px-2 py-0.5 rounded" style={{ background: fromCfg.bg, color: fromCfg.text }}>{fromCfg.label}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#a1a1aa]">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[12px] font-semibold px-2 py-0.5 rounded" style={{ background: toCfg.bg, color: toCfg.text }}>{toCfg.label}</span>
          </div>
          <h2 className="text-[18px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.3px" }}>
            Promote to {toCfg.label}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {step === "detecting" && (
            <div className="flex items-center gap-3 py-6">
              <div className="w-4 h-4 rounded-full border-2 border-[#171717] border-t-transparent animate-spin shrink-0" />
              <span className="text-[14px] text-[#666666]">Detecting changes...</span>
            </div>
          )}

          {step === "select" && (
            <>
              <p className="text-[13px] text-[#888888] mb-4">{MOCK_CHANGES.length} changes detected. Select which to deploy:</p>
              <div className="flex flex-col gap-2">
                {MOCK_CHANGES.map((change) => (
                  <label
                    key={change.id}
                    className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-[#fafafa] transition-colors"
                    style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}
                  >
                    <input
                      type="checkbox"
                      checked={checked[change.id]}
                      onChange={(e) => setChecked((prev) => ({ ...prev, [change.id]: e.target.checked }))}
                      className="mt-0.5 accent-[#171717]"
                    />
                    <div>
                      <p className="text-[14px] font-medium text-[#171717]">{change.label}</p>
                      <p className="text-[12px] text-[#888888]">{change.detail}</p>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className="rounded-lg p-4 mb-4" style={{ background: "#fafafa", boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
                <p className="text-[13px] font-semibold text-[#171717] mb-2">Changes to be deployed:</p>
                {MOCK_CHANGES.filter((c) => checked[c.id]).map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-[13px] text-[#666666] py-0.5">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {c.label}
                  </div>
                ))}
              </div>
              {to === "production" && (
                <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "#fff7ed", boxShadow: "rgba(249,115,22,0.2) 0px 0px 0px 1px" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
                    <path d="M7 1.5L13 12H1L7 1.5Z" stroke="#c2410c" strokeWidth="1.2" strokeLinejoin="round" />
                    <path d="M7 5.5v3" stroke="#c2410c" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="7" cy="9.5" r="0.5" fill="#c2410c" />
                  </svg>
                  <p className="text-[12px] text-[#c2410c]">Deploying to Production affects real users. Verify in Staging first.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-2" style={{ borderTop: "1px solid #f4f4f5" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-[14px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors"
          >
            Cancel
          </button>
          {step === "select" && (
            <button
              onClick={() => setStep("confirm")}
              disabled={selectedCount === 0}
              className="px-4 py-2 rounded-md text-[14px] font-medium text-white hover:opacity-85 transition-opacity disabled:opacity-40"
              style={{ background: "#171717" }}
            >
              Continue ({selectedCount}/{MOCK_CHANGES.length}) →
            </button>
          )}
          {step === "confirm" && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md text-[14px] font-medium text-white hover:opacity-85 transition-opacity"
              style={{ background: to === "production" ? "#dc2626" : "#171717" }}
            >
              ✓ Promote to {toCfg.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const DEPLOY_HISTORY_NOTES = [
  "안정성 패치 및 성능 최적화",
  "응답 속도 최적화, 데이터 업데이트",
  "주요 기능 모듈 통합",
  "UI 리포트 개선 및 버그 수정",
  "긴급 핫픽스 — 이전 버전 복구",
];
const DEPLOY_BY = ["Raphinha", "Deco", "Pedri González", "Lamine Yamal"];
const DEPLOY_DATES = ["Apr 15, 2026", "Apr 10, 2026", "Apr 5, 2026", "Mar 28, 2026", "Mar 20, 2026"];

function buildDeployHistory(instance: AgentEnvironmentInstance | null): { version: string; date: string; by: string; note: string; isRollback?: boolean }[] {
  if (!instance) return [];
  const current = instance.version;
  const [major, minor] = current.replace(/^v/, "").split(".").map(Number);
  const entries = [];
  for (let i = 0; i < 5; i++) {
    let m = minor - i;
    let ma = major;
    if (m < 0) { ma = major - 1; m = Math.max(0, 9 + m); }
    if (ma < 0) break;
    const ver = `v${ma}.${m}`;
    entries.push({
      version: ver,
      date: DEPLOY_DATES[i] ?? `Mar ${10 - i}, 2026`,
      by: i === 0 ? (instance.deployedBy ?? DEPLOY_BY[0]) : DEPLOY_BY[i % DEPLOY_BY.length],
      note: i === 0 ? (instance.versionNote ?? DEPLOY_HISTORY_NOTES[0]) : DEPLOY_HISTORY_NOTES[i],
      isRollback: i === 4,
    });
  }
  return entries;
}

function buildStagingHistory(instance: AgentEnvironmentInstance | null): { version: string; date: string; by: string; passed: number; total: number; promotedToProd: boolean }[] {
  if (!instance) return [];
  const current = instance.version;
  const [major, minor] = current.replace(/^v/, "").split(".").map(Number);
  const entries = [];
  for (let i = 0; i < 4; i++) {
    let m = minor - i;
    let ma = major;
    if (m < 0) { ma = major - 1; m = Math.max(0, 9 + m); }
    if (ma < 0) break;
    const passed = i === 0 ? 45 : [48, 50, 38][i - 1] ?? 45;
    entries.push({
      version: `v${ma}.${m}`,
      date: DEPLOY_DATES[i] ?? `Mar ${10 - i}, 2026`,
      by: i === 0 ? (instance.deployedBy ?? DEPLOY_BY[0]) : DEPLOY_BY[i % DEPLOY_BY.length],
      passed,
      total: 50,
      promotedToProd: i < 3,
    });
  }
  return entries;
}

const DEV_EDIT_HISTORY: { type: "edit" | "save" | "promote"; event: string; who: string; when: string; areas?: string[] }[] = [
  { type: "edit",    event: "Instructions modified",       who: "Lamine Yamal", when: "2h ago",  areas: ["Instructions"] },
  { type: "save",    event: "Version 1.4 saved",                  who: "Lamine Yamal", when: "4h ago",  areas: ["Knowledgebase"] },
  { type: "edit",    event: "Safeguards updated",               who: "Raphinha",     when: "6h ago",  areas: ["Safeguards"] },
  { type: "promote", event: "Version 1.2 promoted to Staging",  who: "Deco",         when: "2d ago" },
  { type: "save",    event: "Version 1.2 saved",                who: "Deco",         when: "2d ago",  areas: ["Actionbook", "Safeguards"] },
];

// ── Overview Tab ─────────────────────────────────────────────────────────────

const ALERT_ITEMS: Record<EnvType, { level: "warning" | "info"; title: string; desc: string }[]> = {
  production: [
    { level: "warning", title: "Resolution rate dropped on Refund intent",   desc: "지난 48시간 환불 관련 대화 해결률 62% — 평균 대비 -12%p. Evaluate 탭에서 확인하세요." },
    { level: "warning", title: "Response latency spike detected",             desc: "피크 시간대 평균 응답 시간 3.1s. 정상 범위(< 1.5s) 초과 중입니다." },
    { level: "info",    title: "CSAT improving trend",                        desc: "최근 7일 CSAT 4.5로 전주 대비 +0.2 상승 중입니다." },
  ],
  staging: [
    { level: "warning", title: "7 test cases not yet run",                   desc: "35개 중 28개만 실행됨. 남은 케이스를 실행한 뒤 Promote 여부를 결정하세요." },
    { level: "warning", title: "Refund request scenario failing (2 / 8)",    desc: "환불 시나리오 2건 실패. Test 탭에서 실패 원인을 확인하세요." },
    { level: "info",    title: "Staging for 2d 4h",                          desc: "권장 스테이징 기간(24h) 경과. 테스트 완료 시 Production으로 Promote 가능합니다." },
  ],
  development: [
    { level: "info",    title: "5 changes since last promote",                desc: "Instructions · Knowledgebase · Safeguards · Model · Actionbook이 수정됐습니다. Build 탭에서 검토하세요." },
    { level: "info",    title: "No test run in 18h",                         desc: "최근 테스트 실행이 없습니다. Promote 전에 Test 탭에서 시뮬레이션을 실행하세요." },
  ],
};

function OverviewTab({
  agent, env, instance,
}: {
  agent: Agent; env: EnvType; instance: AgentEnvironmentInstance | null;
}) {
  const m = agent.metrics;
  const sev = m?.alertSeverity;
  const isAlertEnv = !m?.alertEnv || m.alertEnv === env;

  const warningCount = isAlertEnv ? (sev?.warning ?? 0) : 0;
  const infoCount    = isAlertEnv ? (sev?.info    ?? 0) : 0;

  const visibleAlerts = [
    ...ALERT_ITEMS[env].filter((a) => a.level === "warning").slice(0, warningCount),
    ...ALERT_ITEMS[env].filter((a) => a.level === "info").slice(0, infoCount),
  ];

  const AlertSection = () => {
    if (!visibleAlerts.length) return null;
    return (
      <div className="flex flex-col gap-2 mb-6">
        {visibleAlerts.map((a, i) => {
          const isWarn = a.level === "warning";
          return (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3 rounded-lg"
              style={{
                background: isWarn ? "#fff1f2" : "#f8faff",
                boxShadow: isWarn ? "rgba(220,38,38,0.15) 0px 0px 0px 1px" : "rgba(99,102,241,0.15) 0px 0px 0px 1px",
              }}
            >
              <span className="relative flex w-2 h-2 shrink-0 mt-1.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ background: isWarn ? "#dc2626" : "#6366f1" }}
                />
                <span
                  className="relative inline-flex rounded-full w-2 h-2"
                  style={{ background: isWarn ? "#dc2626" : "#6366f1" }}
                />
              </span>
              <div>
                <p className="text-[13px] font-semibold mb-0.5" style={{ color: isWarn ? "#991b1b" : "#3730a3" }}>{a.title}</p>
                <p className="text-[12px]" style={{ color: isWarn ? "#dc2626" : "#4f46e5" }}>{a.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (env === "production") {
    const healthColor = instance?.health === "healthy" ? "#16a34a" : instance?.health === "warning" ? "#d97706" : "#dc2626";
    const healthLabel = instance?.health === "healthy" ? "Healthy" : instance?.health === "warning" ? "Warning" : "Error";
    const deployHistory = buildDeployHistory(instance);
    const topIntents = [
      { label: "Ticket purchase",  count: 342, pct: 100 },
      { label: "Refund request",   count: 218, pct: 64 },
      { label: "Match schedule",   count: 197, pct: 58 },
      { label: "Membership info",  count: 143, pct: 42 },
      { label: "Seat upgrade",     count: 89,  pct: 26 },
    ];
    return (
      <div>
        {/* 알림 — 최상단 */}
        <AlertSection />

        {/* Block B: KPI 4개 */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {/* Conversations Today */}
          <div className="group metric-card rounded-xl overflow-hidden flex flex-col cursor-pointer" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
            <div className="relative px-5 pt-4 pb-4">
              <div className="absolute right-4 top-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-[#a1a1aa]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-3">Conversations Today</p>
              <div className="flex items-baseline gap-2">
                <p className="text-[28px] font-semibold text-[#171717] leading-none" style={{ letterSpacing: "-0.5px" }}>1,248</p>
                <span className="text-[12px] font-medium text-[#15803d]">↑8.3%</span>
              </div>
            </div>
            <Sparkline data={[980, 1100, 890, 1320, 1050, 1400, 1248]} color="#a3a3a3" />
          </div>

          {/* Avg CSAT */}
          <div className="group metric-card rounded-xl overflow-hidden flex flex-col cursor-pointer" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
            <div className="relative px-5 pt-4 pb-4">
              <div className="absolute right-4 top-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-[#a1a1aa]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-3">Avg CSAT</p>
              <div className="flex items-baseline gap-2">
                <div className="flex items-baseline gap-1.5">
                  <p className="text-[28px] font-semibold text-[#171717] leading-none" style={{ letterSpacing: "-0.5px" }}>{m?.csat?.toFixed(1) ?? "—"}</p>
                  {m?.csat != null && <p className="text-[13px] text-[#a1a1aa]">/ 5</p>}
                </div>
                {m?.csat != null && <span className="text-[12px] font-medium text-[#15803d]">↑0.1</span>}
              </div>
            </div>
            <Sparkline data={[3.8, 3.7, 4.0, 3.9, 4.2, 4.3, m?.csat ?? 4.3]} color="#93c5fd" />
          </div>

          {/* Resolution Rate */}
          <div className="group metric-card rounded-xl overflow-hidden flex flex-col cursor-pointer" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
            <div className="relative px-5 pt-4 pb-4">
              <div className="absolute right-4 top-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-[#a1a1aa]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-3">Resolution Rate</p>
              <div className="flex items-baseline gap-2">
                <p className="text-[28px] font-semibold text-[#171717] leading-none" style={{ letterSpacing: "-0.5px" }}>{m?.resolutionRate ? `${m.resolutionRate}%` : "—"}</p>
                {m?.resolutionRate != null && <span className="text-[12px] font-medium text-[#15803d]">↑2%</span>}
              </div>
            </div>
            <Sparkline data={[68, 72, 70, 75, 73, 78, m?.resolutionRate ?? 74]} color="#86efac" />
          </div>

          {/* Avg Response Time */}
          <div className="group metric-card rounded-xl overflow-hidden flex flex-col cursor-pointer" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
            <div className="relative px-5 pt-4 pb-4">
              <div className="absolute right-4 top-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-[#a1a1aa]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-3">Avg Response Time</p>
              <div className="flex items-baseline gap-2">
                <p className="text-[28px] font-semibold text-[#171717] leading-none" style={{ letterSpacing: "-0.5px" }}>1.3s</p>
                <span className="text-[12px] font-medium text-[#dc2626]">↑0.2s</span>
              </div>
            </div>
            <Sparkline data={[1.0, 1.1, 0.9, 1.2, 1.0, 1.4, 1.3]} color="#fca5a5" />
          </div>
        </div>

        {/* Block A: Version Information */}
        <div className="mb-10">
          <p className="text-[20px] font-semibold text-[#171717] mb-4">Version Information</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-[#a1a1aa] w-28 shrink-0">Status</span>
              <span className="flex items-center gap-1.5 font-medium" style={{ color: healthColor }}>
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: healthColor }} />
                  <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: healthColor }} />
                </span>
                {healthLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-[#a1a1aa] w-28 shrink-0">Version</span>
              <span className="text-[#171717]">{instance?.version ? formatVersion(instance.version) : "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-[#a1a1aa] w-28 shrink-0">Deployed</span>
              <span className="text-[#171717]">{timeAgo(instance?.deployedAt ?? "")} by {instance?.deployedBy ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-[#a1a1aa] w-28 shrink-0">Uptime (7d)</span>
              <span className="text-[#171717]">99.98%</span>
            </div>
            {instance?.versionNote && (
              <div className="flex items-start gap-2 text-[14px]">
                <span className="text-[#a1a1aa] w-28 shrink-0">Note</span>
                <span className="text-[#171717]">{instance.versionNote}</span>
              </div>
            )}
          </div>
        </div>


        {/* Block D: Top Intents */}
        <h3 className="text-[20px] font-semibold text-[#171717] mb-4">Top Intents (last 7 days)</h3>
        <div className="rounded-xl overflow-hidden mb-10" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          {topIntents.map((intent, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <span className="text-[14px] text-[#171717] w-36 shrink-0">{intent.label}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#f4f4f5" }}>
                <div className="h-full rounded-full" style={{ width: `${intent.pct}%`, background: "#171717" }} />
              </div>
              <span className="text-[12px] text-[#171717] w-10 text-right shrink-0">{intent.count}</span>
            </div>
          ))}
        </div>

        {/* Block E: 최근 대화 */}
        <h3 className="text-[20px] font-semibold text-[#171717] mb-4">Recent Conversations</h3>
        <div className="rounded-lg overflow-hidden mb-10" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          <table className="w-full text-[14px]">
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #f4f4f5" }}>
                {["Time", "User", "Intent", "CSAT", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { time: "2m ago",  user: "User #8821", intent: "Ticket purchase", csat: 5,    resolved: true },
                { time: "5m ago",  user: "User #4420", intent: "Refund request",  csat: 4,    resolved: true },
                { time: "12m ago", user: "User #2231", intent: "Seat change",     csat: null, resolved: false },
                { time: "18m ago", user: "User #9001", intent: "Match schedule",  csat: 5,    resolved: true },
                { time: "24m ago", user: "User #5542", intent: "Membership info", csat: 3,    resolved: false },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#fafafa] cursor-pointer transition-colors" style={{ borderTop: "1px solid #f4f4f5" }}>
                  <td className="px-4 py-3 text-[13px] text-[#a1a1aa]">{row.time}</td>
                  <td className="px-4 py-3 font-medium text-[#171717]">{row.user}</td>
                  <td className="px-4 py-3 text-[#666666]">{row.intent}</td>
                  <td className="px-4 py-3">
                    {row.csat !== null ? (
                      <span className="text-[13px] font-medium" style={{ color: row.csat >= 4 ? "#15803d" : "#d97706" }}>
                        {"★".repeat(row.csat)}{"☆".repeat(5 - row.csat)}
                      </span>
                    ) : <span className="text-[13px] text-[#d4d4d8]">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: row.resolved ? "#f0fdf4" : "#fff7ed", color: row.resolved ? "#15803d" : "#c2410c" }}>
                      {row.resolved ? "Resolved" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Block F: Deployment History */}
        <h3 className="text-[20px] font-semibold text-[#171717] mb-4">Deployment History</h3>
        <div className="rounded-lg overflow-hidden mb-10" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          {deployHistory.map((h, i) => (
            <div key={i} className="flex items-start gap-4 px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: i === 0 ? "#16a34a" : "#d4d4d8" }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#171717]">{formatVersion(h.version)}</span>
                  {i === 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase" style={{ background: "#f0fdf4", color: "#15803d" }}>current</span>}
                  {h.isRollback && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase" style={{ background: "#fff7ed", color: "#c2410c" }}>rollback</span>}
                </div>
                <p className="text-[12px] text-[#888888] mt-0.5">{h.note}</p>
                <p className="text-[11px] text-[#a1a1aa] mt-0.5">{h.date} · {h.by}</p>
              </div>
              {i > 0 && <button className="text-[12px] font-medium text-[#666666] hover:text-[#171717] transition-colors shrink-0 mt-1">Rollback</button>}
            </div>
          ))}
        </div>

        {/* Block G: 빠른 이동 */}
        <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid #f4f4f5" }}>
          <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#6366f1] hover:underline">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M3.5 8.5l1.5-3 1.5 3M4 7h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
            Deep dive in Evaluate →
          </button>
          <span className="text-[#e4e4e7]">·</span>
          <button className="text-[13px] font-medium text-[#666666] hover:text-[#171717] transition-colors">View full deployment history →</button>
        </div>
      </div>
    );
  }

  if (env === "staging") {
    const stagingHistory = buildStagingHistory(instance);
    const readinessChecks = [
      { label: "QA 테스트 통과율 90% 이상",  status: "passed"  as const },
      { label: "검증 세트 모든 인텐트 커버",  status: "passed"  as const },
      { label: "승인자 리뷰 대기 중 (Deco)", status: "warning" as const },
      { label: "Load test 미실행",             status: "failed"  as const },
    ];
    const checkMeta = (s: "passed" | "warning" | "failed") =>
      s === "passed"  ? { icon: "✓", color: "#15803d" } :
      s === "warning" ? { icon: "⚠", color: "#d97706" } :
                        { icon: "✗", color: "#dc2626" };
    const canPromote = readinessChecks.every((c) => c.status !== "failed");

    return (
      <div>
        {/* Block B: 알림 — 최상단 */}
        <AlertSection />

        {/* Block A: Version Information */}
        <div className="mb-10">
          <p className="text-[20px] font-semibold text-[#171717] mb-4">Version Information</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-[#a1a1aa] w-28 shrink-0">Version</span>
              <span className="text-[#171717]">{instance?.version ? formatVersion(instance.version) : "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-[#a1a1aa] w-28 shrink-0">Deployed by</span>
              <span className="text-[#171717]">{instance?.deployedBy ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-[#a1a1aa] w-28 shrink-0">Deployed</span>
              <span className="text-[#171717]">{timeAgo(instance?.deployedAt ?? "")}</span>
            </div>
            {instance?.versionNote && (
              <div className="flex items-start gap-2 text-[14px]">
                <span className="text-[#a1a1aa] w-28 shrink-0">Note</span>
                <span className="text-[#171717]">{instance.versionNote}</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Time in Staging", value: "2d 4h" },
            { label: "Test Cases Run",  value: "28 / 35" },
            { label: "Pass Rate",       value: "93%" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl px-4 py-4" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
              <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-2">{card.label}</p>
              <p className="text-[24px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.4px" }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Block C: 이번 버전에 반영된 변경 요약 */}
        <h3 className="text-[20px] font-semibold text-[#171717] mb-4">Changes in This Version</h3>
        <div className="rounded-xl overflow-hidden mb-10" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          {[
            { area: "Knowledgebase", detail: "2026 Pricing FAQ 추가" },
            { area: "Instructions",  detail: "공손한 어투 규칙 추가" },
            { area: "Safeguards",    detail: "PII 필터 강화" },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#f97316" }} />
              <span className="text-[13px] font-medium text-[#171717]">{c.area}</span>
              <span className="text-[13px] text-[#888888]">— {c.detail}</span>
            </div>
          ))}
        </div>

        {/* Block E: Promote 준비도 체크리스트 */}
        <h3 className="text-[20px] font-semibold text-[#171717] mb-4">Promote to Production — Readiness</h3>
        <div className="rounded-xl overflow-hidden mb-5" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          {readinessChecks.map((check, i) => {
            const meta = checkMeta(check.status);
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
                <span className="text-[16px] font-bold w-5 text-center shrink-0" style={{ color: meta.color }}>{meta.icon}</span>
                <span className="text-[13px] text-[#171717]">{check.label}</span>
              </div>
            );
          })}
        </div>

        {/* Block D: Verification History */}
        <h3 className="text-[20px] font-semibold text-[#171717] mb-4">Verification History</h3>
        <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          {stagingHistory.map((h, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <div className="flex items-center gap-2 w-16 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: i === 0 ? "#f97316" : "#d4d4d8" }} />
                <span className="text-[13px] font-semibold text-[#171717]">{formatVersion(h.version)}</span>
              </div>
              <span className="text-[12px] font-medium" style={{ color: h.passed / h.total >= 0.9 ? "#15803d" : "#d97706" }}>
                {h.passed}/{h.total} passed
              </span>
              <span className="text-[12px] text-[#666666] flex-1">{h.date} · {h.by}</span>
              {h.promotedToProd
                ? <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: "#f0fdf4", color: "#15803d" }}>Promoted</span>
                : <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: "#f4f4f5", color: "#888888" }}>Not promoted</span>
              }
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Development
  const changesAheadOfProd = [
    { area: "Instructions",  detail: "공손한 어투 규칙 추가 (3 edits)" },
    { area: "Knowledgebase", detail: "2026 Pricing FAQ 추가" },
    { area: "Safeguards",    detail: "PII 필터 강화" },
    { area: "Actionbook",    detail: "환불 처리 단계 개선" },
    { area: "Model",         detail: "GPT-4 → GPT-4 Turbo" },
  ];

  return (
    <div>
      {/* Block E: 알림 — 최상단 */}
      <AlertSection />

      {/* Block A: Version Information */}
      <div className="mb-10">
        <p className="text-[20px] font-semibold text-[#171717] mb-4">Version Information</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[14px]">
            <span className="text-[#a1a1aa] w-28 shrink-0">Version</span>
            <span className="text-[#171717]">{instance?.version ? formatVersion(instance.version) : "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-[14px]">
            <span className="text-[#a1a1aa] w-28 shrink-0">Last edited</span>
            <span className="text-[#171717]">{timeAgo(agent.lastEditedAt)} by {agent.lastEditedBy ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-[14px]">
            <span className="text-[#a1a1aa] w-28 shrink-0">Changes</span>
            <span className="font-medium" style={{ color: "#a16207" }}>{changesAheadOfProd.length} ahead of Production</span>
          </div>
          {instance?.versionNote && (
            <div className="flex items-start gap-2 text-[14px]">
              <span className="text-[#a1a1aa] w-28 shrink-0">Note</span>
              <span className="text-[#171717]">{instance.versionNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Block B: 변경 요약 (Prod 대비 Diff) */}
      <h3 className="text-[20px] font-semibold text-[#171717] mb-4">Changes vs Production</h3>
      <div className="rounded-lg overflow-hidden mb-10" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
        {changesAheadOfProd.map((c, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#eab308" }} />
            <span className="text-[13px] font-medium text-[#171717] w-28 shrink-0">{c.area}</span>
            <span className="text-[13px] text-[#888888] flex-1">{c.detail}</span>
            <button className="flex items-center gap-1 text-[12px] text-[#6366f1] hover:underline shrink-0">
              View diff
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Block C: Test 세션 요약 */}
      <h3 className="text-[20px] font-semibold text-[#171717] mb-4">Test Sessions</h3>
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Today's Sessions", value: "12",    warn: false },
          { label: "Avg Confidence",   value: "89%",   warn: false },
          { label: "Last Run",         value: "18h ago", warn: true },
        ].map((card) => (
          <div key={card.label} className="rounded-xl px-4 py-4" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
            <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-2">{card.label}</p>
            <p className="text-[24px] font-semibold" style={{ letterSpacing: "-0.4px", color: card.warn ? "#d97706" : "#171717" }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Block D: Edit History */}
      <h3 className="text-[20px] font-semibold text-[#171717] mb-4">Edit History</h3>
      <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
        {DEV_EDIT_HISTORY.map((h, i) => {
          const typeColor = h.type === "promote" ? "#f97316" : h.type === "save" ? "#6366f1" : "#a1a1aa";
          return (
            <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mb-1" style={{ background: typeColor + "18", color: typeColor }}>{h.type}</span>
                <p className="text-[14px] font-medium text-[#171717]">{h.event}</p>
                {h.areas && <p className="text-[12px] text-[#a1a1aa]">{h.areas.join(" · ")}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0 self-center">
                <span className="text-[14px] text-[#a1a1aa]">{h.when}</span>
                <span className="text-[#d4d4d8]">·</span>
                <span className="text-[14px] text-[#a1a1aa]">{h.who}</span>
              </div>
            </div>
          );
        })}
        <div className="px-4 py-2.5" style={{ borderTop: "1px solid #f4f4f5" }}>
          <button className="text-[12px] font-medium text-[#666666] hover:text-[#171717] transition-colors">View all →</button>
        </div>
      </div>
    </div>
  );
}

// ── Build Tab ────────────────────────────────────────────────────────────────

const BUILD_CONTENT: Record<EnvType, { systemPrompt: string; welcome: string; kb: { name: string; type: string; icon: string; size: string }[]; model: string; temp: number }> = {
  development: {
    systemPrompt: `You are a helpful customer support assistant for FC Barcelona. You assist fans with questions about tickets, matches, merchandise, and club information.\n\nAlways maintain a professional and friendly tone. When you are unsure about something, be honest and direct the user to the appropriate resource.\n\nKey guidelines:\n- Be concise and clear in your responses\n- Always verify ticket availability before confirming purchases\n- Escalate complex complaints to a human agent\n- Use a polite tone at all times (added in this version)`,
    welcome: "Hello! I'm the FC Barcelona support assistant. How can I help you today? 👋",
    kb: [
      { name: "Product FAQ 2026",       type: "shared", icon: "📄", size: "128 pages" },
      { name: "Help Center Docs",        type: "shared", icon: "🌐", size: "Web" },
      { name: "Ticket Policy Internal",  type: "agent",  icon: "📋", size: "24 pages" },
      { name: "2026 Pricing FAQ (draft)",type: "agent",  icon: "📝", size: "8 pages" },
    ],
    model: "GPT-4 Turbo", temp: 0.7,
  },
  staging: {
    systemPrompt: `You are a helpful customer support assistant for FC Barcelona. You assist fans with questions about tickets, matches, merchandise, and club information.\n\nAlways maintain a professional and friendly tone. When you are unsure about something, be honest and direct the user to the appropriate resource.\n\nKey guidelines:\n- Be concise and clear in your responses\n- Always verify ticket availability before confirming purchases\n- Escalate complex complaints to a human agent`,
    welcome: "Hello! I'm the FC Barcelona support assistant. How can I help you today? 👋",
    kb: [
      { name: "Product FAQ 2026",      type: "shared", icon: "📄", size: "128 pages" },
      { name: "Help Center Docs",       type: "shared", icon: "🌐", size: "Web" },
      { name: "Ticket Policy Internal", type: "agent",  icon: "📋", size: "24 pages" },
    ],
    model: "GPT-4 Turbo", temp: 0.7,
  },
  production: {
    systemPrompt: `You are a helpful customer support assistant for FC Barcelona. You assist fans with questions about tickets, matches, merchandise, and club information.\n\nBe concise and direct. When you are unsure about something, direct the user to the appropriate resource.\n\nKey guidelines:\n- Always verify ticket availability before confirming purchases\n- Escalate complex complaints to a human agent`,
    welcome: "Hi! How can I help you?",
    kb: [
      { name: "Product FAQ 2025",      type: "shared", icon: "📄", size: "112 pages" },
      { name: "Help Center Docs",       type: "shared", icon: "🌐", size: "Web" },
      { name: "Ticket Policy Internal", type: "agent",  icon: "📋", size: "20 pages" },
    ],
    model: "GPT-4", temp: 0.5,
  },
};

const MODEL_OPTIONS = [
  { id: "gpt-4-turbo",       label: "GPT-4 Turbo",       provider: "OpenAI",    desc: "Most capable GPT-4 model, optimized for speed and cost." },
  { id: "gpt-4",             label: "GPT-4",              provider: "OpenAI",    desc: "High-intelligence model for complex tasks." },
  { id: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet",  provider: "Anthropic", desc: "Best balance of intelligence and speed from Anthropic." },
  { id: "claude-3-haiku",    label: "Claude 3 Haiku",     provider: "Anthropic", desc: "Fastest and most compact model for near-instant responsiveness." },
];

function BuildEditor({ section, isReadOnly, env }: { section: BuildSection; isReadOnly: boolean; env: EnvType }) {
  const content = BUILD_CONTENT[env];
  const [systemPrompt, setSystemPrompt] = useState(content.systemPrompt);
  const [welcome, setWelcome] = useState(content.welcome);
  const defaultModel = MODEL_OPTIONS.find((m) => m.label === content.model)?.id ?? MODEL_OPTIONS[0].id;
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [temp, setTemp] = useState(content.temp);

  const inputStyle = {
    boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px",
    background: isReadOnly ? "#fafafa" : "#ffffff",
  };

  function handleFocus(e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) {
    if (!isReadOnly) e.currentTarget.style.boxShadow = "rgba(0,0,0,0.12) 0px 0px 0px 1px, rgba(59,130,246,0.2) 0px 0px 0px 3px";
  }
  function handleBlur(e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) {
    e.currentTarget.style.boxShadow = "rgba(0,0,0,0.08) 0px 0px 0px 1px";
  }

  if (section === "instructions") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-[14px] font-medium text-[#4d4d4d] mb-3">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            disabled={isReadOnly}
            className="w-full px-3 py-2.5 text-[14px] text-[#171717] rounded-lg outline-none resize-y transition-shadow"
            style={{ ...inputStyle, fontFamily: "inherit", minHeight: "320px" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <p className="text-[11px] text-[#a1a1aa] mt-1">Define the agent's role, behavior, and core constraints.</p>
        </div>
        <div>
          <label className="block text-[14px] font-medium text-[#4d4d4d] mb-3">Welcome Message</label>
          <input
            type="text"
            value={welcome}
            onChange={(e) => setWelcome(e.target.value)}
            disabled={isReadOnly}
            className="w-full px-3 py-2.5 text-[14px] text-[#171717] rounded-lg outline-none transition-shadow"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <p className="text-[11px] text-[#a1a1aa] mt-1">First message shown to users when they open a conversation.</p>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-2 pt-2">
            <button className="px-4 py-2 rounded-md text-[14px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors">Discard</button>
            <button className="px-4 py-2 rounded-md text-[14px] font-medium text-white hover:opacity-85 transition-opacity" style={{ background: "#171717" }}>Save to Dev</button>
          </div>
        )}
      </div>
    );
  }

  if (section === "knowledgebase") {
    const sources = content.kb;
    return (
      <div>
        <div className="rounded-lg overflow-hidden mb-4" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          {sources.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{s.icon}</span>
                <div>
                  <p className="text-[14px] font-medium text-[#171717]">{s.name}</p>
                  <p className="text-[12px] text-[#a1a1aa]">{s.type === "shared" ? "Workspace shared" : "Agent only"} · {s.size}</p>
                </div>
              </div>
              {!isReadOnly && (
                <button className="text-[13px] text-[#dc2626] hover:bg-[#fee2e2] px-2 py-1 rounded transition-colors">Remove</button>
              )}
            </div>
          ))}
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>+ From Workspace</button>
            <button className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>+ New document</button>
          </div>
        )}
      </div>
    );
  }

  if (section === "safeguards") {
    const rules = [
      { label: "Block PII sharing",    desc: "Prevent sharing personal information in responses",           on: true },
      { label: "Content filter",       desc: "Block inappropriate or harmful content",                       on: true },
      { label: "Topic restriction",    desc: "Restrict to football and club-related topics only",           on: false },
      { label: "Escalation trigger",   desc: "Auto-escalate when confidence score is below 0.6",            on: true },
    ];
    return (
      <div className="flex flex-col gap-3">
        {rules.map((rule, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
            <div>
              <p className="text-[14px] font-medium text-[#171717]">{rule.label}</p>
              <p className="text-[12px] text-[#888888] mt-0.5">{rule.desc}</p>
            </div>
            <div
              className="relative w-9 h-5 rounded-full transition-colors shrink-0 ml-4"
              style={{ background: rule.on ? "#171717" : "#e4e4e7", cursor: isReadOnly ? "default" : "pointer" }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: rule.on ? "translateX(18px)" : "translateX(2px)" }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (section === "model") {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-[14px] font-medium text-[#4d4d4d] mb-2">Model</label>
          <div className="grid grid-cols-2 gap-2">
            {MODEL_OPTIONS.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  disabled={isReadOnly}
                  onClick={() => !isReadOnly && setSelectedModel(m.id)}
                  className="text-left px-4 py-3 rounded-lg transition-all"
                  style={{
                    boxShadow: isSelected ? "0 0 0 1.5px #171717" : "rgba(0,0,0,0.08) 0px 0px 0px 1px",
                    background: isReadOnly ? "#fafafa" : "#ffffff",
                    cursor: isReadOnly ? "default" : "pointer",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-medium text-[#171717]">{m.label}</p>
                      <p className="text-[12px] text-[#a1a1aa] mt-0.5">{m.provider}</p>
                      <p className="text-[12px] text-[#a1a1aa] mt-1 leading-relaxed">{m.desc}</p>
                    </div>
                    <span
                      className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5"
                      style={{ borderColor: isSelected ? "#171717" : "#d4d4d8" }}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full" style={{ background: "#171717" }} />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-[14px] font-medium text-[#4d4d4d] mb-3">
            Temperature <span className="font-normal text-[#a1a1aa]">{temp}</span>
          </label>
          <input type="range" min="0" max="1" step="0.1" value={temp} disabled={isReadOnly} onChange={(e) => setTemp(parseFloat(e.target.value))} className="w-full accent-[#171717]" />
          <div className="flex justify-between text-[11px] text-[#a1a1aa] mt-1"><span>Precise</span><span>Creative</span></div>
        </div>
        <div>
          <label className="block text-[14px] font-medium text-[#4d4d4d] mb-3">Max Tokens</label>
          <input
            type="number"
            defaultValue={2048}
            disabled={isReadOnly}
            className="w-full px-3 py-2.5 text-[14px] rounded-lg outline-none"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px", background: isReadOnly ? "#fafafa" : "#ffffff" }}
          />
        </div>
        {!isReadOnly && (
          <div className="flex gap-2 pt-2">
            <button className="px-4 py-2 rounded-md text-[14px] font-medium text-white hover:opacity-85" style={{ background: "#171717" }}>Save to Dev</button>
          </div>
        )}
      </div>
    );
  }

  const genericContent: Partial<Record<BuildSection, { items: string[]; noun: string }>> = {
    actionbooks: { items: ["Ticket Purchase Flow", "Refund Request Handler", "Seat Upgrade Process"], noun: "Actionbook" },
    tools:       { items: ["Ticket Lookup API", "CRM Integration", "Payment Gateway"],               noun: "Tool" },
    channels:    { items: ["Web Chat", "Mobile App"],                                                 noun: "Channel" },
  };
  const gen = genericContent[section];
  if (!gen) return null;

  return (
    <div>
      <div className="rounded-lg overflow-hidden mb-4" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
        {gen.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
            <p className="text-[14px] font-medium text-[#171717]">{item}</p>
            {!isReadOnly && (
              <div className="flex gap-2">
                <button className="text-[13px] text-[#666666] hover:bg-[#f4f4f5] px-2 py-1 rounded transition-colors">Edit</button>
                <button className="text-[13px] text-[#dc2626] hover:bg-[#fee2e2] px-2 py-1 rounded transition-colors">Remove</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {!isReadOnly && (
        <button className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          + Add {gen.noun}
        </button>
      )}
    </div>
  );
}

function BuildTab({ agent, env }: { agent: Agent; env: EnvType }) {
  const [section, setSection] = useState<BuildSection>("instructions");
  const isReadOnly = env !== "development";

  const envBanner = {
    staging: { bg: "#fff7ed", ring: "rgba(249,115,22,0.2)", text: "#c2410c", label: "Staging build", sub: "Config frozen at the version promoted to Staging. Edit in Development." },
    production: { bg: "#f0fdf4", ring: "rgba(22,163,74,0.2)", text: "#15803d", label: "Production build", sub: "Config frozen at the version live in Production. Edit in Development." },
  } as const;

  return (
    <div>
      {isReadOnly && env in envBanner && (() => {
        const b = envBanner[env as keyof typeof envBanner];
        return (
          <div className="mb-6 flex items-center justify-between p-4 rounded-lg" style={{ background: b.bg, boxShadow: `${b.ring} 0px 0px 0px 1px` }}>
            <div>
              <p className="text-[13px] font-semibold mb-0.5" style={{ color: b.text }}>{b.label}</p>
              <p className="text-[13px]" style={{ color: b.text }}>{b.sub}</p>
            </div>
            <button className="text-[13px] font-medium text-[#171717] hover:underline shrink-0 ml-4">Go to Development →</button>
          </div>
        );
      })()}
      <div className="flex items-center gap-1 mb-6 border-b border-[#f0f0f0]">
        {BUILD_SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className="px-3 py-2 text-[14px] font-medium transition-colors relative"
            style={{ color: section === s.key ? "#171717" : "#888888" }}
          >
            {s.label}
            {section === s.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: "#171717" }} />
            )}
          </button>
        ))}
      </div>
      <div>
        <BuildEditor section={section} isReadOnly={isReadOnly} env={env} />
      </div>
    </div>
  );
}

// ── Test Tab ─────────────────────────────────────────────────────────────────

function TestTab({ agent, env }: { agent: Agent; env: EnvType }) {
  const [selectedMsg, setSelectedMsg] = useState<number | null>(1);
  const [input, setInput] = useState("");

  if (env === "staging") {
    const testSets = [
      { name: "Ticket purchase scenarios", count: 12, passed: 12, failed: 0 },
      { name: "Refund request scenarios",  count: 8,  passed: 6,  failed: 2 },
      { name: "Shipping inquiry scenarios",count: 15, passed: 14, failed: 1 },
      { name: "Membership scenarios",      count: 10, passed: 10, failed: 0 },
    ];
    return (
      <>
      <div>
        <div className="rounded-lg overflow-hidden mb-4" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "#fafafa", borderBottom: "1px solid #f4f4f5" }}>
            <span className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide">Test Suites</span>
            <button className="px-3 py-1.5 rounded-md text-[13px] font-medium text-white hover:opacity-85" style={{ background: "#171717" }}>▶ Run All</button>
          </div>
          {testSets.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <div className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="accent-[#171717]" />
                <div>
                  <p className="text-[14px] font-medium text-[#171717]">{s.name}</p>
                  <p className="text-[12px] text-[#a1a1aa]">{s.count} test cases</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[13px] font-medium">
                <span style={{ color: "#15803d" }}>{s.passed} passed</span>
                {s.failed > 0 && <span style={{ color: "#dc2626" }}>{s.failed} failed</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: "#f0fdf4", boxShadow: "rgba(22,163,74,0.2) 0px 0px 0px 1px" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8L6 12L14 4" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[14px] font-medium text-[#15803d]">42 / 45 test cases passed (93%)</span>
          <button className="text-[13px] text-[#15803d] hover:underline ml-auto">View failures →</button>
        </div>
      </div>
      <div className="flex items-center mt-4">
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-[14px] font-medium text-white hover:opacity-85 transition-opacity"
          style={{ background: "#171717" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Promote to Production
        </button>
      </div>
    </>
    );
  }

  if (env === "production") {
    const replayLogs = [
      { id: "#8821", intent: "Ticket purchase", result: "pass", latency: "1.1s", note: "" },
      { id: "#4420", intent: "Refund request",  result: "pass", latency: "1.4s", note: "" },
      { id: "#2231", intent: "Seat change",     result: "fail", latency: "2.3s", note: "Low confidence (0.48)" },
      { id: "#9001", intent: "Match schedule",  result: "pass", latency: "0.9s", note: "" },
      { id: "#5542", intent: "Membership info", result: "pass", latency: "1.2s", note: "" },
    ];
    return (
      <div>
        <div className="rounded-lg p-4 mb-6" style={{ background: "#fafafa", boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
          <p className="text-[13px] font-semibold text-[#171717] mb-0.5">Shadow Replay</p>
          <p className="text-[13px] text-[#888888]">Replays recent production conversations through the current config. Results are read-only and do not affect live users.</p>
        </div>
        <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "#fafafa", borderBottom: "1px solid #f4f4f5" }}>
            <span className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide">Replay Log — last 5 conversations</span>
            <button className="px-3 py-1.5 rounded-md text-[12px] font-medium text-[#666666] hover:bg-white transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>▶ Run Replay</button>
          </div>
          {replayLogs.map((row, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 gap-4" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <span className="text-[13px] text-[#a1a1aa] w-14 shrink-0">{row.id}</span>
              <span className="text-[13px] text-[#171717] flex-1">{row.intent}</span>
              {row.note && <span className="text-[11px] text-[#d97706]">{row.note}</span>}
              <span className="text-[12px] text-[#a1a1aa] shrink-0">{row.latency}</span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: row.result === "pass" ? "#f0fdf4" : "#fff1f2", color: row.result === "pass" ? "#15803d" : "#dc2626" }}
              >
                {row.result}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex gap-10" style={{ height: "640px" }}>
      {/* Chat */}
      <div className="flex-1 flex flex-col rounded-xl overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {MOCK_CHAT.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "agent" ? (
                <div className="max-w-[80%]">
                  <div
                    className="px-4 py-3 rounded-xl text-[14px] leading-relaxed text-[#171717] cursor-pointer transition-all"
                    style={{
                      background: selectedMsg === i ? "#f0f9ff" : "#f4f4f5",
                      boxShadow: selectedMsg === i ? "rgba(59,130,246,0.3) 0px 0px 0px 1.5px" : "none",
                      whiteSpace: "pre-line",
                    }}
                    onClick={() => setSelectedMsg(selectedMsg === i ? null : i)}
                  >
                    {msg.text}
                  </div>
                  <button
                    onClick={() => setSelectedMsg(selectedMsg === i ? null : i)}
                    className="mt-1 text-[14px] text-[#a1a1aa] hover:text-[#666666] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
                      <path d="M5 3v2l1.5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                    Explain response
                  </button>
                </div>
              ) : (
                <div className="max-w-[80%] px-4 py-3 rounded-xl text-[14px] text-white leading-relaxed" style={{ background: "#171717" }}>
                  {msg.text}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="px-4 py-3" style={{ borderTop: "1px solid #f4f4f5" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message to test..."
              className="flex-1 text-[14px] outline-none bg-transparent"
            />
            <button className="px-3 py-1 rounded-md text-[13px] font-medium text-white hover:opacity-85" style={{ background: "#171717" }}>Send</button>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <div className="w-60 shrink-0 flex flex-col gap-8">
        {selectedMsg !== null && MOCK_CHAT[selectedMsg]?.sources ? (
          <>
            <div>
              <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-3">Response Details</p>
              <div className="flex flex-col gap-2 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-[#888888]">Response time</span>
                  <span className="font-medium text-[#171717]">{MOCK_CHAT[selectedMsg].sources!.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Tokens used</span>
                  <span className="font-medium text-[#171717]">{MOCK_CHAT[selectedMsg].sources!.tokens}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-3">Sources Used</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[14px]">
                  <span>📄</span>
                  <span className="text-[#171717]">{MOCK_CHAT[selectedMsg].sources!.kb}</span>
                </div>
                <div className="flex items-center gap-2 text-[14px]">
                  <span>🔧</span>
                  <code className="text-[12px] text-[#666666] bg-[#f4f4f5] px-1.5 py-0.5 rounded">{MOCK_CHAT[selectedMsg].sources!.tool}</code>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-2">Grounding</p>
              <div className="flex items-center gap-1.5 text-[12px] text-[#15803d]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Grounded in sources
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-[13px] text-[#a1a1aa]">Click an agent response to see details</p>
          </div>
        )}
      </div>
    </div>
    {env === "development" && (
      <div className="flex items-center mt-4">
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-[14px] font-medium text-white hover:opacity-85 transition-opacity"
          style={{ background: "#171717" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Promote to {env === "development" ? "Staging" : "Production"}
        </button>
      </div>
    )}
    </>
  );
}

// ── Evaluate Tab ─────────────────────────────────────────────────────────────

function EvaluateTab({ agent, env }: { agent: Agent; env: EnvType }) {
  if (env === "development") {
    const simRows = [
      { session: "Sim #047", intent: "Ticket purchase", turns: 4, confidence: 0.96, passed: true },
      { session: "Sim #046", intent: "Refund request",  turns: 6, confidence: 0.81, passed: true },
      { session: "Sim #045", intent: "Seat upgrade",    turns: 3, confidence: 0.54, passed: false },
      { session: "Sim #044", intent: "Match schedule",  turns: 2, confidence: 0.99, passed: true },
      { session: "Sim #043", intent: "Membership info", turns: 5, confidence: 0.72, passed: true },
    ];
    return (
      <div>
        <div className="grid grid-cols-3 gap-4 mb-3">
          {[
            { label: "Simulations Run", value: "47" },
            { label: "Avg Confidence",  value: "89%" },
            { label: "Low Confidence",  value: "6" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl px-4 py-4" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
              <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-2">{card.label}</p>
              <p className="text-[24px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.4px" }}>{card.value}</p>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-[#888888] mb-5">Simulation-based evaluation. Results reflect runs against this development version only — not real user traffic.</p>
        <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          <div className="px-4 py-2.5" style={{ background: "#fafafa", borderBottom: "1px solid #f4f4f5" }}>
            <span className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide">Recent Simulations</span>
          </div>
          {simRows.map((row, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <span className="text-[12px] text-[#a1a1aa] w-16 shrink-0">{row.session}</span>
              <span className="text-[13px] text-[#171717] flex-1">{row.intent}</span>
              <span className="text-[12px] text-[#a1a1aa]">{row.turns} turns</span>
              <span className="text-[13px] font-medium w-10 text-right" style={{ color: row.confidence >= 0.8 ? "#15803d" : row.confidence >= 0.6 ? "#d97706" : "#dc2626" }}>
                {Math.round(row.confidence * 100)}%
              </span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: row.passed ? "#f0fdf4" : "#fff1f2", color: row.passed ? "#15803d" : "#dc2626" }}
              >
                {row.passed ? "pass" : "fail"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (env === "staging") {
    const intentRows = [
      { intent: "Ticket purchase", total: 12, pass: 12, fail: 0,  avgConf: 0.95 },
      { intent: "Refund request",  total: 8,  pass: 6,  fail: 2,  avgConf: 0.71 },
      { intent: "Seat upgrade",    total: 10, pass: 9,  fail: 1,  avgConf: 0.84 },
      { intent: "Match schedule",  total: 8,  pass: 8,  fail: 0,  avgConf: 0.98 },
      { intent: "Membership info", total: 7,  pass: 7,  fail: 0,  avgConf: 0.91 },
    ];
    return (
      <div>
        <div className="grid grid-cols-3 gap-4 mb-3">
          {[
            { label: "Test Cases Run", value: "45" },
            { label: "Pass Rate",      value: "93%" },
            { label: "Failed",         value: "3", warn: true },
          ].map((card) => (
            <div key={card.label} className="rounded-xl px-4 py-4" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
              <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-2">{card.label}</p>
              <p className="text-[24px] font-semibold leading-none" style={{ letterSpacing: "-0.4px", color: card.warn ? "#dc2626" : "#171717" }}>{card.value}</p>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-[#888888] mb-5">QA evaluation based on Staging test suite runs. Reflects the version currently deployed in Staging.</p>
        <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          <div className="px-4 py-2.5" style={{ background: "#fafafa", borderBottom: "1px solid #f4f4f5" }}>
            <span className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide">Results by Intent</span>
          </div>
          {intentRows.map((row, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <span className="text-[13px] text-[#171717] flex-1">{row.intent}</span>
              <span className="text-[12px] text-[#a1a1aa]">{row.total} cases</span>
              <span className="text-[13px] font-medium" style={{ color: "#15803d" }}>{row.pass} pass</span>
              {row.fail > 0 && <span className="text-[13px] font-medium" style={{ color: "#dc2626" }}>{row.fail} fail</span>}
              <span className="text-[13px] font-medium w-10 text-right" style={{ color: row.avgConf >= 0.85 ? "#15803d" : row.avgConf >= 0.7 ? "#d97706" : "#dc2626" }}>
                {Math.round(row.avgConf * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const lowConf = MOCK_CONVERSATIONS.filter((c) => c.confidence < 0.6).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {[
          { label: "Last 7 days", active: true },
          { label: "Low confidence only", active: false },
          { label: "Escalated", active: false },
        ].map((f) => (
          <button
            key={f.label}
            className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors"
            style={{
              background: f.active ? "#171717" : "#ffffff",
              color: f.active ? "#ffffff" : "#666666",
              boxShadow: f.active ? "none" : "rgba(0,0,0,0.08) 0px 0px 0px 1px",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Resolution Rate",   value: "87%",       change: "+2% vs last week", pos: true },
          { label: "Escalation Rate",   value: "13%",       change: "-2% vs last week", pos: true },
          { label: "Avg Confidence",    value: "84%",       change: "+1% vs last week", pos: true },
          { label: "Low Confidence",    value: String(lowConf), change: `${lowConf} flagged`, pos: false },
        ].map((card) => (
          <div key={card.label} className="rounded-xl px-5 py-4" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
            <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-3">{card.label}</p>
            <div className="flex items-end gap-2">
              <p className="text-[28px] font-semibold text-[#171717] leading-none" style={{ letterSpacing: "-0.5px" }}>{card.value}</p>
              <p className="text-[12px] mb-0.5 ml-auto" style={{ color: card.pos ? "#15803d" : "#d97706" }}>{card.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
        <table className="w-full text-[14px]">
          <thead>
            <tr style={{ background: "#fafafa", borderBottom: "1px solid #f4f4f5" }}>
              {["Time", "User", "Intent", "Confidence", "CSAT", "Status"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_CONVERSATIONS.map((row, i) => (
              <tr key={i} className="hover:bg-[#fafafa] cursor-pointer transition-colors" style={{ borderTop: "1px solid #f4f4f5" }}>
                <td className="px-4 py-3 text-[13px] text-[#a1a1aa]">{row.time}</td>
                <td className="px-4 py-3 font-medium text-[#171717]">{row.user}</td>
                <td className="px-4 py-3 text-[#666666]">{row.intent}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {row.confidence < 0.6 && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1L11 10H1L6 1Z" stroke="#f59e0b" strokeWidth="1.1" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span className="text-[13px] font-medium" style={{ color: row.confidence >= 0.8 ? "#15803d" : row.confidence >= 0.6 ? "#d97706" : "#dc2626" }}>
                      {Math.round(row.confidence * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px]" style={{ color: row.csat >= 4 ? "#15803d" : row.csat >= 3 ? "#d97706" : "#dc2626" }}>
                    {"★".repeat(row.csat)}{"☆".repeat(5 - row.csat)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: row.status === "resolved" ? "#f0fdf4" : "#fef9f9",
                      color: row.status === "resolved" ? "#15803d" : "#dc2626",
                    }}
                  >
                    {row.status === "resolved" ? "Resolved" : "Escalated"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface AgentHomeProps {
  agent: Agent;
  orgSlug: string;
  orgName: string;
  wsSlug: string;
  wsName: string;
}

export default function AgentHome({ agent, orgSlug, orgName, wsSlug, wsName }: AgentHomeProps) {
  const prod    = getEnvInstance(agent, "production");
  const staging = getEnvInstance(agent, "staging");

  const initEnv: EnvType = prod ? "production" : staging ? "staging" : "development";
  const DEFAULT_TAB: Record<EnvType, TabType> = { development: "build", staging: "test", production: "overview" };

  const [selectedEnv, setSelectedEnv] = useState<EnvType>(initEnv);
  const [selectedTab, setSelectedTab] = useState<TabType>(DEFAULT_TAB[initEnv]);
  const [showPromote, setShowPromote] = useState(false);
  const [hoveredEnv, setHoveredEnv] = useState<EnvType | null>(null);

  useEffect(() => {
    const env: EnvType = prod ? "production" : staging ? "staging" : "development";
    setSelectedEnv(env);
    setSelectedTab(DEFAULT_TAB[env]);
    setShowPromote(false);
  }, [agent.id]);

  const selectedInstance = getEnvInstance(agent, selectedEnv);
  const canPromote = selectedEnv !== "production";
  const promoteTarget: "staging" | "production" = selectedEnv === "development" ? "staging" : "production";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      {/* Breadcrumb row — same height as sidebar logo row (h-12) */}
      <div className="px-8 h-12 flex items-center gap-1.5 text-[12px] shrink-0" style={{ borderBottom: "1px solid #f4f4f5" }}>
        <Link href={`/org/${orgSlug}`} className="text-[#a1a1aa] hover:text-[#555555] transition-colors">
          {orgName}
        </Link>
        <span className="text-[#d4d4d8] select-none">/</span>
        <Link href={`/org/${orgSlug}/ws/${wsSlug}`} className="text-[#a1a1aa] hover:text-[#555555] transition-colors">
          {wsName}
        </Link>
        <span className="text-[#d4d4d8] select-none">/</span>
        <span className="text-[#171717] font-medium">{agent.name}</span>
      </div>

      {/* ── Body: left pipeline + right content ── */}
      <div className="flex flex-1 bg-white">

        {/* ── Left: Pipeline ── */}
        <div className="shrink-0 px-8 py-6 flex flex-col gap-3" style={{ width: "340px", borderRight: "1px solid #f4f4f5" }}>

          <p className="text-[16px] font-semibold text-[#171717] tracking-wide mb-2 px-1">{agent.name} Pipeline</p>

          {(["development", "staging", "production"] as EnvType[]).map((env) => {
            const instance = getEnvInstance(agent, env);
            const cfg = ENV_CFG[env];
            const isSelected = selectedEnv === env;

            const isAlertEnv = !agent.metrics?.alertEnv || agent.metrics.alertEnv === env;
            const hasError   = instance?.health === "error";
            const hasWarning = instance?.health === "warning" || (isAlertEnv && (agent.metrics?.alertSeverity?.warning ?? 0) > 0);
            const hasInfo    = isAlertEnv && !hasWarning && !hasError && (agent.metrics?.alertSeverity?.info ?? 0) > 0;
            const dotColor   = hasError ? "#dc2626" : hasWarning ? "#dc2626" : "#6366f1";
            const showDot    = instance && (hasError || hasWarning || hasInfo);

            if (!instance) return null;

            return (
              <button
                key={env}
                onClick={() => { setSelectedEnv(env); setSelectedTab(DEFAULT_TAB[env]); }}
                className="group w-full rounded-lg px-4 py-3 text-left transition-all cursor-pointer relative"
                style={{ background: (!isSelected && hoveredEnv === env) ? "#f9f9f9" : "transparent", boxShadow: isSelected ? "rgba(0,0,0,0.9) 0px 0px 0px 1px" : "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}
                onMouseEnter={() => setHoveredEnv(env)}
                onMouseLeave={() => setHoveredEnv(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium" style={{ color: cfg.text }}>
                    {cfg.label}
                  </span>
                  {showDot && (
                    <span className="relative flex w-2 h-2 shrink-0">
                      <span className="animate-ping absolute inset-0 rounded-full opacity-75" style={{ background: dotColor }} />
                      <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: dotColor }} />
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="flex flex-col flex-1 min-w-0 pr-6">
                    {instance.versionNote && (
                      <p className="text-[14px] font-semibold text-[#171717] leading-relaxed truncate">{instance.versionNote}</p>
                    )}
                    <p className="text-[12px] text-[#a1a1aa]">{formatVersion(instance.version)}</p>
                  </div>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#a1a1aa] transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 ${isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
                  >
                    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            );
          })}

        </div>

        {/* ── Right: Tabs + Content ── */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Content card with tabs inside */}
          <div className="flex-1 bg-white flex flex-col overflow-hidden pb-8">
            {/* Tabs */}
            <div className="flex justify-center px-8 pt-6 pb-6 shrink-0">
              <div className="flex items-center p-1 rounded-lg" style={{ background: "#f4f4f5" }}>
                {(["overview", "build", "test", "evaluate"] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className="px-4 py-1.5 rounded-md text-[13px] font-medium transition-all hover:text-[#171717]"
                    style={{
                      background: selectedTab === tab ? "#ffffff" : "transparent",
                      color: selectedTab === tab ? "#171717" : "#888888",
                      boxShadow: selectedTab === tab ? "rgba(0,0,0,0.08) 0px 1px 3px" : "none",
                    }}
                    onMouseEnter={(e) => { if (selectedTab !== tab) (e.currentTarget as HTMLElement).style.background = "#ebebeb"; }}
                    onMouseLeave={(e) => { if (selectedTab !== tab) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="px-8 pt-2 pb-8 flex-1 overflow-y-auto">
              {selectedTab === "overview"  && <OverviewTab  agent={agent} env={selectedEnv} instance={selectedInstance} />}
              {selectedTab === "build"     && <BuildTab     agent={agent} env={selectedEnv} />}
              {selectedTab === "test"      && <TestTab      agent={agent} env={selectedEnv} />}
              {selectedTab === "evaluate"  && <EvaluateTab  agent={agent} env={selectedEnv} />}
            </div>

          </div>
        </div>
      </div>

      {/* ── Dialogs ── */}
      {showPromote && (
        <PromoteDialog
          from={selectedEnv}
          to={promoteTarget}
          onClose={() => setShowPromote(false)}
          onConfirm={() => setShowPromote(false)}
        />
      )}
    </div>
  );
}
