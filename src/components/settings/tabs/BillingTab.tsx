"use client";

import { MOCK_INVOICES } from "@/lib/mock-settings-data";
import SettingsSection, { PageHeader } from "../SettingsSection";

function UsageBar({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  const pct = Math.round((used / total) * 100);
  const color = pct >= 80 ? "#dc2626" : pct >= 60 ? "#f59e0b" : "#171717";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[13px]">
        <span className="text-[#444444]">{label}</span>
        <span className="text-[#888888]">{used.toLocaleString()}{unit} / {total.toLocaleString()}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#f4f4f5] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

const PLAN_FEATURES = ["Unlimited Agents", "10M conversations/month", "SSO/SAML", "Priority Support (4h SLA)", "2년 Audit Log 보존"];

export default function BillingTab() {
  return (
    <div className="">
      <PageHeader title="Billing" description="" />

      {/* Current Plan */}
      <SettingsSection title="Subscription Plan">
        <div className="pt-4">
          <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: "#f9f9f9" }}>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[14px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.3px" }}>Enterprise</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#f0fdf4", color: "#15803d" }}>Active</span>
              </div>
              <p className="text-[13px] text-[#888888]">$2,400/month · 연간 결제 · 다음 결제일 2026-05-15</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {PLAN_FEATURES.map((f) => (
                  <span key={f} className="flex items-center gap-1 text-[11px] text-[#666666]">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5L4.5 8L9 3" stroke="#15803d" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <button
              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors shrink-0"
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
            >
              Change Plan
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Usage */}
      <SettingsSection
        title="Usage this month"
        headerAction={<button className="text-[13px] font-medium text-[#0068d6] hover:underline">View detailed usage</button>}
      >
        <div className="pt-4 space-y-3">
          <UsageBar label="Conversations" used={4200000} total={10000000} unit="" />
          <UsageBar label="API Calls" used={380000} total={1000000} unit="" />
          <UsageBar label="Storage" used={24} total={100} unit="GB" />
        </div>
      </SettingsSection>

      {/* Payment Method */}
      <SettingsSection title="Payment Method">
        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded flex items-center justify-center text-[11px] font-bold text-white" style={{ background: "#1a1f71" }}>VISA</div>
            <div>
              <p className="text-[14px] text-[#171717]">Visa ending in 4242</p>
              <p className="text-[11px] text-[#a1a1aa]">Expires 12/28 · billing@operation.com</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button className="px-2.5 py-1 rounded text-[13px] text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>Update</button>
            <button className="px-2.5 py-1 rounded text-[13px] text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>Add backup</button>
          </div>
        </div>
      </SettingsSection>

      {/* Billing Info */}
      <SettingsSection title="Billing Information">
        <div className="pt-4 flex items-center justify-between">
          <div>
            <p className="text-[14px] text-[#444444]">Operation Corp.</p>
            <p className="text-[13px] text-[#888888] mt-0.5">Tax ID: 123-45-67890</p>
            <p className="text-[13px] text-[#888888]">123 Main St, Seoul, Korea</p>
          </div>
          <button className="px-2.5 py-1 rounded text-[13px] text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>Edit</button>
        </div>
      </SettingsSection>

      {/* Invoices */}
      <SettingsSection
        title="Invoices"
        headerAction={<button className="text-[13px] font-medium text-[#0068d6] hover:underline">View all</button>}
      >
        <div className="pt-4">
          <table className="w-full text-[14px]">
            <thead>
              <tr style={{ borderBottom: "1px solid #f4f4f5" }}>
                {["Date", "Amount", "Status", "Invoice"].map((h) => (
                  <th key={h} className="pb-2.5 text-left text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_INVOICES.map((inv, i) => (
                <tr key={inv.id} className="hover:bg-[#fafafa] transition-colors" style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
                  <td className="py-3 text-[#444444]">{inv.date}</td>
                  <td className="py-3 font-medium text-[#171717]">{inv.amount}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#f0fdf4", color: "#15803d" }}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Paid
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="flex items-center gap-1 text-[13px] text-[#0068d6] hover:underline">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2.5 1.5h5.5l2.5 2.5v7.5a.5.5 0 0 1-.5.5h-7.5a.5.5 0 0 1-.5-.5v-9.5a.5.5 0 0 1 .5-.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                        <path d="M7.5 1.5v2.5h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                        <path d="M4.5 7.5h4M4.5 9.5h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                      </svg>
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>
    </div>
  );
}
