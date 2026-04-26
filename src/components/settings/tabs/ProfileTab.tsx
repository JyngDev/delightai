"use client";

import { useState } from "react";
import SettingsSection, { FieldRow, Input, Select, PageHeader } from "../SettingsSection";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0"
      style={{ background: on ? "#171717" : "#e4e4e7" }}
    >
      <span className="absolute top-0.5 left-0 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200" style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }} />
    </button>
  );
}

const SESSIONS = [
  { id: "s1", device: "macOS · Chrome", location: "Seoul, KR", current: true },
  { id: "s2", device: "iOS · Mobile App", location: "Seoul, KR", current: false },
  { id: "s3", device: "Windows · Chrome", location: "Seoul, KR", current: false },
];

const NOTIFICATIONS = [
  { key: "invite",   label: "Workspace invitations", on: true },
  { key: "alerts",   label: "Agent alerts (error, downtime)", on: true },
  { key: "summary",  label: "Weekly summary", on: false },
  { key: "updates",  label: "Product updates", on: false },
];

export default function ProfileTab() {
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.key, n.on]))
  );

  return (
    <div className="">
      <PageHeader title="Profile" description="개인 계정 정보를 관리합니다." />

      {/* Personal Info */}
      <SettingsSection title="Personal Information" >
        <FieldRow label="Profile Picture" hint="PNG, JPG · 최대 2MB · 정사각형 권장">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-semibold text-white shrink-0" style={{ background: "#525252" }}>JY</div>
            <div className="flex gap-1.5">
              <button className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>Upload</button>
              <button className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#dc2626] hover:bg-[#fee2e2] transition-colors" style={{ boxShadow: "rgba(220,38,38,0.2) 0px 0px 0px 1px" }}>Remove</button>
            </div>
          </div>
        </FieldRow>
        <FieldRow label="Full Name"><Input value="Jynn" /></FieldRow>
        <FieldRow label="Display Name"><Input value="Jynn" /></FieldRow>
        <FieldRow label="Job Title"><Input placeholder="e.g. Senior Product Designer" /></FieldRow>
        <FieldRow label="Timezone">
          <Select>
            <option>Asia/Seoul (UTC+9)</option>
            <option>America/New_York (UTC-5)</option>
            <option>Europe/London (UTC+1)</option>
          </Select>
        </FieldRow>
        <FieldRow label="Language">
          <Select>
            <option>한국어</option>
            <option>English</option>
          </Select>
        </FieldRow>
      </SettingsSection>

      {/* Email & Password */}
      <SettingsSection title="Email & Password">
        <FieldRow label="Email Address">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[#444444]">jynnng@icloud.com</span>
            <button className="text-[13px] font-medium text-[#0068d6] hover:underline">Change Email</button>
          </div>
        </FieldRow>
        <FieldRow label="Password">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[#a1a1aa] tracking-widest">••••••••••</span>
            <button className="text-[13px] font-medium text-[#0068d6] hover:underline">Change Password</button>
          </div>
        </FieldRow>
      </SettingsSection>

      {/* 2FA */}
      <SettingsSection title="Two-Factor Authentication">
        <div className="pt-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5L5 9.5L11 3.5" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[14px] font-medium text-[#15803d]">Enabled</span>
              <span className="text-[11px] text-[#a1a1aa]">(Authenticator App)</span>
            </div>
            <div className="flex gap-2">
              <button className="text-[13px] font-medium text-[#0068d6] hover:underline">View Backup Codes</button>
              <span className="text-[#e4e4e7]">·</span>
              <button className="text-[13px] font-medium text-[#0068d6] hover:underline">Regenerate</button>
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#dc2626] hover:bg-[#fee2e2] transition-colors" style={{ boxShadow: "rgba(220,38,38,0.2) 0px 0px 0px 1px" }}>
            Disable 2FA
          </button>
        </div>
      </SettingsSection>

      {/* Connected Accounts */}
      <SettingsSection title="Connected Accounts">
        <div className="pt-4">
        {[
          { name: "Google", handle: "jynnng@gmail.com", connected: true },
          { name: "GitHub", handle: "@jynndev", connected: true },
          { name: "Slack", handle: "Not connected", connected: false },
        ].map((acc) => (
          <div key={acc.name} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid #f4f4f5" }}>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#171717] w-14">{acc.name}</span>
              <span className="text-[13px] text-[#888888]">{acc.handle}</span>
            </div>
            <button
              className={`px-2.5 py-1 rounded text-[13px] font-medium transition-colors ${acc.connected ? "text-[#666666] hover:bg-[#f4f4f5]" : "text-[#0068d6] hover:bg-[#ebf5ff]"}`}
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
            >
              {acc.connected ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications" >
        <div className="pt-4 space-y-2.5">
          {NOTIFICATIONS.map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-[14px] text-[#444444]">{label}</span>
              <Toggle on={notifs[key]} onChange={(v) => setNotifs((p) => ({ ...p, [key]: v }))} />
            </label>
          ))}
        </div>
      </SettingsSection>

      {/* Sessions */}
      <SettingsSection title="Active Sessions">
        <div className="pt-4 space-y-0.5 mb-3">
          {SESSIONS.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#444444]">{s.device}</span>
                <span className="text-[11px] text-[#a1a1aa]">{s.location}</span>
                {s.current && <span className="text-[10px] font-medium text-[#0068d6] bg-[#ebf5ff] px-1.5 py-0.5 rounded-full">현재 세션</span>}
              </div>
              {!s.current && (
                <button className="text-[13px] text-[#dc2626] hover:underline">Sign out</button>
              )}
            </div>
          ))}
        </div>
        <button
          className="text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] px-3 py-1.5 rounded-md transition-colors"
          style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
        >
          Sign out all other sessions
        </button>
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection
        title="Danger Zone"
        description="계정을 영구 삭제합니다. 모든 조직에서 제외됩니다."
        variant="danger"
      >
        <div className="pt-4">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[14px] font-medium text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
          style={{ boxShadow: "rgba(220,38,38,0.3) 0px 0px 0px 1px" }}
        >
          Delete Account
        </button>
        </div>
      </SettingsSection>
    </div>
  );
}
