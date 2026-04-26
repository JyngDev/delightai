"use client";

import { useState } from "react";
import { WS_MOCK_CHANNELS_ACTIVE, WS_MOCK_CHANNELS_AVAILABLE } from "@/lib/mock-workspace-data";
import SettingsSection from "@/components/settings/SettingsSection";

export default function ChannelsTab() {
  const [activeTab, setActiveTab] = useState<"active" | "available">("active");

  return (
    <div>
      <div>
        <h1 className="text-[22px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.3px" }}>Channels</h1>
        <p className="mt-1 text-[14px] text-[#888888] leading-relaxed">Agent가 배포되는 채널의 공통 설정을 관리합니다.</p>
      </div>
      <SettingsSection topPadding="pt-4">
        {/* Tab bar */}
        <div className="flex gap-1 mt-4" style={{ borderBottom: "1px solid #f4f4f5" }}>
          {[
            { key: "active",    label: `Active (${WS_MOCK_CHANNELS_ACTIVE.length})` },
            { key: "available", label: "Available" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as "active" | "available")}
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

        {activeTab === "active" && (
          <div className="pt-4">
            <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
              {WS_MOCK_CHANNELS_ACTIVE.map((ch, i) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] transition-colors"
                  style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                      style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
                    >
                      {ch.icon}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#171717]">{ch.name}</p>
                      <p className="text-[13px] text-[#888888]">{ch.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#f0fdf4", color: "#15803d" }}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Active
                    </span>
                    <button className="px-2.5 py-1 rounded text-[13px] text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
                      Configure
                    </button>
                    <button className="px-2.5 py-1 rounded text-[13px] text-[#dc2626] hover:bg-[#fee2e2] transition-colors" style={{ boxShadow: "rgba(220,38,38,0.2) 0px 0px 0px 1px" }}>
                      Disable
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "available" && (
          <div className="pt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {WS_MOCK_CHANNELS_AVAILABLE.map((ch) => (
              <div
                key={ch.id}
                className="rounded-lg p-4 hover:bg-[#fafafa] transition-colors"
                style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
              >
                <div className="text-2xl mb-2">{ch.icon}</div>
                <p className="text-[14px] font-semibold text-[#171717] mb-1">{ch.name}</p>
                <p className="text-[12px] text-[#888888] mb-3 leading-relaxed">{ch.desc}</p>
                <button
                  className="px-3 py-1 rounded-md text-[13px] font-medium text-white hover:opacity-85 transition-opacity"
                  style={{ background: "#171717" }}
                >
                  Enable
                </button>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>
    </div>
  );
}
