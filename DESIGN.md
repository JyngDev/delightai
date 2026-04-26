# Design System — Delight.ai Dashboard

> Vercel의 디자인 철학을 기반으로, Delight.ai 대시보드에 맞게 확장한 시스템.
> 새 컴포넌트 작성 전 반드시 이 문서를 읽고 기존 패턴을 따를 것.

---

## 1. Visual Theme & Atmosphere

Vercel의 디자인 시스템을 기반으로 한다. 압도적인 흰 캔버스(`#ffffff`)와 near-black(`#171717`) 텍스트, 보더 대신 shadow를 사용하는 철학을 그대로 계승한다.

**핵심 원칙**:
- 보더 대신 `box-shadow: rgba(0,0,0,0.08) 0px 0px 0px 1px` (shadow-as-border)
- 3가지 font weight만: 400(body), 500(UI), 600(heading)
- 색상은 기능적, 장식적 사용 금지
- near-black(`#171717`)을 primary 컬러로 — 순수 black(`#000000`) 사용 금지

---

## 2. Color Palette

### Primary
- **Near-Black** (`#171717`): Primary text, headings, CTA 버튼 배경, 선택 상태 border
- **Pure White** (`#ffffff`): Page background, card surfaces

### Neutral Scale

| Token | Value | 용도 |
|-------|-------|------|
| Gray 900 | `#171717` | Primary text, headings |
| Gray 700 | `#4d4d4d` | Form label |
| Gray 600 | `#666666` | Secondary text, muted |
| Gray 500 | `#888888` | Inactive tab, placeholder |
| Gray 400 | `#a1a1aa` | Meta text, timestamps |
| Gray 300 | `#d4d4d8` | Inactive dot, divider icon |
| Gray 200 | `#e4e4e7` | Toggle off background |
| Gray 150 | `#f0f0f0` | Divider line (tab border-bottom 등) |
| Gray 100 | `#f4f4f5` | Hover background, inner divider |
| Gray 50  | `#fafafa` | Subtle surface, table header bg |

### Environment Colors (변경 금지)

| 환경 | Dot | Text | 배경(배너) | Ring |
|------|-----|------|------------|------|
| Development | `#eab308` | `#a16207` | `#fefce8` | `rgba(234,179,8,0.2)` |
| Staging | `#f97316` | `#c2410c` | `#fff7ed` | `rgba(249,115,22,0.2)` |
| Production | `#16a34a` | `#15803d` | `#f0fdf4` | `rgba(22,163,74,0.2)` |
| Suspended | `#a1a1aa` | `#a1a1aa` | — | — |
| Inactive | `#d4d4d8` | `#d4d4d8` | — | — |

### Semantic Colors

| 용도 | Value |
|------|-------|
| Error / Critical | `#dc2626` |
| Warning alert bg | `#fff1f2` |
| Warning alert ring | `rgba(220,38,38,0.15)` |
| Info alert bg | `#f8faff` |
| Info alert ring | `rgba(99,102,241,0.15)` |
| Success text | `#15803d` |
| Success bg | `#f0fdf4` |
| Amber (dev action) | `#a16207` / `#eab308` |
| Indigo (accent) | `#6366f1` |

### Shadows

| Level | Value | 용도 |
|-------|-------|------|
| Border | `rgba(0,0,0,0.08) 0px 0px 0px 1px` | 카드, 인풋 기본 보더 |
| Border hover | `rgba(0,0,0,0.12) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 6px 12px` | 카드 hover |
| Border strong | `rgba(0,0,0,0.20) 0px 0px 0px 1px` | 파이프라인 카드 hover |
| Selected | `0 0 0 1.5px #171717` | 선택된 항목 (Model 카드 등) |
| Pipeline selected | `0 0 0 1px #171717` | 파이프라인 환경 카드 선택 |
| Card hover | `rgba(0,0,0,0.12) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 6px 12px` | AgentCard hover |

---

## 3. Typography

### Font
- **Primary**: Geist Sans (fallback: system-ui, Arial)
- **Monospace**: Geist Mono (코드, 기술 레이블)

### 주요 타입 스케일 (앱 UI 기준)

| 역할 | Size | Weight | Color | 용도 |
|------|------|--------|-------|------|
| Page/Section Title | 20px | 600 | `#171717` | Overview 섹션 헤더 (`h3`) |
| Agent Name | 16px | 600 | `#171717` | AgentCard 이름 |
| Body / Label | 14px | 400–500 | `#171717` | 일반 콘텐츠, 폼 레이블 값 |
| Form Label | 14px | 500 | `#4d4d4d` | 인풋 레이블 (`mb-3`) |
| Meta / Sub | 12px | 400 | `#a1a1aa` | 타임스탬프, 보조 정보 |
| Section Header Label | 11px | 600 | `#a1a1aa` | 소섹션 그룹 헤더 (`capitalize tracking-wide`) |
| Alert Label | 11px | 600 | 환경색 | 알림 severity 뱃지 |

### 금지 사항
- `uppercase` Tailwind 클래스 사용 금지 → `capitalize` 사용
- `text-[13px]` 이하 body 텍스트 금지 → 최소 `text-[14px]`

