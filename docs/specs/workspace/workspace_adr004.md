# ADR-004: Agent의 환경 인스턴스를 단수로 할 것인가 복수로 할 것인가

> **ADR 번호**: 004
> **제목**: 한 Agent가 가질 수 있는 환경 인스턴스의 수 — 단수 모델 채택 + 확장 여지 확보
> **상태**: Accepted (채택됨)
> **결정일**: 2026-04-22
> **결정자**: UX Design
> **관련 문서**: PRD.md, ADR-001, ADR-002, ADR-003
> **영향 범위**: 데이터 모델, Workspace Home, Agent 내부 화면, Promote 플로우, 전체 UI 언어

---

## 컨텍스트

### 배경

Delight.ai의 계층 구조에서 각 AI Agent는 Development / Staging / Production 3개 환경을 가진다. 그런데 이 "환경"이 정확히 무엇을 의미하는지, 설계 과정에서 근본적인 질문이 제기되었다.

**한 Agent의 한 환경(예: Production)은 단 하나의 인스턴스만 가지는가, 아니면 여러 인스턴스를 가질 수 있는가?**

### 두 가지 모델

#### 단수 모델 (과제 문서의 전제)

한 Agent는 각 환경마다 정확히 하나의 인스턴스만 가진다.

```
Support Bot
├── Development (1개) : v0.42
├── Staging (1개)     : v0.41
└── Production (1개)  : v0.38
```

#### 복수 모델 (엔터프라이즈 요구에서 자주 나타남)

한 Agent는 각 환경 안에 여러 인스턴스를 가질 수 있다.

```
Support Bot
├── Development
│   ├── main (v0.42)
│   └── feature/payment (v0.42-exp1)
├── Staging
│   └── default (v0.41)
└── Production
    ├── us-east (v0.38)
    ├── eu-west (v0.38)
    └── kr (v0.37)
```

### 이 결정이 왜 중요한가

이 결정은 제품 전체의 UI 언어, 데이터 모델, 사용자 멘탈 모델을 규정한다. 나중에 바꾸기 어렵다.

- 단수 모델을 선택하면: UI가 단순해지지만 엔터프라이즈 확장 시 재설계 필요
- 복수 모델을 선택하면: UI가 복잡해지지만 다양한 운영 시나리오 수용

특히 본 제품의 경우, 앞서 결정한 ADR 3개(환경 표시·복합 상태·뷰 모드)가 모두 환경의 개수를 전제로 설계되었다. 환경이 복수가 되면 이 ADR들도 모두 영향받는다.

### 실제 업계 관행

엔터프라이즈 SaaS 제품에서 관찰되는 복수 환경 시나리오:

| 시나리오            | 예시                       | 필요성                        |
| ------------------- | -------------------------- | ----------------------------- |
| 멀티리전 Production | us-east, eu-west, kr       | 지역별 데이터 격리, 법규 준수 |
| A/B 테스트          | Control vs Variant         | 신기능 점진 출시              |
| 멀티테넌트          | Acme용, Beta용             | B2B 고객사별 커스터마이징     |
| 카나리 배포         | Canary(5%) + Stable(95%)   | 위험 최소화                   |
| 피처 브랜치 개발    | main, feature/X, feature/Y | 병렬 개발                     |
| 지역별 언어         | Prod-ko, Prod-en, Prod-ja  | 로케일별 최적화               |

이들은 "이상적" 기능이 아니라 실제 엔터프라이즈 도입 시 기본 요구사항인 경우가 많다.

---

## 결정

### 채택안: MVP는 단수 모델 + 장기적으로 복수 확장 가능하도록 설계

두 모델의 장점을 모두 취하는 2단계 전략.

### 핵심 원칙

#### 원칙 1: MVP는 단수 모델로 시작

과제 문서의 전제대로 "1 Agent = 1 Dev + 1 Staging + 1 Prod"를 기본 모델로 채택한다.

- UI 언어와 사용자 멘탈 모델이 단순
- 과제 요구사항에 정합
- 초기 사용자의 학습 곡선 최소
- ADR-001, 002, 003과 정합성 유지

#### 원칙 2: 데이터 모델은 확장 가능한 형태로

