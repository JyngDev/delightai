"use client";

import { useState } from "react";
import SettingsSection, { FieldRow, Input, Select } from "@/components/settings/SettingsSection";

function DeleteWsDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-[16px] font-semibold text-[#171717] mb-1" style={{ letterSpacing: "-0.3px" }}>
          Delete Workspace
        </h2>
        <p className="text-[14px] text-[#888888] mb-6">
          모든 Agent와 데이터가 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
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
            Delete Workspace
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GeneralTab() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [defaultEnv, setDefaultEnv] = useState<"development" | "production">("production");

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.3px" }}>General</h1>
      {/* Workspace Identity */}
      <SettingsSection title="Workspace Identity">
        <FieldRow label="Workspace Name">
          <Input value="Fan Engagement" />
        </FieldRow>
        <FieldRow label="Workspace Slug" hint="URL에 사용됩니다. 변경 시 30일 리다이렉트 제공.">
          <Input value="fan-engagement" />
        </FieldRow>
        <FieldRow label="Description">
          <textarea
            defaultValue="팬들과의 소통을 자동화하고 팬 경험을 개선합니다."
            rows={3}
            className="w-full text-[14px] text-[#171717] px-3 py-2 rounded-md bg-white outline-none resize-none"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
          />
        </FieldRow>
      </SettingsSection>

      {/* Default Settings */}
      <SettingsSection title="Default Settings">
        <FieldRow label="Agent 진입 시 기본 환경" hint="새 팀원이 Agent를 열 때 기본으로 보여줄 환경">
          <div className="flex flex-col gap-2">
            {(["development", "production"] as const).map((env) => (
              <label key={env} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultEnv"
                  checked={defaultEnv === env}
                  onChange={() => setDefaultEnv(env)}
                  className="accent-[#171717]"
                />
                <span className="text-[14px] text-[#444444] capitalize">{env}</span>
              </label>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="새 Agent 기본 모델">
          <Select>
            <option>GPT-4 Turbo</option>
            <option>GPT-4o</option>
            <option>Claude Sonnet 4</option>
            <option>Gemini Pro</option>
          </Select>
        </FieldRow>
      </SettingsSection>

      {/* Usage Quota */}
      <SettingsSection title="Usage Quota" description="조직 전체 한도 내에서 이 Workspace의 월간 사용량을 제한합니다.">
        <FieldRow label="Conversations / month">
          <div className="space-y-2">
            <Input value="1,000,000" />
            <div className="space-y-1">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#444444]">현재 사용량</span>
                <span className="text-[#888888]">420,000 / 1,000,000</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#f4f4f5] overflow-hidden">
                <div className="h-full rounded-full bg-[#171717]" style={{ width: "42%" }} />
              </div>
            </div>
          </div>
        </FieldRow>
      </SettingsSection>

      {/* Archive */}
      <SettingsSection title="Archive Workspace" description="아카이브 시 읽기 전용이 되며 Agent 실행이 중지됩니다. 언제든 복구 가능합니다.">
        <div className="pt-4">
          <button
            className="px-3 py-1.5 rounded-md text-[14px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
          >
            Archive Workspace
          </button>
        </div>
      </SettingsSection>

      {/* Delete */}
      <div className="py-10">
        <button
          onClick={() => setDeleteOpen(true)}
          className="px-3 py-1.5 rounded-md text-[14px] font-medium text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
          style={{ boxShadow: "rgba(220,38,38,0.3) 0px 0px 0px 1px" }}
        >
          Delete Workspace
        </button>
      </div>

      {deleteOpen && <DeleteWsDialog onClose={() => setDeleteOpen(false)} />}
    </div>
  );
}
