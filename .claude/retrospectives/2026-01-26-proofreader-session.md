# 반성회 기록 - 2026-01-26 (PROOFREAD 세션)

## 이번 세션에서 수행한 작업

### 1. PROOFREAD_AND_AUTO_FIX 스킬 사양 작성
- 플레이 검증 규칙 정의 (GT Counter, Zone, Flood 등)
- 자동 수정 로직 설계
- 6단계 검증 워크플로우 확립

### 2. Proofreader 모듈 구현
- `docs/audits/proofreader/` 에 8개 파일 생성
- types, rules, autoFix, proofread, formationMap, diagramUtils, index, handleUpload

### 3. 전체 컨셉 Proofread 실행
- 72개 컨셉 (41 pass + 31 run) 검증
- 10개 포메이션 검증
- 결과: 100% VALID

---

## 발생한 문제들

### 문제 1: 파일 쓰기 전 읽기 누락
- **증상**: `autoFix.ts` 업데이트 시 "File has not been read yet" 오류
- **영향**: 추가 API 호출 필요
- **근본 원인**:
  1. 왜? → Write 시도 시 오류 발생
  2. 왜? → 해당 파일을 먼저 Read하지 않음
  3. 왜? → 새로 생성한 파일이라 Read 불필요하다고 판단
  4. 왜? → 기존 파일 vs 새 파일 구분 실수
  5. 왜? → **Write 도구의 제약사항 인지 부족**
- **재발 방지책**: 기존 파일 수정 시 항상 Read → Write 순서 준수
- **조치 상태**: [x] 완료

### 문제 2: Concept 데이터 구조 vs Play 구조 혼동
- **증상**: Proofread 시 concepts.json이 Play 인터페이스와 다름
- **영향**: 검증 로직 적용 방식 조정 필요
- **근본 원인**:
  1. 왜? → Play 인터페이스로 검증하려 했으나 구조가 다름
  2. 왜? → Concept 파일은 메타데이터만 포함
  3. 왜? → Play 인스턴스는 런타임에 생성됨
  4. 왜? → Concept = 템플릿, Play = 인스턴스 구분
  5. 왜? → **데이터 모델 계층 구조 명확화 필요**
- **재발 방지책**: Concept (정의) vs Play (인스턴스) 명확히 구분
- **조치 상태**: [x] 완료 (스키마 기반 검증 수행)

---

## 도출된 규칙

### 1. 파일 수정 시 Read-First 규칙
```
기존 파일 수정:  Read → Edit/Write
새 파일 생성:    Write (직접 가능)
```

### 2. Proofreader 모듈 위치
```
docs/audits/proofreader/  ← 사양/검증용 (현재)
editor/src/lib/           ← 프로덕션용 (향후 이동 시)
```

### 3. Concept vs Play 데이터 모델 구분
| 타입 | 위치 | 구조 | 용도 |
|------|------|------|------|
| Concept | `*-concepts.json` | id, name, needsPuller, summary | 메타데이터/템플릿 |
| Play | (런타임 생성) | assignments[], diagram{}, formation | 실제 플레이 인스턴스 |

### 4. 대량 사양 작성 패턴
- 사용자가 점진적으로 제공하는 코드 → 즉시 파일로 저장
- system-reminder로 오는 코드도 누락 없이 반영
- 10줄 이상의 데이터는 파일로 먼저 저장 후 작업

---

## 잘된 점 (Keep)

1. **점진적 사양 빌드**: 사용자와 한 블록씩 확인하며 사양 작성
2. **배포 전 빌드 검증**: 두 번의 배포 모두 `npm run build` 성공 확인 후 push
3. **명확한 검증 보고서**: 표 형식으로 72개 컨셉 + 10개 포메이션 결과 시각화
4. **자동 수정 규칙 명세화**: GT Counter, Zone, Flood 등 구체적 fix 로직 정의

---

## 개선할 점 (Try)

1. **데이터 구조 사전 확인**: 검증 대상 파일의 스키마를 먼저 확인
2. **모듈 위치 결정**: 사양용 vs 프로덕션용 명확히 구분하여 생성

---

## 세션 통계

- 커밋 수: 2
- 배포 횟수: 2
- 생성된 파일: 8개 (proofreader 모듈)
- 검증된 컨셉: 72개
- 오류 발생: 1회 (Read-First 누락)
- 최종 결과: 모든 컨셉 VALID

---

## CLAUDE.md 업데이트 제안

```markdown
### Concept vs Play 데이터 모델 (2026-01-26 추가)
- **Concept**: 메타데이터/템플릿 (`*-concepts.json`)
  - 구조: `{ id, name, needsPuller, summary, ... }`
- **Play**: 런타임 인스턴스 (DSL)
  - 구조: `{ id, name, formation, assignments[], diagram{} }`
- Proofread는 두 레벨에서 수행:
  1. Concept 레벨: 스키마 규칙 검증 (needsPuller 등)
  2. Play 레벨: Assignment ↔ Diagram 일관성 검증
```
