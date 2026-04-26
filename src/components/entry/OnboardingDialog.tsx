"use client";

import { useRef, useState } from "react";

const STEPS = [
  {
    image: "/images/onboarding1.jpg",
    title: "안녕하세요. 프로덕트 디자이너 이지용입니다.",
    description:
      "클로드 코드를 활용해 복잡한 과제 정보를 구조화하고, 사용자 경험을 최적화한 대시보드 웹 서비스 Hi-fi 프로토타입을 구현했습니다.",
  },
  {
    image: "/images/onboarding2.jpg",
    title: "고객사 FC Barcelona의 데모를 준비했습니다.",
    description:
      "고객 참여형 채널부터 경기 데이터, 아카데미 등 다양한 채널에서 고객과의 소통을 하고 있는 상황을 가정했습니다.",
  },
  {
    image: "/images/onboarding3.jpg",
    title: "과제에 대해 무엇이든 물어보세요",
    description:
      "궁금하신 부분이 있다면 해당 버튼을 통해 과제 설계 방향에 대해 무엇이든 물어보고 확인할 수 있습니다.",
  },
];

const SLIDE_DURATION = 340;

// Burst particles — 8 directions
const PARTICLES = [
  { tx: -88, ty: -70, delay: 0,  size: 7 },
  { tx:   0, ty: -95, delay: 20, size: 6 },
  { tx:  85, ty: -72, delay: 10, size: 8 },
  { tx: -98, ty:   0, delay: 30, size: 6 },
  { tx:  96, ty:   0, delay: 5,  size: 7 },
  { tx: -80, ty:  75, delay: 25, size: 8 },
  { tx:   0, ty:  95, delay: 15, size: 6 },
  { tx:  82, ty:  72, delay: 0,  size: 7 },
];

// Smoke puffs — softer, blurred
const SMOKES = [
  { tx: -44, ty: -44, size: 54, delay: 0   },
  { tx:  44, ty: -44, size: 48, delay: 80  },
  { tx: -36, ty:  44, size: 52, delay: 40  },
  { tx:  40, ty:  38, size: 58, delay: 120 },
  { tx:   0, ty: -52, size: 44, delay: 60  },
];

type Phase = "open" | "morphing" | "orb" | "burst";

function StepContent({ s }: { s: typeof STEPS[number] }) {
  return (
    <>
      <div className="w-full shrink-0 overflow-hidden" style={{ height: "220px", background: "#f4f4f5" }}>
        <img src={`${s.image}?t=${Date.now()}`} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="px-8 pt-6 pb-6">
        <h2 className="text-[20px] font-semibold text-[#171717] leading-snug" style={{ letterSpacing: "-0.3px" }}>
          {s.title}
        </h2>
        <p className="mt-3 text-[14px] text-[#888888] leading-relaxed">{s.description}</p>
      </div>
    </>
  );
}

