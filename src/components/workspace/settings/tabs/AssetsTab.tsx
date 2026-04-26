"use client";

import { useState } from "react";
import { WS_MOCK_KNOWLEDGE, WS_MOCK_TOOLS, WS_MOCK_PROMPTS } from "@/lib/mock-workspace-data";
import SettingsSection from "@/components/settings/SettingsSection";

const ASSET_TABS = [
  { key: "knowledge", label: "📚 Knowledge" },
  { key: "tools",     label: "🛠 Tools" },
  { key: "prompts",   label: "📝 Prompts" },
  { key: "brand",     label: "🎨 Brand" },
] as const;

type AssetTab = (typeof ASSET_TABS)[number]["key"];

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-4">
      <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
        {children}
      </div>
    </div>
  );
}

function KnowledgeTable() {
  return (
    <TableWrapper>
      <table className="w-full text-[14px]">
        <thead>
          <tr style={{ borderBottom: "1px solid #f4f4f5", background: "#fafafa" }}>
            {["Name", "Type", "Size", "Used by", ""].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WS_MOCK_KNOWLEDGE.map((k, i) => (
            <tr key={k.id} className="hover:bg-[#fafafa] transition-colors" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{k.type === "Document" ? "📄" : k.type === "Website" ? "🌐" : "💾"}</span>
                  <span className="font-medium text-[#171717]">{k.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-[#666666]">{k.type}</td>
              <td className="px-4 py-3 text-[#666666]">{k.size}</td>
              <td className="px-4 py-3 text-[#666666]">{k.usedBy} agents</td>
              <td className="px-4 py-3">
                <button className="text-[#a1a1aa] hover:text-[#171717] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="13" r="1.2" fill="currentColor" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

function ToolsTable() {
  return (
    <TableWrapper>
      <table className="w-full text-[14px]">
        <thead>
          <tr style={{ borderBottom: "1px solid #f4f4f5", background: "#fafafa" }}>
            {["Function Name", "Protocol", "Used by", ""].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WS_MOCK_TOOLS.map((t, i) => (
            <tr key={t.id} className="hover:bg-[#fafafa] transition-colors" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span>🔧</span>
                  <code className="text-[13px] text-[#171717] font-mono">{t.name}</code>
                </div>
              </td>
              <td className="px-4 py-3 text-[#666666]">{t.protocol}</td>
              <td className="px-4 py-3 text-[#666666]">{t.usedBy} agents</td>
              <td className="px-4 py-3">
                <button className="text-[#a1a1aa] hover:text-[#171717] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="13" r="1.2" fill="currentColor" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

function PromptsTable() {
  return (
    <TableWrapper>
      <table className="w-full text-[14px]">
        <thead>
          <tr style={{ borderBottom: "1px solid #f4f4f5", background: "#fafafa" }}>
            {["Name", "Preview", "Used by", ""].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WS_MOCK_PROMPTS.map((p, i) => (
            <tr key={p.id} className="hover:bg-[#fafafa] transition-colors" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span>🧩</span>
                  <span className="font-medium text-[#171717]">{p.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-[#888888] max-w-xs truncate">{p.preview}</td>
              <td className="px-4 py-3 text-[#666666]">{p.usedBy} agents</td>
              <td className="px-4 py-3">
                <button className="text-[#a1a1aa] hover:text-[#171717] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="13" r="1.2" fill="currentColor" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

function BrandPanel() {
  return (
    <div className="pt-4 space-y-4">
      <div className="rounded-lg p-4" style={{ background: "#fafafa", boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
        <p className="text-[14px] font-medium text-[#171717] mb-3">Brand Colors</p>
        <div className="flex gap-2">
          {[{ color: "#A50044", name: "FCB Red" }, { color: "#004D98", name: "FCB Blue" }, { color: "#EDBB00", name: "FCB Gold" }].map((c) => (
            <div key={c.name} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg border border-[#e4e4e7]" style={{ background: c.color }} />
              <span className="text-[11px] text-[#888888]">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg p-4" style={{ background: "#fafafa", boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
        <p className="text-[14px] font-medium text-[#171717] mb-1">Logo</p>
        <p className="text-[13px] text-[#888888] mb-3">Agent 채팅 UI에 표시될 로고</p>
        {/* Uploaded state */}
        <div className="flex items-center gap-3 p-3 rounded-lg mb-3" style={{ background: "#ffffff", boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "#f4f4f5" }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/sco/thumb/4/47/FC_Barcelona_%28crest%29.svg/250px-FC_Barcelona_%28crest%29.svg.png?_=20170427233659"
              alt="FC Barcelona"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#171717]">fcb-logo.png</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4.5" fill="#16a34a" />
                <path d="M3 5l1.5 1.5L7 3.5" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[12px] text-[#16a34a] font-medium">Uploaded</span>
              <span className="text-[12px] text-[#d4d4d8]">·</span>
              <span className="text-[12px] text-[#a1a1aa]">38 KB</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button className="px-2.5 py-1 rounded text-[12px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
              Replace
            </button>
            <button className="px-2.5 py-1 rounded text-[12px] font-medium text-[#dc2626] hover:bg-[#fee2e2] transition-colors" style={{ boxShadow: "rgba(220,38,38,0.2) 0px 0px 0px 1px" }}>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ADD_LABELS: Record<AssetTab, string> = {
  knowledge: "Add Knowledge",
  tools:     "New Tool",
  prompts:   "New Snippet",
  brand:     "Upload Asset",
};

export default function AssetsTab() {
  const [activeTab, setActiveTab] = useState<AssetTab>("knowledge");

  return (
    <div>
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.3px" }}>Shared Assets</h1>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white hover:opacity-85 transition-opacity"
            style={{ background: "#171717" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {ADD_LABELS[activeTab]}
          </button>
        </div>
        <p className="mt-1 text-[14px] text-[#888888] leading-relaxed">이 Workspace의 여러 Agent가 공유하는 자산을 관리합니다.</p>
      </div>
      <SettingsSection topPadding="pt-4">
        {/* Inner tab bar */}
        <div className="flex gap-1 mt-4" style={{ borderBottom: "1px solid #f4f4f5" }}>
          {ASSET_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-3 py-2 text-[13px] font-medium transition-colors -mb-px"
              style={{
                color: activeTab === key ? "#171717" : "#888888",
                borderBottom: activeTab === key ? "2px solid #171717" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "knowledge" && <KnowledgeTable />}
        {activeTab === "tools"     && <ToolsTable />}
        {activeTab === "prompts"   && <PromptsTable />}
        {activeTab === "brand"     && <BrandPanel />}
      </SettingsSection>
    </div>
  );
}
