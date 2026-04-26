"use client";

import { Organization } from "@/lib/mock-data";

interface OrgSwitcherProps {
  organization: Organization;
}

export default function OrgSwitcher({ organization }: OrgSwitcherProps) {
  return (
    <button
      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#171717] hover:bg-[#f4f4f5] transition-colors"
      style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
        style={{ background: "#171717" }}
      >
        {organization.name[0]}
      </div>
      <span>{organization.name}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#a1a1aa]">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