UI는 단수처럼 보이되, 내부 데이터 모델은 복수로 확장 가능한 구조로 설계한다. 나중에 복수 지원이 필요해졌을 때 데이터 마이그레이션 없이 UI만 진화.

#### 원칙 3: 복수 지원의 트리거 기준 사전 정의

"언제 복수 모델로 넘어갈 것인가"의 기준을 미리 정의한다.

#### 원칙 4: 복수 모델 전환 시 UX 패턴 사전 스케치

복수 모델로 넘어갔을 때의 UX 패턴을 미리 스케치해둔다.

---

## 구체 전략

### 단계 1: MVP (현재)

**범위**:

- 한 Agent = 환경 3개 = 각 1개 인스턴스
- 사용자는 "환경"이라는 단어만 접함. "인스턴스" 개념 노출 안 됨
- 기존 ADR 3개 그대로 적용

**UI 언어**:

- "이 Agent의 Production"
- "Staging에 배포되었습니다"
- "Dev에서 작업 중"

**데이터 모델 (확장 가능)**:

```typescript
interface AgentEnvironmentInstance {
  id: string;
  environmentType: "development" | "staging" | "production";
  instanceName: string; // MVP에서는 "default" 하나만
  version: string;
  deployedAt?: string;
  deployedBy?: string;
  health: "healthy" | "warning" | "error" | "unknown";
  config: AgentConfig;
}

interface Agent {
  id: string;
  workspaceId: string;
  name: string;
  instances: AgentEnvironmentInstance[]; // 배열로 저장
}
```

**데이터 접근 패턴**:

MVP에서는 헬퍼 함수로 단수처럼 접근할 수 있게 한다.

```typescript
function getProductionInstance(agent: Agent): AgentEnvironmentInstance | null {
  return (
    agent.instances.find((i) => i.environmentType === "production") ?? null
  );
}

function getDevInstance(agent: Agent): AgentEnvironmentInstance | null {
  return (
    agent.instances.find((i) => i.environmentType === "development") ?? null
  );
}
```

이 구조로 두면:

- MVP UI는 "Dev 1개, Staging 1개, Prod 1개"로 동작
- 데이터 모델은 배열이므로 나중에 여러 인스턴스 추가해도 스키마 변경 없음

### 단계 2: 복수 지원 확장 (향후)

**전환 트리거**:

다음 중 2개 이상이 충족되면 복수 지원 도입을 검토한다.

1. 엔터프라이즈 고객 중 30% 이상이 멀티리전 요구
2. A/B 테스트 기능 요청이 상위 5대 피처 요청에 포함
3. 단일 Prod 인스턴스로 인한 장애가 분기별 2건 이상
4. 경쟁 제품이 복수 환경 지원을 표준으로 확립

**도입 시 UX 변화 (사전 스케치)**:

**변화 1: 환경 화면에 인스턴스 선택기 추가**

```
Environment: [Production ▼]
Instance:    [us-east ▼]   ← 복수 지원 시 추가되는 드롭다운
```

MVP에서는 이 드롭다운이 숨겨지거나 "default" 하나만 있음.

**변화 2: 용어 확장**

| MVP                | 복수 지원 시               |
| ------------------ | -------------------------- |
| "Production"       | "Production / us-east"     |
| "Prod에 배포"      | "Prod / us-east에 배포"    |
| "Production v0.38" | "Production us-east v0.38" |

**변화 3: Pipeline 뷰의 확장**

ADR-003에서 정의한 Pipeline 뷰가 복수 지원 시:

```
Development               Staging              Production
  main                      default              us-east
  [Agent A v0.42]           [Agent A v0.41]      [Agent A v0.38]
                                                 eu-west
  feature/payment                                [Agent A v0.38]
  [Agent A v0.42-exp1]                           kr
                                                 [Agent A v0.37]
```

**변화 4: Promote 다이얼로그 확장**

```
Promote from:  Development / main (v0.42)

Promote to:    [Staging / default ▼]

Apply to:      ☑ us-east
               ☑ eu-west
               ☐ kr
```

### 단계 3: 복수 지원 성숙 단계 (장기)

