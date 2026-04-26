"use client";

import SettingsSection, { PageHeader } from "../SettingsSection";
import { ROLE_COLORS } from "@/lib/mock-settings-data";

const SYSTEM_ROLES = [
  { key: "owner",  label: "Owner",  desc: "모든 권한 (결제 포함). 조직 최상위 관리자." },
  { key: "admin",  label: "Admin",  desc: "멤버·보안·WS 관리. 결제 제외." },
  { key: "editor", label: "Editor", desc: "Agent 생성·편집, Staging Promote." },
  { key: "viewer", label: "Viewer", desc: "모든 화면 읽기 전용." },
];

const CUSTOM_ROLES = [
  { id: "cr1", label: "QA Lead",     desc: "QA 팀 리드 전용 역할", members: 2 },
  { id: "cr2", label: "Prompt Eng.", desc: "프롬프트 엔지니어링 전용", members: 5 },
];

const PERMISSION_GROUPS = [
  {
    group: "Organization",
    items: ["멤버 관리", "결제 관리", "보안 정책 관리"],
  },
  {
    group: "Workspace",
    items: ["전체 WS 보기", "WS 생성", "WS 삭제", "Shared Asset 관리"],
  },
  {
    group: "AI Agent",
    items: ["Agent 보기", "Dev 편집", "Staging 편집", "Prod 편집", "Staging Promote", "Prod Promote", "Prod 롤백", "Evaluate 실행"],
  },
];

export default function RolesTab() {
  return (
    <div className="">
      <PageHeader title="Roles & Permissions" description="" />

      {/* System Roles */}
      <SettingsSection title="System Roles">
        <div className="pt-4">
          <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
            {SYSTEM_ROLES.map((role, i) => {
              const colors = ROLE_COLORS[role.key];
              return (
                <div
                  key={role.key}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] transition-colors"
                  style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: colors.bg, color: colors.text }}>
                      {role.label}
                    </span>
                    <span className="text-[14px] text-[#666666]">{role.desc}</span>
                  </div>
                  </div>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      {/* Custom Roles */}
      <SettingsSection
        title="Custom Roles"
        headerAction={
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white hover:opacity-85 transition-opacity"
            style={{ background: "#171717" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            New Role
          </button>
        }
      >
        <div className="pt-4">
          <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
            {CUSTOM_ROLES.map((role, i) => (
              <div
                key={role.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] transition-colors cursor-pointer"
                style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: "#fff7ed", color: "#c2410c" }}>
                    {role.label}
                  </span>
                  <span className="text-[14px] text-[#666666]">{role.desc}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-[#a1a1aa]">{role.members} members</span>
                  <button className="text-[#a1a1aa] hover:text-[#171717] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
                      <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                      <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingsSection>

      {/* Permissions overview */}
      <SettingsSection title="Permission Reference">
        <div className="pt-4">
          <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
          <div className="grid grid-cols-[1fr_repeat(4,_44px)] gap-4 text-[11px] font-semibold text-[#a1a1aa] px-4 py-2.5 uppercase tracking-wide" style={{ background: "#fafafa", borderBottom: "1px solid #f4f4f5" }}>
            <span>Permission</span>
            {["Owner", "Admin", "Editor", "Viewer"].map((r) => <span key={r} className="text-center">{r}</span>)}
          </div>
          {PERMISSION_GROUPS.map((g) => (
            <div key={g.group}>
              <div className="px-4 py-1.5 text-[11px] font-semibold text-[#a1a1aa] bg-[#fafafa]" style={{ borderTop: "1px solid #f4f4f5" }}>{g.group}</div>
              {g.items.map((item) => {
                const checks = [true, g.group !== "Organization" || item === "멤버 관리", false, false];
                return (
                  <div key={item} className="grid grid-cols-[1fr_repeat(4,_44px)] gap-4 px-4 py-2 hover:bg-[#fafafa] transition-colors" style={{ borderTop: "1px solid #f4f4f5" }}>
                    <span className="text-[14px] text-[#444444]">{item}</span>
                    {checks.map((c, ci) => (
                      <span key={ci} className="flex justify-center">
                        {c ? (
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5L5.5 9.5L10.5 3.5" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : (
                          <span className="text-[#e4e4e7] text-[16px] leading-none">−</span>
                        )}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
