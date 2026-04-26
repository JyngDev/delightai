"use client";

import { useState } from "react";
import { MOCK_MEMBERS, MOCK_PENDING_INVITES, ROLE_COLORS } from "@/lib/mock-settings-data";
import SettingsSection, { PageHeader } from "../SettingsSection";

function RoleBadge({ role }: { role: string }) {
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.viewer;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
      style={{ background: colors.bg, color: colors.text }}
    >
      {role}
    </span>
  );
}

export default function MembersTab() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="">
      <PageHeader title="Members" description="" />

      {/* All Users */}
      <SettingsSection
        title="All Users"
        headerAction={
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white shrink-0 hover:opacity-85 transition-opacity"
            style={{ background: "#171717" }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Invite Members
          </button>
        }
      >
        <div className="pt-4">
          {/* Search */}
          <div className="mb-3 relative">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
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
                  {["Name", "Email", "Role", "Workspaces", "Last Active", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr
                    key={m.id}
                    className="hover:bg-[#fafafa] transition-colors"
                    style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ background: "#525252" }}>
                          {m.avatarInitials}
                        </div>
                        <span className="font-medium text-[#171717]">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#666666]">{m.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={m.role} /></td>
                    <td className="px-4 py-3 text-[#666666]">
                      {m.workspaceAccess === "all" ? "All" : `${(m.workspaceAccess as string[]).length} workspaces`}
                    </td>
                    <td className="px-4 py-3 text-[#a1a1aa]">{m.lastActiveAt ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button className="text-[#a1a1aa] hover:text-[#171717] transition-colors">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
                          <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                          <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: "1px solid #f4f4f5", background: "#fafafa" }}>
              <span className="text-[13px] text-[#a1a1aa]">Showing {filtered.length} of {MOCK_MEMBERS.length} members</span>
              <div className="flex gap-1">
                {["← Prev", "Next →"].map((l) => (
                  <button key={l} className="px-2.5 py-1 rounded text-[13px] text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Pending Invitations */}
      {MOCK_PENDING_INVITES.length > 0 && (
        <SettingsSection
          title="Pending Invitations"
        >
          <div className="pt-4">
          <div className="rounded-lg overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
            {MOCK_PENDING_INVITES.map((inv, i) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] transition-colors"
                style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[14px] text-[#444444]">{inv.email}</span>
                  <RoleBadge role={inv.role} />
                  <span className="text-[13px] text-[#a1a1aa]">Invited {inv.invitedAt}</span>
                </div>
                <div className="flex gap-1.5">
                  <button className="px-2.5 py-1 rounded text-[13px] text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>Resend</button>
                  <button className="px-2.5 py-1 rounded text-[13px] text-[#dc2626] hover:bg-[#fee2e2] transition-colors" style={{ boxShadow: "rgba(220,38,38,0.2) 0px 0px 0px 1px" }}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
          </div>
        </SettingsSection>
      )}
    </div>
  );
}