- 카나리 배포: 한 Prod 안에서 트래픽 가중치 분할
- 기능 플래그와 연계
- 인스턴스 간 Diff
- 일괄 Promote

MVP로부터 최소 12개월 이상 시점으로 가정.

---

## 검토한 대안들

### 대안 A: 처음부터 복수 모델 도입

MVP부터 각 환경에 복수 인스턴스를 허용.

**장점**:

- 처음부터 확장성 확보, 마이그레이션 불필요
- 엔터프라이즈 고객에게 바로 어필
- 업계 베스트 프랙티스 정합

**단점**:

- MVP 복잡도 폭발
- 신규 사용자 학습 곡선 급증
- 과제 요구사항 벗어남
- 초기 구현·QA 비용 증가
- 실제 필요 여부 불확실

**기각 이유**: MVP 단계에서 과하다. YAGNI 원칙 위반. 복잡도 대비 검증된 수요 부족.

### 대안 B: 완전한 단수 고정 (확장 불가)

MVP부터 최종 제품까지 모두 단수 모델 유지. 데이터 모델도 단수로 하드코딩.

**장점**:

- 가장 단순한 구현
- UI/UX가 깔끔

**단점**:

- 미래 엔터프라이즈 요구 대응 불가
- 데이터 모델 대수술 필요
- 경쟁사 대비 제품 한계

**기각 이유**: 당장은 편하지만 제품의 성장 가능성을 제한.

### 대안 C: 환경 개수 자체를 늘리기

환경을 3개에서 5개 이상으로 확장 (Dev → Integration → QA → Staging → Prod).

**단점**:

- 과제 요구사항과 충돌
- Promote 플로우 지연
- UI 복잡도 증가

**기각 이유**: 과제 전제를 벗어나고 실제 가치도 의문.

### 대안 D: 플러그인 방식

기본은 단수 모델, 엔터프라이즈 고객은 플러그인·토글로 복수 모드 활성화.

**단점**:

- 두 가지 UI 모드 유지 비용
- 플러그인 경계의 모호함

**기각 이유**: 채택안과 실질적으로 유사하되 구현은 더 복잡.

### 대안 E: 환경이 아닌 별도 차원 도입

환경은 3개 단수로 유지하고, 별도 차원(리전, 테넌트)을 Workspace 하위 또는 Agent 속성으로 추가.

**단점**:

- 같은 Agent가 여러 리전에 "복사"됨 → 일관성 관리 복잡
- Workspace 구조 자체를 건드려야 함

**기각 이유**: 같은 Agent를 복사하는 모델은 관리 부담이 큼.

---

## 결정의 근거

### 1. 과제 요구사항과 확장성의 동시 충족

채택안은 과제가 전제한 단수 모델을 UI에 적용하면서도 데이터 모델 수준에서 확장 여지를 확보한다. 두 요구를 상충시키지 않고 모두 만족.

### 2. YAGNI 원칙 존중, 하지만 과도하지 않게

"당장 필요 없는 기능은 만들지 마라"는 YAGNI 원칙은 UI에는 적용하되, 데이터 모델 수준에서는 미래 확장을 염두에 두는 균형을 유지.

### 3. 사용자 멘탈 모델 보호

복수 인스턴스 개념은 복잡하다. MVP 사용자에게 이 복잡도를 노출하지 않으면서 단순한 멘탈 모델을 제공.

### 4. 점진적 도입의 안전성

"언제, 어떤 트리거에서 복수 모델로 넘어갈지" 기준을 사전 정의함으로써 성급한 도입과 무한 연기를 모두 방지.

### 5. 이전 ADR들과의 정합

ADR-001, 002, 003은 모두 "환경 3개가 각각 하나의 상태를 가진다"는 전제로 설계되었다. 단수 모델 채택은 이 전제와 정합.

### 6. 복수 지원 시점의 UX 사전 스케치로 리스크 감소

미래에 복수 지원이 필요해졌을 때 어떻게 확장할지 지금 미리 스케치함으로써 데이터 모델을 올바르게 설계 가능.

### 7. 경쟁 제품 분석

