"use client";

import { useState } from "react";
import { WS_MOCK_INTEGRATIONS_INSTALLED, WS_MOCK_INTEGRATIONS_AVAILABLE } from "@/lib/mock-workspace-data";
import SettingsSection from "@/components/settings/SettingsSection";

const SERVICE_LOGOS: Record<string, string> = {
  Mailchimp: "https://cdn.simpleicons.org/mailchimp",
  Zendesk:  "https://cdn.simpleicons.org/zendesk",
  HubSpot:  "https://cdn.simpleicons.org/hubspot",
  Airtable: "https://cdn.simpleicons.org/airtable",
  Jira:     "https://cdn.simpleicons.org/jira",
  Notion:   "https://cdn.simpleicons.org/notion",
  Intercom: "https://cdn.simpleicons.org/intercom",
  GitHub:   "https://cdn.simpleicons.org/github",
  Mixpanel: "https://cdn.simpleicons.org/mixpanel",
  Discord:  "https://cdn.simpleicons.org/discord",
};

function ServiceLogo({ name, size = 20 }: { name: string; size?: number }) {
  const src = SERVICE_LOGOS[name];
  if (!src) return <span className="text-[11px] font-bold text-white">{name[0]}</span>;
  return <img src={src} alt={name} width={size} height={size} style={{ objectFit: "contain" }} />;
}

export default function IntegrationsTab() {
  const [activeTab, setActiveTab] = useState<"installed" | "browse">("installed");

  return (
    <div>
      <div>
        <h1 className="text-[22px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.3px" }}>Integrations</h1>
        <p className="mt-1 text-[14px] text-[#888888] leading-relaxed">외부 서비스와 연동하여 Agent의 기능을 확장합니다.</p>
      </div>
      <SettingsSection topPadding="pt-4">
        {/* Tab bar */}
        <div className="flex gap-1 mt-4" style={{ borderBottom: "1px solid #f4f4f5" }}>
          {[
            { key: "installed", label: `Installed (${WS_MOCK_INTEGRATIONS_INSTALLED.length})` },
            { key: "browse",    label: "Browse All" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as "installed" | "browse")}
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

        {activeTab === "installed" && (
          <div className="pt-4">
            <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
              {WS_MOCK_INTEGRATIONS_INSTALLED.map((intg, i) => (
                <div
                  key={intg.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] transition-colors"
                  style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "#f4f4f5" }}
                    >
                      <ServiceLogo name={intg.name} size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-[#171717]">{intg.name}</span>
                        {intg.reauth && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#fff7ed", color: "#c2410c" }}>
                            Reauth required
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#888888]">{intg.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="px-2.5 py-1 rounded text-[13px] text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
                      Configure
                    </button>
                    <button className="px-2.5 py-1 rounded text-[13px] text-[#dc2626] hover:bg-[#fee2e2] transition-colors" style={{ boxShadow: "rgba(220,38,38,0.2) 0px 0px 0px 1px" }}>
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "browse" && (
          <div className="pt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {WS_MOCK_INTEGRATIONS_AVAILABLE.map((intg) => (
              <div
                key={intg.id}
                className="rounded-lg p-4 hover:bg-[#fafafa] transition-colors"
                style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: "#f4f4f5" }}>
                  <ServiceLogo name={intg.name} size={18} />
                </div>
                <p className="text-[14px] font-semibold text-[#171717] mb-1">{intg.name}</p>
                <p className="text-[12px] text-[#888888] mb-3 leading-relaxed">{intg.desc}</p>
                <button
                  className="px-3 py-1 rounded-md text-[13px] font-medium text-white hover:opacity-85 transition-opacity"
                  style={{ background: "#171717" }}
                >
                  Install
                </button>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>
    </div>
  );
}
