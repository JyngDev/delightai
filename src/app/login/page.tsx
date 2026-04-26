"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTRO_TEXT = "FC Barcelona";

function IntroScreen({ onDone }: { onDone: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "fading">("typing");

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(INTRO_TEXT.slice(0, i));
      if (i === INTRO_TEXT.length) {
        clearInterval(timer);
        setPhase("holding");
        setTimeout(() => {
          setPhase("fading");
          setTimeout(onDone, 550);
        }, 420);
      }
    }, 68);
    return () => clearInterval(timer);
  }, [onDone]);

  return (
    <>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white"
        style={{ opacity: phase === "fading" ? 0 : 1, transition: "opacity 550ms ease" }}
      >
        <p
          className="font-semibold text-[#171717] select-none"
          style={{ fontSize: "96px", letterSpacing: "-3px", lineHeight: 1 }}
        >
          {displayed}
          {phase === "typing" && (
            <span
              className="inline-block align-middle bg-[#171717]"
              style={{ width: "3px", height: "76px", marginLeft: "6px", animation: "blink 0.65s step-end infinite" }}
            />
          )}
        </p>
      </div>
    </>
  );
}

function SigningInOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div style={{ animation: "spin 0.55s linear infinite" }}>
        <Image src="/images/logo.svg" alt="Delight.AI" width={32} height={32} priority />
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  function handleSignIn() {
    setLoading(true);
    // Pre-set before navigation so ChatFAB hides on mount
    if (!sessionStorage.getItem("onboarding_done")) {
      sessionStorage.setItem("onboarding_shown", "1");
    }
    setTimeout(() => router.push("/org/fcbarcelona"), 960);
  }

  return (
    <>
      {!introComplete && <IntroScreen onDone={() => setIntroComplete(true)} />}
      {loading && <SigningInOverlay />}
      <div
        className="h-screen bg-white flex flex-col lg:flex-row overflow-hidden"
        style={{ opacity: introComplete ? 1 : 0, transition: "opacity 400ms ease" }}
      >

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center px-10 py-10 lg:py-0">
          <div className="w-full" style={{ maxWidth: "400px" }}>
            <Image src="/images/logo.svg" alt="Delight.AI" width={28} height={28} className="mb-3" />
            <h1 className="text-[24px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.4px" }}>
              Sign in
            </h1>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#4d4d4d]">Email</label>
                <input
                  type="email"
                  defaultValue="Jiyonglee@fcbarcelona.com"
                  className="w-full px-3 py-2.5 rounded-lg text-[14px] text-[#171717] placeholder-[#c4c4c4] outline-none transition-all"
                  style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "rgba(0,0,0,0.9) 0px 0px 0px 1px")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "rgba(0,0,0,0.08) 0px 0px 0px 1px")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#4d4d4d]">Password</label>
                <input
                  type="password"
                  defaultValue="x7k$mP2q"
                  className="w-full px-3 py-2.5 rounded-lg text-[14px] text-[#171717] placeholder-[#c4c4c4] outline-none transition-all"
                  style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "rgba(0,0,0,0.9) 0px 0px 0px 1px")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "rgba(0,0,0,0.08) 0px 0px 0px 1px")}
                />
              </div>

              <button
                onClick={handleSignIn}
                disabled={loading}
                className="mt-2 w-full py-2.5 rounded-lg text-[14px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60 cursor-pointer"
                style={{ background: "#171717" }}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