export default function OnboardingDialog() {
  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState<number | null>(null);
  const [dir, setDir] = useState<"next" | "back">("next");
  const [animating, setAnimating] = useState(false);
  const [phase, setPhase] = useState<Phase>("open");
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    const done = sessionStorage.getItem("onboarding_done");
    if (done) return false;
    sessionStorage.setItem("onboarding_shown", "1");
    return true;
  });

  if (!show) return null;

  const isLast = step === STEPS.length - 1;

  function navigate(direction: "next" | "back") {
    if (animating) return;
    setDir(direction);
    setPrevStep(step);
    setStep((s) => direction === "next" ? s + 1 : s - 1);
    setAnimating(true);
    setTimeout(() => { setPrevStep(null); setAnimating(false); }, SLIDE_DURATION);
  }

  function handleDone() {
    const el = dialogRef.current;
    const bd = backdropRef.current;
    if (!el) { setShow(false); return; }

    setPhase("morphing");

    // Shrink dialog to black circle at center
    const scale = 52 / el.offsetWidth;
    el.style.overflow = "hidden";
    el.style.transition = [
      "transform 460ms cubic-bezier(0.4,0,0.2,1)",
      "border-radius 460ms cubic-bezier(0.4,0,0.2,1)",
      "background 360ms 120ms ease",
      "box-shadow 200ms ease",
    ].join(", ");
    el.style.transform = `scale(${scale})`;
    el.style.borderRadius = "50%";
    el.style.background = "#171717";
    el.style.boxShadow = "none";

    if (bd) {
      bd.style.transition = "opacity 380ms ease";
      bd.style.opacity = "0";
    }

    // Hide shrunken dialog, show orb
    setTimeout(() => {
      if (el) el.style.opacity = "0";
      setPhase("orb");
    }, 480);

    // Burst
    setTimeout(() => setPhase("burst"), 960);

    // Done — dispatch FAB burst event
    setTimeout(() => {
      setShow(false);
      window.dispatchEvent(new CustomEvent("delight:fab-burst"));
    }, 1380);
  }

  return (
    <div className="fixed inset-0 z-10000" style={{ pointerEvents: phase === "open" ? undefined : "none" }}>
      <style>{`
        @keyframes onboardIn   { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes exitLeft    { from{transform:translateX(0)}     to{transform:translateX(-100%)} }
        @keyframes exitRight   { from{transform:translateX(0)}     to{transform:translateX(100%)}  }
        @keyframes enterRight  { from{transform:translateX(100%)}  to{transform:translateX(0)}     }
        @keyframes enterLeft   { from{transform:translateX(-100%)} to{transform:translateX(0)}     }
        @keyframes orbAppear   { from{opacity:0;transform:translate(-50%,-50%) scale(0.6)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes iconFadeIn  { from{opacity:0;transform:scale(0.4)} to{opacity:1;transform:scale(1)} }
        @keyframes orbExplode  { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 45%{transform:translate(-50%,-50%) scale(1.7);opacity:1} 100%{transform:translate(-50%,-50%) scale(0.1);opacity:0} }
        @keyframes partShoot   { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0)} }
        @keyframes smokeExpand { 0%{opacity:0.55;transform:translate(var(--tx),var(--ty)) scale(0.15);filter:blur(3px)} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(1.6);filter:blur(14px)} }
      `}</style>

      {/* Backdrop */}
      <div ref={backdropRef} className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} />

      {/* Dialog */}
      <div className="flex items-center justify-center absolute inset-0">
        <div
          ref={dialogRef}
          className="relative bg-white rounded-2xl flex flex-col"
          style={{
            width: "480px",
            boxShadow: "rgba(0,0,0,0.16) 0px 24px 48px, rgba(0,0,0,0.08) 0px 0px 0px 1px",
            animation: "onboardIn 220ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div className="overflow-hidden rounded-t-2xl" style={{ position: "relative" }}>
            {prevStep !== null && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 1,
                animation: `${dir === "next" ? "exitLeft" : "exitRight"} ${SLIDE_DURATION}ms cubic-bezier(0.25,0.46,0.45,0.94) both`,
              }}>
                <StepContent s={STEPS[prevStep]} />
              </div>
            )}
            <div key={step} style={{
              position: prevStep !== null ? "relative" : undefined,
              zIndex: 2,
              animation: prevStep !== null
                ? `${dir === "next" ? "enterRight" : "enterLeft"} ${SLIDE_DURATION}ms cubic-bezier(0.25,0.46,0.45,0.94) both`
                : undefined,
            }}>
              <StepContent s={STEPS[step]} />
            </div>
          </div>

          <div className="px-8 py-5 flex items-center justify-between shrink-0" style={{ borderTop: "1px solid #f4f4f5" }}>
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span key={i} className="rounded-full transition-all duration-300"
                  style={{ width: i === step ? "20px" : "6px", height: "6px", background: i === step ? "#171717" : "#e4e4e7" }} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button onClick={() => navigate("back")} className="py-2 rounded-md text-[14px] font-medium text-[#666666] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                  style={{ width: "68px", boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
                  Back
                </button>
              )}
              <button onClick={() => isLast ? handleDone() : navigate("next")}
                className="py-2 rounded-md text-[14px] font-medium text-white hover:opacity-90 transition-opacity cursor-pointer"
                style={{ width: "68px", background: "#171717" }}>
                {isLast ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orb at center */}
      {(phase === "orb" || phase === "burst") && (
        <div style={{
          position: "fixed", left: "50%", top: "50%",
          width: "52px", height: "52px", borderRadius: "50%",
          background: "#171717",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10001,
          animation: phase === "burst"
            ? "orbExplode 380ms cubic-bezier(0.4,0,0.6,1) forwards"
            : "orbAppear 160ms cubic-bezier(0.16,1,0.3,1) forwards",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            style={{ animation: "iconFadeIn 200ms 60ms cubic-bezier(0.16,1,0.3,1) both" }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Center burst — particles */}
      {phase === "burst" && (
        <div style={{ position: "fixed", left: "50%", top: "50%", zIndex: 10002, pointerEvents: "none" }}>
          {PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: "absolute",
              width: `${p.size}px`, height: `${p.size}px`,
              borderRadius: "50%", background: "#171717",
              left: `-${p.size / 2}px`, top: `-${p.size / 2}px`,
              // @ts-ignore
              "--tx": `${p.tx}px`, "--ty": `${p.ty}px`,
              animation: `partShoot 440ms cubic-bezier(0.2,0,0.8,1) ${p.delay}ms both`,
            } as React.CSSProperties} />
          ))}
          {SMOKES.map((s, i) => (
            <div key={i} style={{
              position: "absolute",
              width: `${s.size}px`, height: `${s.size}px`,
              borderRadius: "50%",
              background: "rgba(80,80,80,0.35)",
              left: `-${s.size / 2}px`, top: `-${s.size / 2}px`,
              // @ts-ignore
              "--tx": `${s.tx}px`, "--ty": `${s.ty}px`,
              animation: `smokeExpand 700ms ease-out ${s.delay}ms both`,
            } as React.CSSProperties} />
          ))}
        </div>
      )}
    </div>
  );
}
