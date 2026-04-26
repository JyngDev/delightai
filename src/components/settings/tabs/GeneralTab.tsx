"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SettingsSection, { FieldRow, Input, Select, PageHeader } from "../SettingsSection";

function DeleteOrgDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-[16px] font-semibold text-[#171717] mb-1" style={{ letterSpacing: "-0.3px" }}>Delete Organization</h2>
        <p className="text-[14px] text-[#888888] mb-6">조직을 영구 삭제합니다. 이 작업은 되돌릴 수 없으며 모든 워크스페이스와 에이전트가 삭제됩니다.</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-[14px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 rounded-md text-[14px] font-medium text-white hover:opacity-85 transition-opacity"
            style={{ background: "#dc2626" }}
          >
            Delete Organization
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GeneralTab() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  return (
    <div className="">
      <PageHeader title="General" description="조직의 기본 정보를 관리합니다." />

      {/* Organization Identity */}
      <SettingsSection title="Organization Identity">
        <FieldRow label="Organization Name">
          <Input value="Operation" />
        </FieldRow>
        <FieldRow label="Organization Logo" hint="PNG, JPG, SVG · 최대 2MB · 정사각형 권장">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white shrink-0"
              style={{ background: "#171717" }}
            >
              O
            </div>
            <div className="flex gap-1.5">
              <button className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>Upload</button>
              <button className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#dc2626] hover:bg-[#fee2e2] transition-colors" style={{ boxShadow: "rgba(220,38,38,0.2) 0px 0px 0px 1px" }}>Remove</button>
            </div>
          </div>
        </FieldRow>
      </SettingsSection>

      {/* Subscription Plan */}
      <SettingsSection title="Subscription Plan">
        <div className="pt-4">
          <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: "#f9f9f9" }}>
            <div>
              <p className="text-[14px] font-semibold text-[#171717]">Enterprise</p>
              <p className="text-[13px] text-[#888888] mt-0.5">$2,400/month · 연간 결제 · 다음 결제일 2026-05-15</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {["Unlimited Agents", "10M conversations/mo", "SSO/SAML", "Priority Support"].map((f) => (
                  <span key={f} className="flex items-center gap-1 text-[11px] text-[#666666]">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5L4.5 8L9 3" stroke="#15803d" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href={`/org/${orgSlug}/settings/billing`}
              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors shrink-0"
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
            >
              Manage Billing
            </Link>
          </div>
        </div>
      </SettingsSection>

      {/* Compliance & Region */}
      <SettingsSection title="Compliance & Region">
        <FieldRow label="Data Residency">
          <Select>
            <option>🇰🇷 Seoul (ap-northeast-2)</option>
            <option>🇺🇸 US East (us-east-1)</option>
            <option>🇪🇺 EU West (eu-west-1)</option>
          </Select>
        </FieldRow>
        <FieldRow label="Compliance Standards">
          <div className="space-y-1.5">
            {[
              { label: "SOC 2 Type II", checked: true },
              { label: "GDPR", checked: true },
              { label: "HIPAA", checked: false },
            ].map(({ label, checked }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked={checked} className="w-3.5 h-3.5 accent-[#171717]" />
                <span className="text-[14px] text-[#444444]">{label}</span>
              </label>
            ))}
          </div>
        </FieldRow>
      </SettingsSection>

      {/* Delete */}
      <div className="py-10">
        <button
          onClick={() => setDeleteOpen(true)}
          className="px-3 py-1.5 rounded-md text-[14px] font-medium text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
          style={{ boxShadow: "rgba(220,38,38,0.3) 0px 0px 0px 1px" }}
        >
          Delete Organization
        </button>
      </div>

      {deleteOpen && <DeleteOrgDialog onClose={() => setDeleteOpen(false)} />}
    </div>
  );
}
