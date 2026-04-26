"use client";

import { useState } from "react";
import { WS_MOCK_USERS } from "@/lib/mock-workspace-data";
import SettingsSection from "@/components/settings/SettingsSection";

const WS_ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  Admin:  { bg: "#eff6ff", text: "#1d4ed8" },
  Editor: { bg: "#f0fdf4", text: "#15803d" },
  Viewer: { bg: "#f4f4f5", text: "#71717a" },
};

function WsRoleBadge({ role }: { role: string }) {
  const colors = WS_ROLE_COLORS[role] ?? WS_ROLE_COLORS.Viewer;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: colors.bg, color: colors.text }}
    >
      {role}
    </span>
  );
}

export default function UsersTab() {
  const [search, setSearch] = useState("");

  const filtered = WS_MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.3px" }}>Users</h1>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white hover:opacity-85 transition-opacity"
            style={{ background: "#171717" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add from Org
          </button>
        </div>
        <p className="mt-1 text-[14px] text-[#888888] leading-relaxed">이 Workspace에 접근 가능한 멤버를 관리합니다.</p>
      </div>
      <SettingsSection topPadding="pt-4">
        <div className="pt-4">
          {/* Search */}
          <div className="mb-3 relative">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" />
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-8 pr-3 py-1.5 text-[14px] rounded-md outline-none"
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
            />
          </div>

          {/* Table */}
          <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
            <table className="w-full text-[14px]">
              <thead>
                <tr style={{ borderBottom: "1px solid #f4f4f5", background: "#fafafa" }}>
                  {["User", "Email", "WS Role", "Last Active", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    className="hover:bg-[#fafafa] transition-colors"
                    style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ background: "#525252" }}>
                          {u.avatarInitials}
                        </div>
                        <span className="font-medium text-[#171717]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#666666]">{u.email}</td>
                    <td className="px-4 py-3"><WsRoleBadge role={u.wsRole} /></td>
                    <td className="px-4 py-3 text-[#a1a1aa]">{u.lastActive}</td>
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
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: "1px solid #f4f4f5", background: "#fafafa" }}>
              <span className="text-[13px] text-[#a1a1aa]">Showing {filtered.length} of {WS_MOCK_USERS.length} users</span>
              <div className="flex gap-1">
                {["← Prev", "Next →"].map((l) => (
                  <button key={l} className="px-2.5 py-1 rounded text-[13px] text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
