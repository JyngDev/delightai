"use client";

export default function AddWorkspaceCard() {
  return (
    <button
      className="flex flex-col items-center justify-center gap-2 rounded-lg bg-white w-full min-h-[160px] transition-all duration-150 hover:bg-[#fafafa]"
      style={{
        boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px",
        border: "1.5px dashed #e4e4e7",
      }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full text-[#a1a1aa]"
        style={{ background: "#f4f4f5" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-[13px] font-medium text-[#a1a1aa]">New Workspace</span>
    </button>
  );
}