---

## 4. Layout Principles

### App Shell

```
┌──────────────────────────────────────────────────────┐
│ Sidebar (56px collapsed / 280px expanded)            │
│ + Main Content Area (flex-1)                         │
└──────────────────────────────────────────────────────┘
```

### Sidebar

- **기본 너비**: 280px (min: 220px, max: 400px, 드래그 리사이즈 가능)
- **접힌 너비**: 56px
- **로고 행 높이**: `h-12` + `borderBottom: "1px solid #f4f4f5"`
- Nav 아이템 간격: `space-y-3` (12px)
- 아이콘 박스: `w-5 h-5 rounded-md` — **배경색 없음**

#### 자동 접힘 트리거
- 에이전트 페이지(`/agent/[slug]`) 진입
- Settings 페이지 진입

#### 접힘 애니메이션
- width: `220ms cubic-bezier(0.4, 0, 0.2, 1)`
- 컨텐츠 fade: `opacity 120ms ease`
- 순서 (닫힐 때): fade out → width 축소 / (열릴 때): width 확장 → fade in

### Breadcrumb Row

- 높이: `h-12` (사이드바 로고 행과 동일)
- Border: `borderBottom: "1px solid #f4f4f5"`
- 폰트: `text-[12px]`
- 구분자: `/` (`text-[#d4d4d8]`)
- 현재 위치: `text-[#171717] font-medium`
- 상위 경로: `text-[#a1a1aa] hover:text-[#555555]`

### Spacing

- 기본 단위: 8px
- 섹션 간 여백: `mb-10` (40px)
- 카드 내부 패딩: `px-5 py-4` (일반), `px-4 py-3` (컴팩트)
- 콘텐츠 영역 패딩: `px-8 pt-2 pb-8`

---

## 5. Component Patterns

### AgentCard (Workspace Home)

```
┌─────────────────────────────────┐
│ Agent Name          [alert dot] │
│ description text (max 2 lines)  │
│ ─────────────────────────────── │
│ ● Development     Version X.X   │
│ ● Staging         Version X.X   │
│ ● Production      Version X.X   │
│ ─────────────────────────────── │
│ [avatars]              2d ago   │
└─────────────────────────────────┘
```

- shadow: `rgba(0,0,0,0.07) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 4px`
- hover shadow: `rgba(0,0,0,0.12) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 6px 12px`
- border-radius: `rounded-xl`
- footer: `background: #fafafa`, `borderTop: "1px solid #f0f0f0"`
- 환경 dot: `w-1.5 h-1.5 rounded-full` (모든 곳에서 동일 크기)

### Pipeline Panel (Agent Home 좌측)

- 너비: 320px (`shrink-0`)
- 패딩: `px-8 py-6`
- 제목: `text-[20px] font-medium text-[#171717] mb-4`

#### Pipeline Card (환경 선택 카드)

- 패딩: `p-4` (16px)
- 기본 border: `rgba(0,0,0,0.08) 0px 0px 0px 1px`
- hover border: `rgba(0,0,0,0.20) 0px 0px 0px 1px`
- **선택 border: `0 0 0 1px #171717`** (배경색 변경 없음)
- 버전: `text-[16px] font-semibold text-[#171717]`
- versionNote: `text-[12px] text-[#a1a1aa] mt-0.5` (최대 2줄)

### Segmented Control (탭 전환 UI)

Console 탭 컨테이너 내 중앙 배치.

```jsx
<div className="flex items-center p-1 rounded-lg" style={{ background: "#f4f4f5" }}>
  <button
    className="px-4 py-1.5 rounded-md text-[13px] font-medium transition-all"
    style={{
      background: selected ? "#ffffff" : "transparent",
      color: selected ? "#171717" : "#888888",
      boxShadow: selected ? "rgba(0,0,0,0.08) 0px 1px 3px" : "none",
    }}
  >
    Overview
  </button>
</div>
```

### Tab Navigation (Build 섹션 내)

- 하단 2px 언더라인 방식 (Segmented Control이 아닌 탭 스타일)
- 활성: `color: #171717`, `bottom 0 h-[2px] background: #171717`
- 비활성: `color: #888888`
- 컨테이너: `border-b border-[#f0f0f0]`

```jsx
<div className="flex items-center gap-1 mb-6 border-b border-[#f0f0f0]">
  <button className="px-3 py-2 text-[14px] font-medium transition-colors relative"
    style={{ color: isActive ? "#171717" : "#888888" }}
  >
    Instructions
    {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
      style={{ background: "#171717" }} />}
  </button>
</div>
```

### Alert Card

경고/정보 알림. **항상 탭 콘텐츠 최상단에 배치.**

```jsx
<div className="flex items-start gap-3 px-4 py-3 rounded-lg"
  style={{
    background: isWarn ? "#fff1f2" : "#f8faff",
    boxShadow: isWarn
      ? "rgba(220,38,38,0.15) 0px 0px 0px 1px"
      : "rgba(99,102,241,0.15) 0px 0px 0px 1px",
  }}
>
```

- 펄싱 애니메이션 dot: `animate-ping`
- Warning dot: `#dc2626`
- Info dot: `#6366f1`