| 제품          | 모델                                  |
| ------------- | ------------------------------------- |
| Voiceflow     | 단수 (Dev/Prod 2환경)                 |
| Botpress      | 복수 지원                             |
| Rasa          | 단수                                  |
| Dialogflow CX | 복수 지원 (Version, Environment 분리) |

시장 합의가 없음. Delight.ai는 "단순함으로 시작, 필요 시 확장"의 포지션을 택한다.

---

## 적용 예시

### 예시 1: MVP 사용자 경험

**시나리오**: 신규 가입한 스타트업 팀이 첫 Agent를 만드는 상황.

```
1. Support Bot 생성
   → 환경 개수나 인스턴스 선택 질문 없음
   → Dev 환경에 v0.01로 자동 생성

2. Dev에서 편집, Promote to Staging
   → "Staging에 배포됩니다" 메시지만 표시
   → 인스턴스 개념 노출 안 됨

3. Prod 배포 후 모니터링
   → "Production v0.01 · CSAT 4.5"
```

**사용자 인지**: 환경 3개가 있고, 각각 하나의 버전이 떠 있다는 단순한 모델.

### 예시 2: 데이터 모델 관점

**MVP에서 Support Bot의 실제 데이터**:

```json
{
  "id": "agent_support",
  "name": "Support Bot",
  "instances": [
    {
      "id": "inst_dev_default",
      "environmentType": "development",
      "instanceName": "default",
      "version": "v0.42"
    },
    {
      "id": "inst_stg_default",
      "environmentType": "staging",
      "instanceName": "default",
      "version": "v0.41"
    },
    {
      "id": "inst_prod_default",
      "environmentType": "production",
      "instanceName": "default",
      "version": "v0.38"
    }
  ]
}
```

내부는 배열이지만, UI에서는 각 환경당 하나씩만 접근.

### 예시 3: 향후 복수 지원 도입 시

**엔터프라이즈 고객이 멀티리전 요구**:

```json
{
  "id": "agent_support",
  "name": "Support Bot",
  "instances": [
    {
      "environmentType": "development",
      "instanceName": "main",
      "version": "v0.42"
    },
    {
      "environmentType": "development",
      "instanceName": "feature-payment",
      "version": "v0.42-exp"
    },
    {
      "environmentType": "staging",
      "instanceName": "default",
      "version": "v0.41"
    },
    {
      "environmentType": "production",
      "instanceName": "us-east",
      "version": "v0.38"
    },
    {
      "environmentType": "production",
      "instanceName": "eu-west",
      "version": "v0.38"
    },
    {
      "environmentType": "production",
      "instanceName": "kr",
      "version": "v0.37"
    }
  ]
}
```

**데이터 스키마 변경 없음**. UI만 "인스턴스 선택기"를 추가로 노출.

---

## 결과 및 영향

### 긍정적 영향

- MVP 구현 복잡도 통제
- 이전 ADR들과 정합
- 미래 확장 경로 확보
- 엔터프라이즈 상담 시 로드맵 제시 가능
- 사용자 멘탈 모델 단순성 유지

### 부정적 영향 (트레이드오프)

- 데이터 모델 복잡도 증가: UI는 단수여도 내부는 배열
- 초기 헬퍼 함수 개발 비용
- "왜 배열인가?" 개발자 의문 발생 가능
- 복수 지원 전환 시점의 판단 부담

### 후속 작업 필요

1. **PRD.md 업데이트**
   - §4 용어 정의에 "Environment Instance" 용어 추가
   - §13 Out of Scope에 "복수 환경 인스턴스" 명시
   - §14 오픈 이슈에 Q-06 추가

2. **데이터 모델 문서 (신규)**
   - DATA_MODEL_SPEC.md 작성
   - 확장 가능한 instances 배열 구조 명세
   - 헬퍼 함수 설계

3. **기존 스펙 문서 업데이트**
   - WORKSPACE_SPEC.md §8.2 Agent 타입 정의 확장

4. **개발자 온보딩 문서**
   - "왜 배열인가?"에 대한 설명
   - 헬퍼 함수 사용 가이드

5. **복수 지원 전환 트리거 모니터링 체계**
   - 엔터프라이즈 고객 요구 수집 채널
   - 분기별 트리거 충족 여부 리뷰

### 트리거 모니터링 지표

