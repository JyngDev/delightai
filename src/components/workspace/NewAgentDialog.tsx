"use client";

import { useRef, useState } from "react";

const TEMPLATES = [
  { id: "blank",   label: "Blank",           desc: "Start from scratch with a clean slate" },
  { id: "support", label: "Customer Support", desc: "FAQ handling, order lookup, escalation" },
  { id: "sales",   label: "Sales Lead",       desc: "Lead qualification and handoff flow" },
  { id: "onboard", label: "Onboarding",       desc: "Guide new users through setup" },
  { id: "hr",      label: "HR Assistant",     desc: "Internal HR and policy Q&A" },
];

const MODELS = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "Anthropic" },
  { id: "claude-opus-4-7",   label: "Claude Opus 4.7",   provider: "Anthropic" },
  { id: "gpt-4o",            label: "GPT-4o",            provider: "OpenAI" },
  { id: "gemini-pro",        label: "Gemini Pro",        provider: "Google" },
];

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

export default function NewAgentDialog({ onClose }: Props) {
  const [closing, setClosing] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 240);
  }

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [template, setTemplate] = useState("blank");
  const [model, setModel] = useState(MODELS[0].id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slug = toSlug(name);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
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
            New Agent
          </h2>
          <button onClick={handleClose} className="text-[#a1a1aa] hover:text-[#171717] transition-colors cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto flex-1 space-y-6">

          {/* Name */}
          <div>
            <p className="text-[13px] font-medium text-[#444444] mb-1.5">
              Name <span className="text-[#dc2626]">*</span>
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Customer Support Bot"
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
              placeholder="Briefly describe what this agent does"
              rows={3}
              className="w-full text-[14px] text-[#171717] px-3 py-2 rounded-md bg-white outline-none resize-none"
              style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = "rgba(0,0,0,0.15) 0px 0px 0px 1px, rgba(59,130,246,0.3) 0px 0px 0px 3px"; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "rgba(0,0,0,0.08) 0px 0px 0px 1px"; }}
            />
          </div>

          <div style={{ height: "1px", background: "#f4f4f5" }} />

          {/* Image upload */}
          <div>
            <p className="text-[13px] font-medium text-[#444444] mb-2">
              Image <span className="text-[#a1a1aa] font-normal">(optional)</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: "#f4f4f5" }}
              >
                {image
                  ? <img src={image} alt="agent" className="w-full h-full object-cover" />
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#c4c4c4]">
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
                {image && (
                  <button
                    onClick={() => setImage(null)}
                    className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
                    style={{ boxShadow: "rgba(220,38,38,0.2) 0px 0px 0px 1px" }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#f4f4f5" }} />

          {/* Template */}
          <div>
            <p className="text-[13px] font-medium text-[#444444] mb-2">Start Template</p>
            <div className="space-y-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all"
                  style={{
                    border: template === t.id ? "1px solid #171717" : "1px solid rgba(0,0,0,0.08)",
                    background: template === t.id ? "#fafafa" : "#ffffff",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#171717]">{t.label}</p>
                    <p className="text-[13px] text-[#888888]">{t.desc}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ border: `2px solid ${template === t.id ? "#171717" : "#d4d4d8"}` }}>
                    {template === t.id && <div className="w-2 h-2 rounded-full bg-[#171717]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#f4f4f5" }} />

          {/* Model */}
          <div>
            <p className="text-[13px] font-medium text-[#444444] mb-2">
              Model <span className="text-[#a1a1aa] font-normal">(can be changed later)</span>
            </p>
            <div className="space-y-2">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all"
                  style={{
                    border: model === m.id ? "1px solid #171717" : "1px solid rgba(0,0,0,0.08)",
                    background: model === m.id ? "#fafafa" : "#ffffff",
                  }}
                >
                  <div>
                    <p className="text-[14px] font-medium text-[#171717]">{m.label}</p>
                    <p className="text-[12px] text-[#a1a1aa]">{m.provider}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ border: `2px solid ${model === m.id ? "#171717" : "#d4d4d8"}` }}>
                    {model === m.id && <div className="w-2 h-2 rounded-full bg-[#171717]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline info */}
          <div className="rounded-lg p-4" style={{ background: "#fafafa", boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
            <p className="text-[13px] font-semibold text-[#171717] mb-1">Starts in Development</p>
            <p className="text-[13px] text-[#888888]">
              All agents begin in Development. Promote to Staging and Production after testing.
            </p>
            <div className="flex items-center gap-2 mt-3">
              {["Development", "Staging", "Production"].map((env, i) => (
                <div key={env} className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: i === 0 ? "#171717" : "#f4f4f5",
                      color: i === 0 ? "#ffffff" : "#a1a1aa",
                    }}
                  >
                    {env}
                  </span>
                  {i < 2 && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 6h6M7 3l3 3-3 3" stroke="#d4d4d8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 shrink-0 flex items-center justify-between" style={{ borderTop: "1px solid #f4f4f5" }}>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-md text-[14px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
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
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}
