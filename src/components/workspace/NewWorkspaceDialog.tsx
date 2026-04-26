"use client";

import { useRef, useState } from "react";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface Props {
  onClose: () => void;
}

export default function NewWorkspaceDialog({ onClose }: Props) {
  const [closing, setClosing] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 240);
  }

  const [name, setName]             = useState("");
  const [desc, setDesc]             = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [defaultEnv, setDefaultEnv] = useState<"development" | "production">("production");
  const [defaultModel, setDefaultModel] = useState("claude-sonnet-4-6");
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const MODELS = [
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "Anthropic" },
    { id: "claude-opus-4-7",   label: "Claude Opus 4.7",   provider: "Anthropic" },
    { id: "gpt-4o",            label: "GPT-4o",            provider: "OpenAI"    },
    { id: "gemini-pro",        label: "Gemini Pro",        provider: "Google"    },
  ];

  const slug = toSlug(name);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImage(URL.createObjectURL(file));
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div
        className={`relative bg-white flex flex-col h-full shadow-2xl ${closing ? "animate-slide-out-right" : "animate-slide-in-right"}`}
        style={{ width: "480px" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-6 flex items-center justify-between shrink-0">
          <h2 className="text-[18px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.3px" }}>
            New Workspace
          </h2>
          <button onClick={handleClose} className="text-[#a1a1aa] hover:text-[#171717] transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto flex-1 space-y-6">

          {/* Workspace name */}
          <div>
            <p className="text-[13px] font-medium text-[#444444] mb-1.5">
              Workspace name <span className="text-[#dc2626]">*</span>
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fan Engagement"
              className="w-full text-[14px] text-[#171717] px-3 rounded-md bg-white outline-none"
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px", height: "40px" }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = "rgba(0,0,0,0.15) 0px 0px 0px 1px, rgba(59,130,246,0.3) 0px 0px 0px 3px"; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "rgba(0,0,0,0.08) 0px 0px 0px 1px"; }}
            />
            {slug && (
              <p className="mt-1.5 text-[12px] text-[#a1a1aa]">
                Slug: <span className="font-mono text-[#666666]">{slug}</span>
              </p>
            )}
          </div>

          <div style={{ height: "1px", background: "#f4f4f5" }} />

          {/* Description */}
          <div>
            <p className="text-[13px] font-medium text-[#444444] mb-1.5">
              Description <span className="text-[#a1a1aa] font-normal">(optional)</span>
            </p>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Briefly describe what this workspace is for"
              rows={3}
              className="w-full text-[14px] text-[#171717] px-3 py-2 rounded-md bg-white outline-none resize-none"
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = "rgba(0,0,0,0.15) 0px 0px 0px 1px, rgba(59,130,246,0.3) 0px 0px 0px 3px"; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "rgba(0,0,0,0.08) 0px 0px 0px 1px"; }}
            />
          </div>

          <div style={{ height: "1px", background: "#f4f4f5" }} />

          {/* Cover image */}
          <div>
            <p className="text-[13px] font-medium text-[#444444] mb-2">
              Cover Image <span className="text-[#a1a1aa] font-normal">(optional)</span>
            </p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            <div className="flex items-center gap-3">
              <div className="rounded-lg shrink-0 overflow-hidden flex items-center justify-center" style={{ width: 64, height: 64, background: "#f4f4f5" }}>
                {coverImage
                  ? <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#c4c4c4]">
                      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.4" />
                      <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M3 15l5-4 4 4 3-2.5 6 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                }
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors"
                  style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
                >
                  Upload
                </button>
                {coverImage && (
                  <button
                    onClick={() => setCoverImage(null)}
                    className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
                    style={{ boxShadow: "rgba(220,38,38,0.2) 0px 0px 0px 1px" }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ height: "1px", background: "#f4f4f5" }} />

          {/* Default Agent Environment */}
          <div>
            <p className="text-[13px] font-medium text-[#444444] mb-0.5">
              Agent 진입 시 기본 환경
            </p>
            <p className="text-[12px] text-[#a1a1aa] mb-3">새 팀원이 Agent를 열 때 기본으로 보여줄 환경</p>
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
          </div>

          <div style={{ height: "1px", background: "#f4f4f5" }} />

          {/* Default Model */}
          <div>
            <p className="text-[13px] font-medium text-[#444444] mb-0.5">새 Agent 기본 모델</p>
            <p className="text-[12px] text-[#a1a1aa] mb-3">이 Workspace에서 새 Agent 생성 시 기본으로 선택되는 모델</p>
            <div className="space-y-2">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setDefaultModel(m.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all cursor-pointer"
                  style={{
                    border: defaultModel === m.id ? "1px solid #171717" : "1px solid rgba(0,0,0,0.08)",
                    background: defaultModel === m.id ? "#fafafa" : "#ffffff",
                  }}
                >
                  <div>
                    <p className="text-[14px] font-medium text-[#171717]">{m.label}</p>
                    <p className="text-[12px] text-[#a1a1aa]">{m.provider}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ border: `2px solid ${defaultModel === m.id ? "#171717" : "#d4d4d8"}` }}>
                    {defaultModel === m.id && <div className="w-2 h-2 rounded-full bg-[#171717]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 shrink-0 flex items-center justify-between" style={{ borderTop: "1px solid #f4f4f5" }}>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-md text-[14px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
          >
            Cancel
          </button>
          <button
            onClick={handleClose}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-md text-[14px] font-medium text-white hover:opacity-85 transition-opacity disabled:opacity-40"
            style={{ background: "#171717" }}
          >
            Create Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
