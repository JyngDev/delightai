@AGENTS.md

## UI / 디자인 규칙

UI 또는 사이트 제작 작업 시 반드시 `DESIGN.md`를 먼저 읽고 해당 스타일 가이드를 따를 것.

---

## 프로젝트 구조 규칙

### 파일 위치

| 역할 | 경로 |
|------|------|
| 전역 Mock 데이터 & 타입 | `src/lib/mock-data.ts` |
| 공통 레이아웃 컴포넌트 | `src/components/layout/` |
| 워크스페이스 화면 컴포넌트 | `src/components/workspace/` |
| 앱 라우팅 | `src/app/org/[orgSlug]/...` |

### URL 구조 (변경 금지)

```
/org/{orgSlug}                                    → Org Home (Entry)
/org/{orgSlug}/ws/{wsSlug}                        → Workspace Home
/org/{orgSlug}/ws/{wsSlug}/agent/{agentSlug}      → Agent Home
```

---

## 버전 표기 규칙

- **항상 `formatVersion()` 함수를 통해 버전을 표시할 것.**
- Raw `v1.9` 형태를 UI에 직접 노출하는 것은 금지.
- 변환 결과: `v1.9` → `Version 1.9`, `v0.7` → `Version 7`

```typescript
// src/components/workspace/AgentHome.tsx 내 정의
function formatVersion(v: string): string {
  const stripped = v.replace(/^v0\./, "").replace(/^v/, "");
  return `Version ${stripped}`;
}
```

- Deployment History, Verification History, Agent Information 등 버전이 표시되는 모든 곳에 적용.
- Edit History 이벤트 문자열 내 버전도 `Version X.X saved/promoted` 형식 사용.

---

## 환경(Environment) 시스템 규칙

### 환경 색상 (변경 금지)

| 환경 | Dot 색상 | 텍스트 색상 | 용도 |
|------|----------|-------------|------|
| Development | `#eab308` (yellow) | `#a16207` | 개발 작업 공간 |
| Staging | `#f97316` (orange) | `#c2410c` | QA 검증 공간 |
| Production | `#16a34a` (green) | `#15803d` | 실서비스 |
| Suspended | `#a1a1aa` (gray) | `#a1a1aa` | 정지된 인스턴스 |
| Inactive | `#d4d4d8` (light gray) | `#d4d4d8` | 배포 없음 |

### 환경 라벨 표기

- **풀네임 표시**: `Development`, `Staging`, `Production` (축약 금지)
- 앞글자만 대문자, 나머지 소문자

### 읽기 전용 규칙

- **Staging, Production 환경에서 Build 탭은 읽기 전용.**
- 배경: `#fafafa`, 편집 버튼 비노출, 읽기 전용 배너 표시.
- 수정은 Development에서만 가능 → Promote 흐름으로만 상위 환경 반영.

---

## 알림(Alert) 배치 규칙

- **경고(warning) 및 정보(info) 알림은 항상 해당 탭 콘텐츠 최상단에 배치.**
- KPI 카드, Agent Information 등 다른 블록보다 위에 렌더링.
- `ALERT_ITEMS[env]`와 `alertEnv` 필드를 통해 해당 환경에만 알림이 노출되도록 필터링.

---

## Sidebar 규칙

### 자동 접힘

- **에이전트 페이지(`/agent/[slug]`) 진입 시 사이드바 자동 접힘.**
- **Settings 페이지 진입 시에도 자동 접힘.**
- 접힌 상태에서 사용자가 수동으로 펼칠 수 있음.

### 애니메이션 순서

- **닫힐 때**: 컨텐츠 fade out(120ms) → width 축소(220ms, `cubic-bezier(0.4, 0, 0.2, 1)`)
- **열릴 때**: width 확장(220ms) → 컨텐츠 fade in(120ms, 180ms delay)

### 접힌 상태 (width: 56px)

- 워크스페이스 아이콘만 표시 (텍스트 없음)
- Home 아이콘 표시
- New Workspace 아이콘 표시
- 로고 hover 시 사이드바 열기 버튼 표시

### 펼쳐진 상태

- 모든 nav 아이템 간격: `space-y-3` (12px)
- 아이콘 박스: `w-5 h-5 rounded-md`, **배경색 없음**
- 텍스트: `text-[14px] font-medium`

---

## Breadcrumb 규칙

- Workspace Home, Agent Home 모두 `h-12` 고정 높이, `borderBottom: "1px solid #f4f4f5"`.
- 사이드바 로고 행과 동일한 높이(`h-12`)로 시각적 정렬 유지.
- 구분자: `/` (슬래시), 색상 `#d4d4d8`.

---

## Build 탭 구조 규칙

### 섹션 네비게이션

- **좌측 사이드 네비가 아닌 상단 탭 네비게이션 사용.**
- 활성 탭: 하단 2px 블랙(`#171717`) 언더라인.
- 비활성 탭: 색상 `#888888`.
- 컨테이너: `border-b border-[#f0f0f0]`.

### Model 섹션

- `<select>` 드롭다운 금지.
- **2×2 그리드 카드 UI**로 각 모델을 펼쳐서 표시.
- 선택: `box-shadow: 0 0 0 1.5px #171717`, 라디오 인디케이터.
- 비선택: `rgba(0,0,0,0.08) 0px 0px 0px 1px`.

### Save/Promote 액션 버튼

- **탭 콘텐츠 영역 하단 좌측**에 배치 (다른 탭과 동일 패턴).
- 버튼 스타일: `px-4 py-2 rounded-md text-[14px] font-medium text-white`, `background: #171717`.

---

## 섹션 헤더 라벨 규칙

- 소섹션 레이블: `text-[11px] font-semibold text-[#a1a1aa] capitalize tracking-wide`
- **`uppercase` 금지** — `capitalize`로 앞글자만 대문자 처리.
- 예: `"RECENT CONVERSATIONS"` → `"Recent conversations"`

---

## Deployment History 규칙

- **정적 상수가 아닌 동적 생성 사용** (`buildDeployHistory(instance)`, `buildStagingHistory(instance)`).
- current 항목의 버전은 반드시 실제 `instance.version`과 일치해야 함.
- Production Overview → `buildDeployHistory(productionInstance)`
- Staging Overview → `buildStagingHistory(stagingInstance)`

---

## 금지 사항

| 금지 | 이유 |
|------|------|
| Raw 버전 문자열(`v1.9`) UI 직접 노출 | formatVersion 규칙 위반 |
| `uppercase` Tailwind 클래스 (섹션 레이블) | capitalize 사용 |
| `<select>` 드롭다운 (Model 선택) | 카드 UI로 대체 |
| 좌측 사이드 네비 (Build 섹션) | 상단 탭으로 교체됨 |
| Production/Staging Build 편집 허용 | 읽기 전용 강제 |
| 알림 블록을 KPI 카드 아래 배치 | 항상 최상단 |
| 정적 DEPLOY_HISTORY 상수 사용 | 동적 생성 함수 사용 |
