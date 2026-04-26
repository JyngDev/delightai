"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";

interface Message {
  id: number;
  role: Role;
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 0,
    role: "assistant",
    text: "안녕하세요! 프로덕트 디자이너 이지용입니다. 과제에 대한 궁금한 부분이 있으면 물어봐주세요!",
  },
];

let idSeq = 1;

// FAB burst particles
const FAB_PARTICLES = [
  { tx: -70, ty: -55, delay: 0,  size: 6 },
  { tx:   0, ty: -78, delay: 20, size: 5 },
  { tx:  68, ty: -58, delay: 10, size: 7 },
  { tx: -80, ty:   0, delay: 30, size: 5 },
  { tx:  78, ty:   0, delay: 5,  size: 6 },
  { tx: -65, ty:  60, delay: 25, size: 7 },
  { tx:   0, ty:  78, delay: 15, size: 5 },
  { tx:  68, ty:  58, delay: 0,  size: 6 },
];

const FAB_SMOKES = [
  { tx: -36, ty: -36, size: 46, delay: 0   },
  { tx:  36, ty: -36, size: 40, delay: 70  },
  { tx: -30, ty:  36, size: 44, delay: 35  },
  { tx:  36, ty:  30, size: 50, delay: 110 },
];

export default function ChatFAB() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fabBurst, setFabBurst] = useState(false);
  const [fabReady, setFabReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    // Client-only: check if FAB should be immediately visible
    const shown = sessionStorage.getItem("onboarding_shown");
    const done = sessionStorage.getItem("onboarding_done");
    if (!shown || !!done) setFabReady(true);
  }, []);

  useEffect(() => {
    function onFabBurst() {
      sessionStorage.setItem("onboarding_done", "1");
      setFabReady(true);
      setFabBurst(true);
      const el = fabRef.current;
      if (el) {
        el.style.animation = "none";
        void el.offsetHeight;
        el.style.animation = "fabBurstIn 600ms cubic-bezier(0.16,1,0.3,1) forwards";
      }
      setTimeout(() => setFabBurst(false), 900);
    }
    window.addEventListener("delight:fab-burst", onFabBurst);
    return () => window.removeEventListener("delight:fab-burst", onFabBurst);
  }, []);

  function stripMarkdown(text: string) {
    return text
      .replace(/#{1,6}\s*/g, "")        // ## 헤더
      .replace(/\*\*(.*?)\*\*/g, "$1")  // **bold**
      .replace(/\*(.*?)\*/g, "$1")      // *italic*
      .replace(/`{1,3}[^`]*`{1,3}/g, "") // `code`
      .replace(/^\s*[-|]\s*/gm, "")    // - 리스트, | 표
      .replace(/\n{3,}/g, "\n\n")       // 과도한 줄바꿈
      .trim();
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { id: idSeq++, role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    const assistantId = idSeq++;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

      setLoading(false);
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, text: m.text + chunk } : m)
        );
      }
    } catch {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", text: "오류가 발생했습니다. 다시 시도해주세요." },
      ]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const [closing, setClosing] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 200);
  }

  if (pathname === "/login") return null;

  return (
    <>
      <style>{`
        @keyframes chatIn {
          from { opacity:0; transform:scale(0.96) translateY(12px); }
          to   { opacity:1; transform:scale(1)    translateY(0);     }
        }
        @keyframes chatOut {
          from { opacity:1; transform:scale(1)    translateY(0);     }
          to   { opacity:0; transform:scale(0.96) translateY(16px);  }
        }
        @keyframes fabPop {
          from { opacity:0; transform:scale(0.8); }
          to   { opacity:1; transform:scale(1);   }
        }
        @keyframes fabBurstIn {
          0%   { transform:scale(0);    opacity:0; }
          45%  { transform:scale(1.3);  opacity:1; }
          65%  { transform:scale(0.88); opacity:1; }
          82%  { transform:scale(1.08); }
          100% { transform:scale(1);    opacity:1; }
        }
        @keyframes partShoot {
          0%   { opacity:1; transform:translate(0,0) scale(1); }
          100% { opacity:0; transform:translate(var(--tx),var(--ty)) scale(0); }
        }
        @keyframes smokeExpand {
          0%   { opacity:0.55; transform:translate(var(--tx),var(--ty)) scale(0.15); filter:blur(3px); }
          100% { opacity:0;    transform:translate(var(--tx),var(--ty)) scale(1.6);  filter:blur(14px); }
        }
        .chat-panel-in  { animation: chatIn  200ms cubic-bezier(0.16,1,0.3,1); }
        .chat-panel-out { animation: chatOut 200ms cubic-bezier(0.4,0,1,1) forwards; }
        .chat-fab   { animation: fabPop 240ms cubic-bezier(0.16,1,0.3,1); }
        @keyframes gradientShift {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes arrowBounce {
          0%, 100% { transform: translateX(0);    opacity: 1;    }
          40%       { transform: translateX(4px);  opacity: 1;    }
          60%       { transform: translateX(4px);  opacity: 0.5;  }
          80%       { transform: translateX(0);    opacity: 0.5;  }
        }
      `}</style>

      {/* Chat Panel */}
      {(open || closing) && fabReady && (
        <div
          className={`${closing ? "chat-panel-out" : "chat-panel-in"} fixed z-9999 flex flex-col bg-white rounded-2xl overflow-hidden`}
          style={{
            right: "24px", bottom: "88px",
            width: "380px", height: "600px",
            boxShadow: "rgba(0,0,0,0.14) 0px 24px 48px, rgba(0,0,0,0.08) 0px 0px 0px 1px",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 shrink-0" style={{ borderBottom: "1px solid #f4f4f5" }}>
            <Image src="/images/logo.svg" alt="Delight.AI" width={20} height={20} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#171717]">Delight.AI Assistant</p>
              <p className="text-[11px] text-[#a1a1aa]">이지용 프로덕트 디자이너 과제</p>
            </div>
            <button onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[#a1a1aa] hover:text-[#171717] hover:bg-[#f4f4f5] transition-colors cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Solution link */}
          <Link href="/solution" target="_blank"
            className="flex items-center justify-between px-4 py-2.5 hover:bg-[#fafafa] transition-colors shrink-0"
            style={{ borderBottom: "1px solid #f4f4f5" }}>
            <span className="text-[12px] font-medium" style={{
              background: "linear-gradient(90deg, #171717 0%, #6366f1 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% 100%",
              animation: "gradientShift 3s ease infinite",
            }}>과제 설계 문서 보기</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#a1a1aa]"
              style={{ animation: "arrowBounce 1.4s ease-in-out infinite" }}>
              <path d="M2.5 6h7M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Messages */}
          <div className="overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ height: "480px" }}>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full shrink-0 mr-2 mt-0.5 overflow-hidden">
                    <Image src="/images/profile_jiyonglee.png" alt="" width={24} height={24} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="max-w-[75%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed"
                  style={m.role === "user"
                    ? { background: "#171717", color: "#fff", borderBottomRightRadius: "6px" }
                    : { background: "#f4f4f5", color: "#171717", borderBottomLeftRadius: "6px" }}>
                  {m.role === "assistant" ? stripMarkdown(m.text) : m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full shrink-0 mr-2 mt-0.5 overflow-hidden">
                  <Image src="/images/profile_jiyonglee.png" alt="" width={24} height={24} className="w-full h-full object-cover" />
                </div>
                <div className="px-3 py-2.5 rounded-2xl flex items-center gap-1" style={{ background: "#f4f4f5", borderBottomLeftRadius: "6px" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="block w-1.5 h-1.5 rounded-full bg-[#a1a1aa]"
                      style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                  <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 pb-3">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="메시지를 입력하세요..." rows={1}
                className="flex-1 resize-none text-[13px] text-[#171717] placeholder-[#c4c4c4] outline-none bg-transparent leading-relaxed"
                style={{ maxHeight: "96px", overflowY: "auto" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 96) + "px";
                }} />
              <button onClick={send} disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity cursor-pointer shrink-0 mb-0.5"
                style={{ background: "#171717", opacity: !input.trim() || loading ? 0.3 : 1 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1 12L12 6.5L1 1v4.5l7.5 2L1 7.5V12z" fill="white" />
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] text-[#c4c4c4] mt-1.5">Enter로 전송 · Shift+Enter 줄바꿈</p>
          </div>
        </div>
      )}

      {/* FAB burst effects & button — hidden until onboarding done */}
      {fabBurst && fabReady && (
        <div className="fixed z-9998 pointer-events-none"
          style={{ right: "24px", bottom: "24px", width: "52px", height: "52px" }}>
          {FAB_PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: "absolute",
              width: `${p.size}px`, height: `${p.size}px`,
              borderRadius: "50%", background: "#171717",
              left: `${26 - p.size / 2}px`, top: `${26 - p.size / 2}px`,
              // @ts-ignore
              "--tx": `${p.tx}px`, "--ty": `${p.ty}px`,
              animation: `partShoot 460ms cubic-bezier(0.2,0,0.8,1) ${p.delay}ms both`,
            } as React.CSSProperties} />
          ))}
          {FAB_SMOKES.map((s, i) => (
            <div key={i} style={{
              position: "absolute",
              width: `${s.size}px`, height: `${s.size}px`,
              borderRadius: "50%",
              background: "rgba(80,80,80,0.32)",
              left: `${26 - s.size / 2}px`, top: `${26 - s.size / 2}px`,
              // @ts-ignore
              "--tx": `${s.tx}px`, "--ty": `${s.ty}px`,
              animation: `smokeExpand 720ms ease-out ${s.delay}ms both`,
            } as React.CSSProperties} />
          ))}
        </div>
      )}

      {/* FAB */}
      {fabReady && <button
        ref={fabRef}
        onClick={() => setOpen((v) => !v)}
        className="chat-fab fixed z-9999 flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-105 active:scale-95"
        style={{
          right: "24px", bottom: "24px",
          width: "52px", height: "52px",
          background: "#171717",
          boxShadow: "rgba(0,0,0,0.2) 0px 8px 24px",
        }}
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1 1l14 14M15 1L1 15" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>}
    </>
  );
}