### Model Selection Card (Build > Model)

- 2×2 그리드: `grid grid-cols-2 gap-2`
- 각 카드: `text-left px-4 py-3 rounded-lg`
- 선택: `box-shadow: 0 0 0 1.5px #171717`
- 라디오 인디케이터: `w-4 h-4 rounded-full border-2`, 내부 `w-2 h-2 rounded-full background: #171717`
- `<select>` 드롭다운 사용 금지

### Progress Bar

- 트랙: `h-1.5 rounded-full background: #f4f4f5`
- 바: **`background: #171717`** (컬러 사용 금지)
- 숫자 레이블: `text-[#171717]`

### Promote Button

- 스타일: `px-4 py-2 rounded-md text-[14px] font-medium text-white background: #171717`
- 위치: **탭 콘텐츠 영역 하단 좌측** (`flex items-center mt-4`)
- 아이콘: 위쪽 화살표 SVG

### KPI Metric Card

```jsx
<div className="rounded-xl px-5 py-4" style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}>
  <p className="text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide mb-3">
    {label}
  </p>
  <p className="text-[28px] font-semibold text-[#171717] leading-none"
    style={{ letterSpacing: "-0.5px" }}>
    {value}
  </p>
</div>
```

### Inline List Row

```jsx
<div className="flex items-center gap-3 px-4 py-3"
  style={{ borderTop: i > 0 ? "1px solid #f4f4f5" : undefined }}>
```

- 래퍼: `rounded-xl overflow-hidden` + shadow-as-border
- 첫 번째 행: borderTop 없음
- 나머지 행: `borderTop: "1px solid #f4f4f5"`

### Avatar Stack (AgentCard footer)

- 크기: `w-6 h-6 rounded-full`
- 오버랩: `marginLeft: "-8px"` (첫 번째 제외)
- 구분 ring: `boxShadow: "0 0 0 1px #ffffff"`
- 최대 3개 표시, 초과 시 `+N` 회색 아바타

---

## 6. Version Display Rules

- **항상 `formatVersion()` 사용**: `v1.9` → `Version 1.9`, `v0.7` → `Version 7`
- Deployment History, Verification History, Agent Information, Pipeline Card 모두 적용
- Raw `vX.X` 형태 직접 노출 금지

---

## 7. Do's and Don'ts

### Do
- shadow-as-border: `rgba(0,0,0,0.08) 0px 0px 0px 1px` (CSS border 대신)
- 버전 표시: `formatVersion()` 경유
- 섹션 레이블: `capitalize tracking-wide` (11px, #a1a1aa)
- 환경 dot 크기: `w-1.5 h-1.5` 통일
- 알림 블록: 탭 콘텐츠 최상단
- 프로그레스 바: `background: #171717`
- Model 선택: 카드 2×2 그리드 UI
- Build 섹션 네비: 상단 탭 (언더라인 방식)
- Promote 버튼: 탭 하단 좌측

### Don't
- `border:` CSS 속성으로 카드 테두리 금지 → shadow-as-border
- `uppercase` Tailwind 클래스 (섹션 레이블) → `capitalize`
- `text-[13px]` 이하 body 텍스트 → 최소 `text-[14px]`
- `<select>` 드롭다운 (모델 선택) → 카드 UI
- 정적 DEPLOY_HISTORY 상수 → `buildDeployHistory(instance)`
- Raw 버전 문자열(`v1.9`) UI 직접 노출 → `formatVersion()`
- Production/Staging Build 편집 허용 → 읽기 전용 강제
- 알림을 KPI 카드 아래 배치 → 최상단
- `#000000` 순수 black → `#171717` near-black
- 환경 컬러를 장식 목적으로 사용 → 환경 표현에만

---

## 8. Reference: Original Vercel Design System

> 아래는 Vercel 마케팅 사이트 기반 원본 디자인 시스템 정의. 앱 UI에서는 위의 Delight.ai 규칙이 우선한다.

### Vercel Color Tokens

- **Geist Black** (`#171717`): Primary text, headings
- **Pure White** (`#ffffff`): Page background
- **Ship Red** (`#ff5b4f`): Production/Ship workflow accent
- **Preview Pink** (`#de1d8d`): Preview deployment accent
- **Develop Blue** (`#0a72ef`): Development workflow accent

### Vercel Shadow System

- Ring: `rgba(0,0,0,0.08) 0px 0px 0px 1px`
- Card Full: `rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px, rgba(0,0,0,0.04) 0px 8px 8px -8px, #fafafa 0px 0px 0px 1px`

### Vercel Typography

- Display: 48px, weight 600, letter-spacing -2.4px to -2.88px
- Section Heading: 40px, weight 600, letter-spacing -2.4px
- Card Title: 24px, weight 600, letter-spacing -0.96px
- Body: 16–18px, weight 400
- Caption: 12px, weight 400–500
- Three weights only: 400, 500, 600

### Vercel Border Radius Scale

- Micro: 2px (inline code)
- Standard: 6px (buttons)
- Comfortable: 8px (cards)
- Image: 12px (featured cards)
- Pill: 9999px (badges)
