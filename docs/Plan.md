# ForOffenseCoach – Concepts/Formations Precision Audit Plan (v1)

## 목표
- PASS/RUN 컨셉의 표준성(루트조합/깊이/프로그레션, 스킴/풀러구조)을 "현대 코칭 기준"으로 정밀 검수한다.
- Formation 프리셋 라벨과 concept.appliesTo 라벨을 100% 정합시켜 Assignment가 틀어지지 않게 한다.
- 결과물은 항상 IDE에 바로 붙여넣을 수 있게 **전체 파일 교체본** 또는 **diff 패치**로 제공한다.

---

## 규칙 (절대 깨지면 안 됨)
- Formation 라벨 표준:
  - TE = `Y`, H-back/2nd TE = `H`, WR = `X/Z`(필요시 `F`는 Slot), RB = `RB`, QB = `QB`, FB = `FB`
- Concept.appliesTo는 위 라벨만 사용 (예: `TE` 같은 라벨 금지)
- PASS: dropType(3/5/7)와 depth가 현실적으로 일치해야 함
- RUN: scheme(Zone/Gap)과 puller/insert/kick-out 구조가 "정의와 템플릿"에 일치해야 함

---

## Deliverables (매 단계 산출물)
- [ ] `pass-concepts.auditN.ts` (전체 교체본)
- [ ] `run-concepts.auditN.ts` (전체 교체본)
- [ ] `concepts.auditN.diff` (git apply / IDE Apply Patch용)
- [ ] `AUDIT_NOTES.auditN.md` (각 컨셉 변경 요약/근거 1~2줄)

---

## Phase 0 — Baseline Freeze (이미 완료)
- [x] formation-presets.updated.ts 적용 완료
- [x] pass-concepts.updated.ts 적용 완료
- [x] run-concepts.updated.ts 적용 완료

---

## Phase 1 — PASS Audit 1 (10 concepts) ✅(이미 1차 완료본 존재)
### 대상 (예시)
- Stick, Smash, Snag, Slant-Flat, Mesh, Drive, Y-Cross, Flood, Dagger, Verts

### 체크리스트
- [ ] 표준 루트 조합이 맞는가? (개념 정의와 실제 routes가 일치)
- [ ] depth가 리듬(3/5/7 step)에 맞는가?
- [ ] progression이 논리적으로 맞는가? (key defender / high-low / leverage)
- [ ] formation 요구조건이 비현실적이지 않은가? (예: Empty에서만 가능 같은 제한 과함)

### 산출물
- [ ] pass-concepts.audit1.ts
- [ ] concepts.audit1.diff
- [ ] AUDIT_NOTES.audit1.md

---

## Phase 2 — PASS Audit 2 (10 concepts)
### 대상 (권장 10)
- Spacing
- Hank (Curl-flat)
- Bench
- Levels
- Sail (3-level)
- Post-Dig (또는 Dagger 변형 정리)
- Yankee
- Texas (Angle) / Option route
- Whip / Pivot
- Shallow Cross (Mesh-lite) / Spot 중 택1

### 체크리스트
- [ ] 루트 조합 표준성 (예: Sail = clear + corner + flat)
- [ ] 깊이 범위(예: corner 12–14, dig 15–18 등) 현실성
- [ ] progression에 "읽는 디펜더"가 명시되는가? (flat defender, hook defender, safety 등)
- [ ] appliesTo 라벨이 formation 라벨셋에서 항상 충족되는가?

### 산출물
- [ ] pass-concepts.audit2.ts
- [ ] concepts.audit2.diff
- [ ] AUDIT_NOTES.audit2.md

---

## Phase 3 — RUN Audit 1 (10 concepts)
### 대상 (권장 10)
- Inside Zone
- Split Zone
- Outside Zone / Wide Zone (중복이면 하나로 통합)
- Duo
- Power
- Counter (GT)
- Pin-Pull
- Trap
- Wham
- Draw

### 체크리스트
- [ ] scheme(Zone/Gap) 분류가 정확한가?
- [ ] puller 존재 여부가 개념 정의와 일치하는가?
- [ ] kick-out / wrap / insert 역할이 명확한가?
- [ ] TE(Y)/H 역할이 현실적인가? (down/arc/insert 등)

### 산출물
- [ ] run-concepts.audit1.ts
- [ ] concepts.audit3.diff
- [ ] AUDIT_NOTES.audit3.md

---

## Phase 4 — RUN Audit 2 (10 concepts)
### 대상 (권장 10)
- Counter (H-insert 변형)
- Power Read
- Zone Read
- RPO Attachments 정리(런 컨셉이 아니라면 "태그"로 분리)
- Jet Sweep
- End Around
- QB Draw / QB Power(필요시)
- Toss (현대는 Crack Toss/Pin-Toss로 정리)
- Mid Zone
- Stretch(Outside Zone로 통합 가능)

### 체크리스트
- [ ] 옵션/리드 계열은 "RUN"과 "PASS TAG/RPO"를 분리했는가?
- [ ] 현대에서 쓰는 명칭/정의로 정리되어 있는가?
- [ ] assignment 템플릿이 실제 코칭포인트와 어긋나지 않는가?

### 산출물
- [ ] run-concepts.audit2.ts
- [ ] concepts.audit4.diff
- [ ] AUDIT_NOTES.audit4.md

---

## Phase 5 — Formation Audit (정합성 + 추천 품질)
### 목표
- Formation 프리셋을 "현대 주류 + 추천에 유리한 구조"로 정리
- appliesTo 라벨 매칭 100% 보장

### 체크리스트
- [ ] 중복 프리셋 제거 (이름만 다른 동일 구조)
- [ ] 비주류/설치 거의 안 하는 셋 제거 (원하면 별도 'Legacy'로 분리)
- [ ] 2x2/3x1/Empty/Bunch/Stack 정도는 기본 제공
- [ ] 각 formation에 "primary personnel/structure tag" 부여 (추천 로직에 활용)

### 산출물
- [ ] formation-presets.audit.ts
- [ ] formation.audit.diff
- [ ] AUDIT_NOTES.formation.md

---

## Phase 6 — Lint / Auto-Validation (깨짐 방지)
### 목표
- 컨셉/포메이션이 추가/수정돼도 Assignment가 틀어지지 않게 자동 검사

### 검사 항목
- [ ] 모든 concept.appliesTo 라벨이 formation 라벨셋에서 충족 가능한가?
- [ ] minEligibleReceivers(있다면) 충족 가능한 formation이 존재하는가?
- [ ] PASS: dropType ↔ depth 범위 위반 탐지
- [ ] RUN: scheme ↔ puller/insert 역할 모순 탐지

### 산출물
- [ ] scripts/concept-lint.ts
- [ ] npm script: `lint:concepts`
- [ ] CI(옵션): PR마다 lint 실행

---

## 실행 순서 (딱 이대로)
1) PASS Audit 2
2) RUN Audit 1
3) RUN Audit 2
4) Formation Audit
5) Concept Lint 도입

---

## 완료 기준 (Done)
- [ ] PASS/RUN "Core Library"에서 표준성 논란이 없는 상태
- [ ] 추천/Assignment에서 라벨 미스매치가 0
- [ ] 신규 컨셉 추가 시 lint로 즉시 실패/경고 발생
