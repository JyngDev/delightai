"use client";

import Image from "next/image";
import Link from "next/link";

/* ─── Layout primitives ─── */

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-20">
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-[11px] font-semibold text-[#d4d4d8] shrink-0 w-5">{num}</span>
        <h2 className="text-[18px] font-semibold text-[#171717]" style={{ letterSpacing: "-0.3px" }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-2.5 py-1 rounded-md text-[12px] font-medium text-[#4d4d4d]"
      style={{ background: "#f4f4f5" }}>
      {children}
    </span>
  );
}

function Card({ children, tinted }: { children: React.ReactNode; tinted?: boolean }) {
  return (
    <div className={`rounded-xl p-5 ${tinted ? "bg-[#fafafa]" : ""}`}
      style={tinted ? {} : { boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2">{children}</p>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 items-start">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#d4d4d8] shrink-0" />
          <span className="text-[13px] text-[#4d4d4d] leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function VerifyRow({ req, status, note }: { req: string; status: "pass" | "partial"; note: string }) {
  return (
    <div className="flex gap-4 py-4 items-start" style={{ borderTop: "1px solid #f4f4f5" }}>
      <div className="shrink-0 mt-0.5">
        {status === "pass" ? (
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#dcfce7" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5.5l2 2 4-4" stroke="#16a34a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#fef9c3" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 3v3M5 7.5v.5" stroke="#a16207" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#171717] mb-0.5">{req}</p>
        <p className="text-[12px] text-[#a1a1aa] leading-relaxed">{note}</p>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function SolutionPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <div className="sticky top-0 z-10 bg-white" style={{ borderBottom: "1px solid #f4f4f5" }}>
        <div className="max-w-3xl mx-auto px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo.svg" alt="Delight.AI" width={18} height={18} />
            <span className="text-[13px] font-semibold text-[#171717]">Delight.AI</span>
          </div>
          <Link href="/org/fcbarcelona"
            className="flex items-center gap-1.5 text-[12px] text-[#a1a1aa] hover:text-[#171717] transition-colors">
            <span>프로토타입 보기</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-16">

        {/* Hero */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-6">
            <Tag>Product Design Assignment</Tag>
            <Tag>Sendbird · Delight.AI</Tag>
          </div>
          <h1 className="text-[34px] font-semibold text-[#171717] mb-4" style={{ letterSpacing: "-0.7px", lineHeight: 1.15 }}>
            AI 에이전트 관리 대시보드
          </h1>
          <p className="text-[15px] text-[#6b6b6b] leading-relaxed" style={{ maxWidth: "560px" }}>
            복수의 Workspace · Agent · 환경(Development / Staging / Production)을 동시에 관리하는 운영자를 위한 대시보드 설계 과제입니다. 설계 의도와 근거를 여기에 정리했습니다.
          </p>
        </div>

        {/* 01 — 문제 접근 */}
        <Section num="01" title="문제 접근">
          <p className="text-[14px] text-[#4d4d4d] leading-relaxed mb-6">
            과제를 받았을 때 가장 먼저 한 것은 "이 대시보드를 쓰는 사람이 하루에 실제로 무슨 일을 하는가"를 정의하는 것이었습니다. 기능 목록보다 사용자의 업무 맥락을 먼저 이해해야 IA(정보 구조)가 그 흐름을 따라갈 수 있다고 생각했습니다.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <Label>제품이 다루는 대상</Label>
              <p className="text-[13px] text-[#4d4d4d] leading-relaxed">
                AI 에이전트는 코드가 아닌 언어와 논리로 작동합니다. 프롬프트 한 줄의 변경이 즉각 실제 사용자 경험에 영향을 미칩니다. 일반 소프트웨어 배포보다 실수의 파급이 빠르고, 되돌리기 어렵습니다.
              </p>
            </Card>
            <Card>
              <Label>운영자가 하는 일</Label>
              <p className="text-[13px] text-[#4d4d4d] leading-relaxed">
                여러 팀(Workspace)의 여러 에이전트를 동시에 관리합니다. 각 에이전트는 개발 중인 버전과 실서비스 버전이 별도로 존재합니다. 이슈 발생 시 빠르게 원인을 찾고, 안전하게 수정 · 배포해야 합니다.
              </p>
            </Card>
          </div>
          <Card tinted>
            <p className="text-[13px] text-[#4d4d4d] leading-relaxed">
              이 두 가지를 결합하면 설계의 핵심 난이도가 보입니다. <span className="font-semibold text-[#171717]">운영자는 빠르게 움직여야 하는데, 빠르게 움직이다 실수하면 실제 사용자에게 즉시 영향이 갑니다.</span> 속도와 안전을 동시에 확보하는 구조를 만드는 것이 이 과제의 핵심 문제였습니다.
            </p>
          </Card>
        </Section>

        {/* 02 — 중심 축 및 원칙 */}
        <Section num="02" title="UX를 설계하기 위한 중심 축과 원칙">
          <p className="text-[14px] text-[#4d4d4d] leading-relaxed mb-6">
            문제를 분석한 결과, 운영자가 항상 동시에 인지해야 하는 세 가지 독립적인 축이 있었습니다. 이 축들이 화면에서 시각적으로 구분되지 않으면 사용자는 자신이 어느 맥락에 있는지 인식하지 못한 채 치명적인 실수를 범하게 됩니다.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { axis: "소속 축", q: "나는 지금 어느 팀의 어떤 에이전트를 보고 있나?", risk: "다른 팀의 에이전트를 수정", space: "좌측 사이드바" },
              { axis: "환경 축", q: "지금 개발 중인 버전인가, 실서비스 버전인가?", risk: "Production을 직접 편집", space: "파이프라인 패널" },
              { axis: "작업 축", q: "지금 뭘 하려는 중인가?", risk: "맥락 전환 시 작업 손실", space: "Console 탭" },
            ].map(({ axis, q, risk, space }) => (
              <Card key={axis}>
                <p className="text-[13px] font-semibold text-[#171717] mb-2">{axis}</p>
                <p className="text-[12px] text-[#4d4d4d] leading-relaxed mb-3">{q}</p>
                <div style={{ borderTop: "1px solid #f4f4f5" }} className="pt-2.5 mt-auto flex flex-col gap-1">
                  <p className="text-[11px] text-[#f97316]">혼동 시 → {risk}</p>
                  <p className="text-[11px] text-[#a1a1aa]">배치 → {space}</p>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-[13px] font-semibold text-[#171717] mb-3">이 분석에서 도출한 설계 원칙 4가지</p>
          <div className="flex flex-col" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px", borderRadius: "12px", overflow: "hidden" }}>
            {[
              ["공간 분리", "세 축을 화면의 물리적으로 다른 영역에 배치합니다. 레이블이나 색상만으로 구분하는 것은 충분하지 않습니다. 공간이 달라야 맥락이 분리됩니다."],
              ["구조적 안전", "위험한 행위는 경고 메시지가 아니라 선택지 자체를 없애는 방식으로 차단합니다. Production 편집 버튼을 숨기는 것이 팝업 경고보다 더 강력한 방어입니다."],
              ["계층 일관성", "Org → Workspace → Agent 각 계층에서 동일한 정보 패턴을 유지합니다. 사용자가 계층을 이동할 때마다 새로운 UI를 학습할 필요가 없어야 합니다."],
              ["이슈 전파 가시성", "이슈는 어느 계층에 있어도 보여야 합니다. Org Home에서 발견한 이슈를 한 번의 클릭으로 처리 화면에 도달할 수 있어야 합니다."],
            ].map(([title, desc], i, arr) => (
              <div key={title} className="flex gap-4 px-5 py-4"
                style={i < arr.length - 1 ? { borderBottom: "1px solid #f4f4f5" } : {}}>
                <p className="text-[13px] font-semibold text-[#171717] shrink-0 w-24">{title}</p>
                <p className="text-[13px] text-[#4d4d4d] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 03 — 가설 */}
        <Section num="03" title="나의 가설">
          <Card tinted>
            <p className="text-[15px] font-semibold text-[#171717] leading-relaxed mb-1" style={{ letterSpacing: "-0.2px" }}>
              "세 축을 물리적 공간으로 분리하고, 가장 위험한 행위를 구조적으로 불가능하게 만들면 — 운영자는 복잡한 다중 환경 맥락에서도 혼동 없이 빠르게 일할 수 있을 것이다."
            </p>
          </Card>
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex gap-4">
              <span className="text-[12px] font-semibold text-[#a1a1aa] shrink-0 w-6 mt-0.5">H1</span>
              <div>
                <p className="text-[13px] font-semibold text-[#171717] mb-1">공간 분리가 레이블 분리보다 효과적이다</p>
                <p className="text-[13px] text-[#4d4d4d] leading-relaxed">소속 · 환경 · 작업을 색상이나 텍스트 레이블로만 구분하면 사용자는 인지 부하가 높아질 때 놓칩니다. 사이드바(소속) / 파이프라인 패널(환경) / Console(작업)으로 물리적 위치를 달리하면 시선이 자연스럽게 각 축을 분리해서 읽게 됩니다.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-[12px] font-semibold text-[#a1a1aa] shrink-0 w-6 mt-0.5">H2</span>
              <div>
                <p className="text-[13px] font-semibold text-[#171717] mb-1">읽기 전용 UI가 권한 팝업보다 강력한 방어다</p>
                <p className="text-[13px] text-[#4d4d4d] leading-relaxed">권한 확인 팝업은 사용자가 반복 노출 시 습관적으로 통과합니다. Production Build 탭에서 편집 버튼 자체를 노출하지 않으면 실수가 발생할 수 없습니다. 설계는 실수를 막는 것이 아니라 일어날 수 없게 만들어야 합니다.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-[12px] font-semibold text-[#a1a1aa] shrink-0 w-6 mt-0.5">H3</span>
              <div>
                <p className="text-[13px] font-semibold text-[#171717] mb-1">탭 순서가 생애주기를 따를 때 사용자는 단계를 자연스럽게 인식한다</p>
                <p className="text-[13px] text-[#4d4d4d] leading-relaxed">Build → Test → Evaluate → Overview 순서는 에이전트 개발 생애주기와 동일합니다. 사용자가 현재 어느 단계에 있는지 명시적으로 표시하지 않아도 탭 위치가 암묵적으로 단계를 전달합니다.</p>
              </div>
            </div>
          </div>
        </Section>

        {/* 04 — 접근 방식 */}
        <Section num="04" title="접근 방식 — 인터랙티브 프로토타입">
          <div className="mb-6">
            <p className="text-[14px] text-[#4d4d4d] leading-relaxed">
              과제는 와이어프레임을 요구했지만, 정적 이미지로는 계층 전환 흐름과 환경 전환의 실제 동작을 전달하기 어렵다고 판단했습니다. 가설이 맞는지를 직접 확인하려면 클릭하고 이동하는 경험이 필요했습니다. 그래서 실제 라우팅과 상태 전환이 작동하는 인터랙티브 프로토타입을 구현하기로 결정했습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <Label>Claude Code를 선택한 이유</Label>
              <p className="text-[13px] text-[#4d4d4d] leading-relaxed">
                Figma로도 인터랙션을 구현할 수 있지만, 실제 데이터 구조와 환경 분기 로직을 표현하려면 코드가 더 적합했습니다. 직접 코딩 대신 Claude Code(AI 코딩 에이전트)를 주 구현 도구로 활용해 설계 의사결정에 집중하면서 구현 속도를 확보했습니다.
              </p>
            </Card>
            <Card>
              <Label>Harness Engineering</Label>
              <p className="text-[13px] text-[#4d4d4d] leading-relaxed">
                단순히 코드 생성을 요청하는 것을 넘어, AI가 일관된 품질로 반복 작업할 수 있는 실행 환경을 먼저 설계했습니다. "코드를 작성하는 개발자"가 아닌 "코드를 작성하는 AI를 관리하는 환경 설계자"로 역할을 전환했습니다.
              </p>
            </Card>
          </div>

          <p className="text-[13px] font-semibold text-[#171717] mb-3">문서 구조 설계</p>
          <p className="text-[13px] text-[#4d4d4d] leading-relaxed mb-5">
            문서를 두 레이어로 분리했습니다. 루트에 위치한 파일들은 AI의 실행 환경을 제어하고, <code className="text-[12px] bg-[#f4f4f5] px-1.5 py-0.5 rounded text-[#4d4d4d]">docs/</code> 하위 파일들은 제품 설계 의사결정을 기록합니다. 두 레이어는 서로 다른 독자와 목적을 가지며 혼합하지 않았습니다.
          </p>

          {/* Layer 1: AI harness files */}
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-3">Layer 1 — AI 실행 환경 (루트 레벨)</p>
            <div className="rounded-xl overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
              {[
                ["AGENTS.md", "사전 제약", "AI가 코드를 작성하기 전 반드시 읽어야 할 전제 조건. 잘못된 가정으로 시작하는 것을 막는 첫 번째 관문입니다."],
                ["DESIGN.md", "스타일 가이드", "색상 · 타이포그래피 · 컴포넌트 패턴 정의. 이 파일 없이는 AI가 작업마다 임의의 스타일을 선택해 일관성이 깨집니다."],
                ["CLAUDE.md", "프로젝트 규칙", "URL 구조 동결, formatVersion() 강제, 환경 색상 시스템, 알림 배치 원칙 등 설계 원칙을 실행 규칙으로 변환한 문서입니다."],
              ].map(([file, role, desc], i, arr) => (
                <div key={file} className="flex gap-4 px-5 py-4"
                  style={i < arr.length - 1 ? { borderBottom: "1px solid #f4f4f5" } : {}}>
                  <div className="shrink-0 w-28">
                    <p className="text-[12px] font-semibold text-[#171717] font-mono">{file}</p>
                    <p className="text-[11px] text-[#a1a1aa] mt-0.5">{role}</p>
                  </div>
                  <p className="text-[13px] text-[#4d4d4d] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Layer 2: Product docs */}
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-3">Layer 2 — 제품 설계 문서 (docs/)</p>
            <div className="rounded-xl overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>

              {/* PRD */}
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #f4f4f5" }}>
                <div className="flex gap-4">
                  <div className="shrink-0 w-28">
                    <p className="text-[12px] font-semibold text-[#171717] font-mono">docs/prd.md</p>
                    <p className="text-[11px] text-[#a1a1aa] mt-0.5">전체 PRD</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-[#4d4d4d] leading-relaxed mb-2">
                      제품 전체를 아우르는 최상위 요구사항 문서입니다. 페르소나 · IA · 핵심 설계 원칙 · 네비게이션 시스템 · 컴포넌트 라이브러리 · 권한 구조 · 기술 요구사항 · Out of Scope를 포함합니다. 모든 화면 스펙 문서의 상위 문서로 작동합니다.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["제품 개요 및 성공 지표", "페르소나 & 사용 시나리오", "정보 구조 (IA)", "핵심 설계 원칙 6가지", "네비게이션 시스템", "화면 명세 목록", "핵심 플로우", "권한 및 상태 정의"].map(tag => (
                        <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md text-[#4d4d4d]" style={{ background: "#f4f4f5" }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="px-5 py-4">
                <div className="flex gap-4">
                  <div className="shrink-0 w-28">
                    <p className="text-[12px] font-semibold text-[#171717] font-mono">docs/specs/</p>
                    <p className="text-[11px] text-[#a1a1aa] mt-0.5">화면별 스펙 & ADR</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-[#4d4d4d] leading-relaxed mb-4">
                      화면 영역별로 서브디렉토리를 분리했습니다. 각 디렉토리에는 해당 화면의 상세 스펙과 그 화면의 설계 과정에서 내린 의사결정 기록(ADR)이 함께 있습니다.
                    </p>

                    <div className="rounded-lg overflow-hidden text-[12px] font-mono leading-relaxed px-4 py-3.5" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
                      <p className="text-[#a1a1aa]">docs/specs/</p>
                      <p className="text-[#a1a1aa] pl-4">├── Organization/</p>
                      <p className="text-[#4d4d4d] pl-8">└── org-settings.md <span className="text-[#c4c4c4]">— Org Settings 화면 스펙</span></p>
                      <p className="text-[#a1a1aa] pl-4">├── workspace/</p>
                      <p className="text-[#4d4d4d] pl-8">├── workspace.md <span className="text-[#c4c4c4]">— Workspace Home 화면 스펙</span></p>
                      <p className="text-[#4d4d4d] pl-8">├── workspace_agent.md <span className="text-[#c4c4c4]">— Workspace 내 Agent 목록 스펙</span></p>
                      <p className="text-[#4d4d4d] pl-8">├── workspace_adr001.md <span className="text-[#c4c4c4]">— ADR-001: Agent 환경 상태 표시 방식</span></p>
                      <p className="text-[#4d4d4d] pl-8">├── workspace_adr002.md <span className="text-[#c4c4c4]">— ADR-002: Agent 카드 복합 상태 라벨링</span></p>
                      <p className="text-[#4d4d4d] pl-8">├── workspace_ard003.md <span className="text-[#c4c4c4]">— ADR-003: PulseDot 애니메이션 적용 기준</span></p>
                      <p className="text-[#4d4d4d] pl-8">└── workspace_adr004.md <span className="text-[#c4c4c4]">— ADR-004: 환경 인스턴스 단수 모델 채택</span></p>
                      <p className="text-[#a1a1aa] pl-4">└── agent/</p>
                      <p className="text-[#4d4d4d] pl-8">├── agent_prd001.md <span className="text-[#c4c4c4]">— Agent Home 화면 스펙 v0.1</span></p>
                      <p className="text-[#4d4d4d] pl-8">└── agent_prd002.md <span className="text-[#c4c4c4]">— Agent Home 화면 스펙 v0.2 (Overview 완전판)</span></p>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      {[
                        ["스펙 문서 (.md)", "각 화면의 공통 레이아웃, 컴포넌트 구성, 데이터 모델, 오픈 이슈를 정의합니다. PRD의 §8 화면 명세를 화면별로 세분화한 문서입니다."],
                        ["ADR (Architecture Decision Record)", "설계 과정에서 선택지가 복수였고 의사결정이 필요했던 지점을 기록합니다. 컨텍스트 → 선택지 → 결정 근거 구조로 작성해, 나중에 결정을 번복하거나 검토할 때 근거를 추적할 수 있도록 했습니다."],
                      ].map(([type, desc]) => (
                        <div key={type} className="flex gap-3">
                          <span className="text-[12px] font-semibold text-[#171717] shrink-0 w-44 mt-0.5">{type}</span>
                          <p className="text-[12px] text-[#4d4d4d] leading-relaxed">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Separation rationale */}
          <div className="rounded-xl p-5 bg-[#fafafa]">
            <p className="text-[12px] font-semibold text-[#171717] mb-2">두 레이어를 분리한 이유</p>
            <p className="text-[13px] text-[#4d4d4d] leading-relaxed">
              루트 레벨 MD 파일(AGENTS/DESIGN/CLAUDE)은 AI가 매 작업마다 자동으로 로드하는 실행 환경 설정입니다. 여기에 화면 스펙이나 ADR까지 포함하면 AI의 컨텍스트가 불필요하게 무거워지고, 관련 없는 내용이 작업에 섞입니다. 반면 <code className="text-[11px] bg-white px-1.5 py-0.5 rounded text-[#4d4d4d]" style={{ border: "1px solid #e4e4e7" }}>docs/</code>의 문서들은 AI가 특정 작업을 받았을 때 명시적으로 참조하도록 설계됐습니다. 레이어를 분리함으로써 AI는 항상 필요한 규칙만 자동 적용하고, 필요한 스펙은 작업 단위로 제공받는 구조가 됩니다.
            </p>
          </div>
        </Section>

        {/* 05 — 솔루션 */}
        <Section num="05" title="솔루션">

          {/* Workflow */}
          <p className="text-[13px] font-semibold text-[#171717] mb-3">전체 사용자 워크플로우</p>
          <p className="text-[13px] text-[#4d4d4d] leading-relaxed mb-5">
            운영자의 하루는 크게 두 가지 패턴으로 나뉩니다. 이슈 대응(반응적)과 에이전트 개발(능동적). 두 패턴 모두 동일한 계층 구조를 통과하지만 진입 지점과 종착지가 다릅니다. 이 두 경로를 모두 지원하는 구조를 설계했습니다.
          </p>

          <div className="rounded-xl p-5 mb-8" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[12px] font-semibold text-[#f97316] mb-3">이슈 대응 경로 (반응적)</p>
                <div className="flex flex-col gap-1.5">
                  {["Login → Org Home", "Active Issues 패널에서 이슈 발견", "클릭 → Agent Home (해당 환경 자동 선택)", "Overview 탭 알림 확인", "Build 탭 수정 → Save → Promote"].map((step, i, arr) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
                        {i < arr.length - 1 && <div className="w-px h-3 bg-[#f0f0f0]" />}
                      </div>
                      <p className="text-[12px] text-[#4d4d4d]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#6366f1] mb-3">에이전트 개발 경로 (능동적)</p>
                <div className="flex flex-col gap-1.5">
                  {["Login → Org Home / Workspace Home", "에이전트 선택 → Agent Home", "Dev 환경 선택", "Build → Test → Evaluate 반복", "검증 완료 → Promote to Staging → Promote to Production"].map((step, i, arr) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                        {i < arr.length - 1 && <div className="w-px h-3 bg-[#f0f0f0]" />}
                      </div>
                      <p className="text-[12px] text-[#4d4d4d]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Screen: Org Home */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="text-[15px] font-semibold text-[#171717]">Org Home</p>
              <code className="text-[11px] text-[#a1a1aa] bg-[#f4f4f5] px-2 py-0.5 rounded-md">/org/{"{orgSlug}"}</code>
            </div>
            <p className="text-[13px] text-[#a1a1aa] mb-4">조직 전체 현황을 파악하고, 이슈 발생 시 최단 경로로 처리 화면에 도달합니다.</p>
            <div className="rounded-xl overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
              <div className="px-5 py-4 bg-[#fafafa]" style={{ borderBottom: "1px solid #f4f4f5" }}>
                <p className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2">핵심 UX 설계 원칙</p>
                <p className="text-[13px] text-[#4d4d4d] leading-relaxed">
                  좌우 2컬럼으로 "흐름형 정보(좌)"와 "즉시 처리 정보(우)"를 분리했습니다. 좌측은 Org KPI → Workspace 목록 → Agent 목록 순으로 드릴다운하는 시선 흐름을 만들고, 우측 Active Issues는 스크롤과 무관하게 항상 고정되어 이슈를 놓치지 않도록 의도했습니다.
                </p>
              </div>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #f4f4f5" }}>
                <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2.5">기능 요구사항</p>
                <Bullets items={[
                  "조직 전체 KPI(대화량 · CSAT · 활성 에이전트 · 알림 수)를 7일 Sparkline 추세와 함께 표시합니다. 숫자 단독으로는 '좋은 건지 나쁜 건지' 판단이 불가능하기 때문입니다.",
                  "전체 Workspace를 목록으로 표시하고, 각 카드에서 에이전트 수 · 멤버 · 경고 상태를 전달합니다.",
                  "Active Issues 패널에 전 Workspace의 경고 에이전트를 severity 순으로 집계하고, 클릭 시 해당 Agent Home으로 직접 이동합니다.",
                ]} />
              </div>
              <div className="px-5 py-4">
                <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2.5">구성 요소</p>
                <Bullets items={[
                  "KPI 카드 × 4 (Conversations Today, Avg CSAT, Active Agents, Alerts) — Sparkline 포함",
                  "WorkspaceListItem — 멤버 아바타 스택, 에이전트 수, 경고 PulseDot, hover 진입 인터랙션",
                  "Active Issues 패널 — severity 배지, 환경 레이블, Agent Home 링크, 우측 고정",
                ]} />
              </div>
            </div>
          </div>

          {/* Screen: Workspace Home */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="text-[15px] font-semibold text-[#171717]">Workspace Home</p>
              <code className="text-[11px] text-[#a1a1aa] bg-[#f4f4f5] px-2 py-0.5 rounded-md">/org/{"{orgSlug}"}/ws/{"{wsSlug}"}</code>
            </div>
            <p className="text-[13px] text-[#a1a1aa] mb-4">팀 범위의 에이전트 상태를 비교하고 원하는 에이전트로 빠르게 진입합니다.</p>
            <div className="rounded-xl overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
              <div className="px-5 py-4 bg-[#fafafa]" style={{ borderBottom: "1px solid #f4f4f5" }}>
                <p className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2">핵심 UX 설계 원칙</p>
                <p className="text-[13px] text-[#4d4d4d] leading-relaxed">
                  Org Home과 동일한 KPI 포맷을 유지해 계층 이동 시 학습 비용을 없앴습니다. 각 에이전트 카드의 파이프라인 도트 3개(Dev / Staging / Prod)만으로 배포 현황을 즉시 파악할 수 있도록 설계했습니다. 경고 도트는 PulseDot(펄스 애니메이션)으로 교체해 '지금 이 순간에도 문제가 진행 중임'을 전달했습니다.
                </p>
              </div>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #f4f4f5" }}>
                <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2.5">기능 요구사항</p>
                <Bullets items={[
                  "Workspace 범위 KPI를 Org Home과 동일한 포맷으로 표시합니다.",
                  "에이전트 목록에서 Dev / Staging / Prod 배포 상태를 파이프라인 도트 3개로 요약합니다.",
                  "Grid / List 뷰 전환을 제공합니다. 에이전트가 많을수록 List가 밀도 있는 비교에 유리합니다.",
                  "알림 배너를 alertEnv 기준으로 필터링해 현재 맥락과 무관한 경고를 노출하지 않습니다.",
                ]} />
              </div>
              <div className="px-5 py-4">
                <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2.5">구성 요소</p>
                <Bullets items={[
                  "KPI 카드 × 4 — Workspace 범위 수치",
                  "AgentCard (Grid) / AgentListRow (List) — 파이프라인 도트, CSAT, 대화량, PulseDot",
                  "Grid / List 뷰 토글, 환경별 알림 배너, New Agent 모달 트리거",
                ]} />
              </div>
            </div>
          </div>

          {/* Screen: Agent Home */}
          <div className="mb-0">
            <div className="flex items-center gap-2.5 mb-1">
              <p className="text-[15px] font-semibold text-[#171717]">Agent Home</p>
              <code className="text-[11px] text-[#a1a1aa] bg-[#f4f4f5] px-2 py-0.5 rounded-md">/org/{"{orgSlug}"}/ws/{"{wsSlug}"}/agent/{"{agentSlug}"}</code>
            </div>
            <p className="text-[13px] text-[#a1a1aa] mb-4">에이전트의 개발 · 검증 · 배포 전체 생애주기를 환경 혼동 없이 수행합니다.</p>
            <div className="rounded-xl overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
              <div className="px-5 py-4 bg-[#fafafa]" style={{ borderBottom: "1px solid #f4f4f5" }}>
                <p className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2">핵심 UX 설계 원칙</p>
                <p className="text-[13px] text-[#4d4d4d] leading-relaxed">
                  진입 시 사이드바를 자동으로 접어 집중 작업 공간을 확보했습니다. 파이프라인 패널(환경)과 Console(작업)을 분리 배치해 두 축이 항상 동시에 보이도록 했습니다. Staging · Production Build 탭은 편집 버튼 자체를 제거한 읽기 전용 UI로 구조적 안전을 확보했습니다. Console 탭 순서는 에이전트 생애주기(Build → Test → Evaluate → Overview)를 따라 현재 단계를 탭 위치로 전달합니다.
                </p>
              </div>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #f4f4f5" }}>
                <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2.5">기능 요구사항</p>
                <Bullets items={[
                  "파이프라인 패널에서 환경을 선택하면 Console 전체가 해당 환경 기준으로 전환됩니다. 각 카드에 버전 · 배포자 · 건강 상태가 표시됩니다.",
                  "Staging / Production에서 Build 탭은 읽기 전용으로 강제됩니다(편집 버튼 미노출, 읽기 전용 배너 표시).",
                  "Build 탭 내 섹션(Prompt / Knowledge / Model / Tools)은 좌측 사이드가 아닌 상단 탭으로 처리합니다. 3분할 화면에서 추가 분할 방지입니다.",
                  "Model 선택은 드롭다운이 아닌 2×2 카드 그리드로 제공해 선택지를 동시에 비교할 수 있도록 했습니다.",
                  "Save / Promote 버튼은 탭 콘텐츠 하단에 배치해 해당 작업을 마친 후 배포하도록 흐름을 유도합니다.",
                ]} />
              </div>
              <div className="px-5 py-4">
                <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2.5">구성 요소</p>
                <Bullets items={[
                  "파이프라인 패널 — Dev / Staging / Prod 환경 카드, 버전 배지, 건강 상태 도트, Suspended 배지",
                  "Console 탭 바 — Overview / Build / Test / Evaluate",
                  "Overview 탭 — KPI 카드, Deployment History, Verification History, 환경별 알림 배너",
                  "Build 탭 — 상단 섹션 탭, Prompt Editor, Model 카드 그리드, 읽기 전용 배너, Save / Promote 버튼",
                  "Test · Evaluate 탭 — 스켈레톤 UI로 처리",
                ]} />
              </div>
            </div>
          </div>
        </Section>

        {/* 06 — 과제 요구사항 검증 */}
        <Section num="06" title="과제 요구사항 검증">
          <p className="text-[13px] text-[#4d4d4d] leading-relaxed mb-5">
            원본 과제 스펙 항목을 기준으로 프로토타입이 각 요구사항을 충족하는지 확인했습니다.
          </p>
          <div className="rounded-xl overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
            <div className="px-5">
              <VerifyRow
                req="제품 계층 구조의 명확한 시각화 및 사용자 흐름 최적화"
                status="pass"
                note="Org → Workspace → Agent 3계층이 사이드바, Breadcrumb, URL 구조로 일관되게 표현됩니다. 각 계층의 레이아웃은 해당 계층의 주 사용 패턴(조감 / 비교 / 집중 작업)에 맞게 별도로 설계됐습니다."
              />
              <VerifyRow
                req="복수의 Workspace와 AI Agent를 선택 가능한 초기 진입 경로 필수 설계"
                status="pass"
                note="Org Home에서 3개 Workspace와 각 Workspace의 에이전트 목록이 표시됩니다. 사이드바에서도 Workspace 간 직접 이동이 가능합니다. Active Issues에서 에이전트로 1클릭 진입도 지원합니다."
              />
              <VerifyRow
                req="각 Agent별 환경(Development / Staging / Production) 관리 구조 포함"
                status="pass"
                note="Agent Home 파이프라인 패널에서 환경을 선택하면 Console 전체가 해당 환경으로 전환됩니다. 각 환경의 버전 · 배포자 · 건강 상태가 표시되고, Staging · Production에서는 Build 탭이 읽기 전용으로 강제됩니다."
              />
              <VerifyRow
                req="핵심 계층 외 세부 요소 스켈레톤 UI 처리"
                status="pass"
                note="Test 탭, Evaluate 탭 세부 분석, Settings 탭 일부 섹션을 스켈레톤 처리했습니다. 핵심 흐름(탐색 → 환경 선택 → Build → Promote)은 완전히 동작합니다."
              />
            </div>
          </div>
        </Section>

        {/* 07 — UX 리스크 대응 검증 */}
        <Section num="07" title="UX 리스크 대응 검증">
          <p className="text-[13px] text-[#4d4d4d] leading-relaxed mb-5">
            설계 초기에 정의한 3가지 리스크 축이 실제로 구조적으로 차단되었는지, 그리고 주요 태스크 경로가 의도한 대로 작동하는지 확인했습니다.
          </p>

          <p className="text-[12px] font-semibold text-[#a1a1aa] mb-2 uppercase tracking-wide">리스크 차단 검증</p>
          <div className="rounded-xl overflow-hidden mb-6" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
            <div className="px-5">
              <VerifyRow
                req="소속 혼동 — 다른 팀의 에이전트를 수정하는 실수"
                status="pass"
                note="사이드바 현재 선택 표시, Breadcrumb의 Workspace 이름, Agent Home 헤더의 소속 정보가 현재 맥락을 3중으로 표시합니다. 소속 변경은 사이드바 또는 Org Home을 통해서만 가능합니다."
              />
              <VerifyRow
                req="환경 혼동 — Production을 Development로 오인하고 편집하는 실수"
                status="pass"
                note="Production · Staging Build 탭은 편집 버튼이 없고 읽기 전용 배너가 상단에 표시됩니다. 파이프라인 패널에서 선택된 환경이 항상 강조 표시되며, 환경별 색상 시스템(yellow · orange · green)이 일관되게 적용됩니다."
              />
              <VerifyRow
                req="작업 혼동 — 맥락 전환 시 현재 작업 단계를 잃는 실수"
                status="pass"
                note="사이드바 자동 접힘으로 집중 모드를 시각화했습니다. 파이프라인 패널 선택이 유지되는 동안 탭 전환이 가능하고, Console 탭 위치가 현재 생애주기 단계를 암시합니다."
              />
            </div>
          </div>

          <p className="text-[12px] font-semibold text-[#a1a1aa] mb-2 uppercase tracking-wide">핵심 태스크 경로 검증</p>
          <div className="rounded-xl overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
            <div className="px-5">
              <VerifyRow
                req="이슈 발견 → 처리: Org Home Active Issues → Agent Home 해당 환경 → 알림 확인"
                status="pass"
                note="Active Issues 항목 클릭 시 해당 에이전트의 경고 환경이 선택된 상태로 직접 진입됩니다. Overview 탭 알림 배너가 최상단에 노출됩니다."
              />
              <VerifyRow
                req="에이전트 개발 → 배포: Dev Build 편집 → Save → Promote to Staging → Promote to Production"
                status="pass"
                note="Development에서만 Build 탭 편집이 가능하고, 탭 하단 Save / Promote 버튼으로 단계적 배포가 가능합니다. 단방향 Promote 흐름만 허용됩니다."
              />
              <VerifyRow
                req="Workspace 간 이동: 사이드바 또는 Org Home에서 다른 Workspace로 전환"
                status="pass"
                note="사이드바 Workspace 목록에서 직접 전환 가능하고, Org Home의 Workspace 카드 클릭으로도 진입됩니다."
              />
              <VerifyRow
                req="Suspended 에이전트 식별: 목록에서 비활성 인스턴스를 즉시 인지"
                status="pass"
                note="Suspended 인스턴스는 회색 도트로 표시됩니다. Agent Home 파이프라인 패널에서도 Suspended 배지가 별도 표시됩니다."
              />
            </div>
          </div>
        </Section>

        {/* 08 — 부족한 부분 및 향후 */}
        <Section num="08" title="지금 설계의 부족한 부분과 향후 대응 방안">
          <p className="text-[13px] text-[#4d4d4d] leading-relaxed mb-5">
            프로토타입 범위에서 구조와 원칙을 확립했지만, 실제 서비스로 발전하려면 채워야 할 영역이 남아 있습니다. 솔직하게 정리했습니다.
          </p>
          <div className="flex flex-col gap-4">
            {[
              {
                area: "Promote Dialog — 변경 Diff와 배포 전 체크리스트",
                current: "버튼 위치와 단방향 흐름은 확립됐지만, 실제 어떤 내용이 바뀌는지 Diff를 보여주는 화면이 없습니다. 운영자는 '무엇이 올라가는지'를 확인하지 못한 채 배포하게 됩니다.",
                plan: "변경된 프롬프트 항목을 before/after로 비교하는 Diff 뷰, 배포 전 체크리스트(테스트 통과 여부 · 변경 요약 확인) 흐름을 추가해야 합니다."
              },
              {
                area: "Evaluate 탭 — 실제 대화 데이터 기반 품질 분석",
                current: "탭 구조와 KPI 카드 수준까지만 구현됐습니다. 어떤 의도가 자주 실패하는지, 어떤 세션에서 이탈이 일어나는지 분석할 수 없습니다.",
                plan: "Top Failed Intents, 세션별 대화 리뷰, CSAT 트렌드 차트, 버전 간 품질 비교 뷰가 필요합니다. 이 탭이 완성되어야 Build → Test → Evaluate → Improve 루프가 닫힙니다."
              },
              {
                area: "실시간 알림 및 모니터링 연결",
                current: "알림 구조와 표시 위치는 완성됐지만, 현재는 Mock 데이터로 대체했습니다. 실제 에이전트 상태 변화가 즉시 반영되지 않습니다.",
                plan: "WebSocket 또는 SSE 기반의 실시간 상태 스트림을 연결하고, 임계치 초과 시 PulseDot이 즉시 활성화되는 파이프라인이 필요합니다."
              },
              {
                area: "에이전트 버전 간 비교 뷰",
                current: "현재 어떤 버전이 각 환경에 배포되어 있는지는 확인할 수 있지만, Dev v1.4와 Prod v1.2의 실제 차이를 나란히 비교하는 화면이 없습니다.",
                plan: "파이프라인 패널에서 두 환경을 동시에 선택해 프롬프트 Diff를 나란히 보여주는 Compare 모드를 추가하면 배포 결정의 근거가 강화됩니다."
              },
            ].map(({ area, current, plan }) => (
              <div key={area} className="rounded-xl overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 0px 0px 1px" }}>
                <div className="px-5 py-3.5 bg-[#fafafa]" style={{ borderBottom: "1px solid #f4f4f5" }}>
                  <p className="text-[13px] font-semibold text-[#171717]">{area}</p>
                </div>
                <div className="grid grid-cols-2" style={{ borderBottom: undefined }}>
                  <div className="px-5 py-4" style={{ borderRight: "1px solid #f4f4f5" }}>
                    <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2">현재 상태</p>
                    <p className="text-[13px] text-[#4d4d4d] leading-relaxed">{current}</p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide mb-2">향후 대응 방안</p>
                    <p className="text-[13px] text-[#4d4d4d] leading-relaxed">{plan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="pt-10" style={{ borderTop: "1px solid #f4f4f5" }}>
          <p className="text-[14px] font-semibold text-[#171717] mb-2" style={{ letterSpacing: "-0.2px" }}>
            이 과제에서 일관되게 추구한 것은 하나였습니다 — 소속 · 환경 · 작업이라는 세 독립적인 축을 하나의 화면에서 혼동 없이 다룰 수 있는 구조를 만드는 것.
          </p>
          <p className="text-[13px] text-[#a1a1aa] mt-3">
            이지용 · Product Designer · 2026
          </p>
        </div>

      </div>
    </div>
  );
}
