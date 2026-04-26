"use client";

import { useState } from "react";
import SettingsSection, { FieldRow, Select, PageHeader } from "../SettingsSection";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0"
      style={{ background: on ? "#171717" : "#e4e4e7" }}
    >
      <span
        className="absolute top-0.5 left-0 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function ToggleRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between pt-4 pb-3">
      <div>
        <p className="text-[14px] font-medium text-[#4d4d4d]">{label}</p>
        {hint && <p className="text-[11px] text-[#a1a1aa] mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SecurityTab() {
  const [require2FA, setRequire2FA] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [scimEnabled, setScimEnabled] = useState(false);
  const [ipRestrict, setIpRestrict] = useState(false);
  const [supportAccess, setSupportAccess] = useState(true);

  return (
    <div className="">
      <PageHeader title="Security" description="조직 전체의 보안 정책을 관리합니다." />

      {/* Authentication */}
      <SettingsSection title="Authentication">
        <ToggleRow label="2FA 강제 적용" hint="모든 멤버에게 2FA 설정을 요구합니다.">
          <Toggle on={require2FA} onChange={setRequire2FA} />
        </ToggleRow>
        {require2FA && (
          <FieldRow label="Grace Period" hint="활성화 후 멤버가 2FA를 설정할 수 있는 유예 기간">
            <Select>
              <option>3 days</option>
              <option>7 days</option>
              <option>14 days</option>
            </Select>
          </FieldRow>
        )}
      </SettingsSection>

      {/* SSO */}
      <SettingsSection title="Single Sign-On (SSO)">
        <ToggleRow label="SAML SSO" hint="Okta, Azure AD, Google Workspace 지원">
          <div className="flex items-center gap-2">
            {!ssoEnabled && (
              <button className="text-[13px] font-medium text-[#0068d6] hover:underline">Configure</button>
            )}
            <Toggle on={ssoEnabled} onChange={setSsoEnabled} />
          </div>
        </ToggleRow>
        <ToggleRow label="SCIM Provisioning" hint="자동 사용자 프로비저닝">
          <Toggle on={scimEnabled} onChange={setScimEnabled} />
        </ToggleRow>
      </SettingsSection>

      {/* Login Restrictions */}
      <SettingsSection title="Login Restrictions">
        <ToggleRow label="IP Allowlist" hint="특정 IP 대역에서만 로그인을 허용합니다.">
          <Toggle on={ipRestrict} onChange={setIpRestrict} />
        </ToggleRow>
        {ipRestrict && (
          <FieldRow label="IP Ranges">
            <textarea
              className="w-full text-[14px] text-[#171717] px-3 py-2 rounded-md bg-white outline-none resize-none"
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
              rows={3}
              placeholder="192.168.1.0/24, 10.0.0.0/8"
            />
          </FieldRow>
        )}
        <FieldRow label="Session Timeout">
          <Select>
            <option>8 hours</option>
            <option>24 hours</option>
            <option>7 days</option>
            <option>30 days</option>
          </Select>
        </FieldRow>
        <FieldRow label="Concurrent Sessions">
          <Select>
            <option>Unlimited</option>
            <option>1</option>
            <option>3</option>
            <option>5</option>
          </Select>
        </FieldRow>
      </SettingsSection>

      {/* Support Access */}
      <SettingsSection title="Support Access" description="센드버드 지원팀이 조직 데이터에 접근할 수 있는 권한을 제어합니다.">
        <ToggleRow label="Allow Support Access">
          <Toggle on={supportAccess} onChange={setSupportAccess} />
        </ToggleRow>
        {supportAccess && (
          <FieldRow label="Expires">
            <Select>
              <option>7 days</option>
              <option>30 days</option>
              <option>90 days</option>
            </Select>
          </FieldRow>
        )}
      </SettingsSection>

      {/* Audit Logs */}
      <SettingsSection title="Audit Logs" description="모든 관리 작업 기록을 확인합니다. 보존 기간: Enterprise 2년 / 그 외 90일">
        <div className="pt-4">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[14px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
          >
            View Audit Logs
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}