복수 지원 도입 시점 판단을 위한 지표 추적:

| 지표                      | 측정 방법              | 트리거 기준          |
| ------------------------- | ---------------------- | -------------------- |
| 멀티리전 요구 고객 비율   | Sales 팀 요구사항 수집 | 엔터프라이즈 중 30%+ |
| A/B 테스트 피처 요청 순위 | 피처 백로그 투표       | 상위 5위 이내        |
| 단일 인스턴스 장애 건수   | 인시던트 로그          | 분기당 2건+          |
| 경쟁사 복수 환경 지원     | 분기별 경쟁 분석       | 주요 경쟁사 표준화   |

### 위험 요소

- "복수 지원은 영원히 안 올 것"이라는 함정: 분기별 리뷰로 대응
- 데이터 모델 배열 구조의 오용: 검증 로직으로 방지
- UI가 나중에 "숨겨진 기능"을 드러내는 낯섦: 변경 시 공지·온보딩 강화

---

## UX 최적화 프레임워크 (일반화)

이 ADR이 미래에 다른 확장성 결정의 템플릿이 될 수 있다.

### 프레임워크: 단순성 vs 확장성 트레이드오프

확장 가능성이 있는 기능에 대해 3가지 축으로 판단.

**축 1: 사용자 멘탈 모델 노출도**

- 낮음: MVP 사용자는 복잡성 인지 안 함
- 높음: 처음부터 복잡 개념 학습 필요

**축 2: 데이터 모델 유연성**

- 낮음: 하드코딩, 변경 시 마이그레이션
- 높음: 스키마 확장 가능, 코드만 수정

**축 3: 구현 복잡도**

- 낮음: 단순 구현
- 높음: 추상화 레이어, 테스트 부담

**최적 포지션**: 축 1 **낮음** + 축 2 **높음** + 축 3 **중간**.

이 ADR의 채택안이 이 포지션에 해당.

### 적용 가능한 다른 미래 결정

- 다중 언어 Agent: 지금은 단일 언어, 데이터 모델은 locale 배열
- 모델 선택: 지금은 단일 LLM, 데이터 모델은 여러 모델 지원 구조
- 채널 설정: 지금은 기본 설정 공유, 데이터 모델은 채널별 override 가능 구조
- Tool 호출: 지금은 동기 단일 호출, 데이터 모델은 체이닝 가능 구조

---

## 다른 결정들과의 관계

### 선행 ADR들

- **ADR-001**: Prod 중심 환경 표시. 단수 모델 전제. 본 ADR과 정합.
- **ADR-002**: 복합 상태 라벨. 환경 3개 단위로 상태 판정. 본 ADR과 정합.
- **ADR-003**: Pipeline 뷰 3컬럼. 단수 모델 기반. 향후 복수 지원 시 컬럼 내 서브그룹으로 확장 가능.

### 본 ADR이 미치는 영향

- PRD.md: 용어 정의·Out of Scope·오픈 이슈 업데이트
- 데이터 모델 문서: 신규 작성 필요
- WORKSPACE_SPEC.md: Agent 타입 정의 확장
- WORKSPACE_HOME_INFO_GUIDE.md: 영향 없음 (UI는 단수 유지)

### 향후 ADR 가능성

복수 지원 도입 시점에 후속 ADR로 다룰 수 있는 주제:

- 환경 인스턴스의 UI 노출 방식
- 인스턴스 간 설정 Diff 표시
- 일괄 Promote의 UX
- 카나리 배포의 트래픽 가중치 UI

---

## 변경 이력

| 버전 | 일자       | 변경 내용                                                 |
| ---- | ---------- | --------------------------------------------------------- |
| 1.0  | 2026-04-22 | 최초 작성, Accepted. MVP 단수 + 장기 복수 확장 전략 확정. |

---

## 관련 문서

- PRD.md (§4 용어, §13 Out of Scope, §14 오픈 이슈 업데이트 필요)
- WORKSPACE_SPEC.md §8.2 (Agent 타입 정의 확장 필요)
- ADR-001, 002, 003 (선행 결정, 본 ADR과 정합)
- DATA_MODEL_SPEC.md (신규 작성 필요)

---

**END OF ADR-004**
