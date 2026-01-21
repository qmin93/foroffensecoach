# /add-concept - 컨셉 추가

이 스킬은 새로운 패스/런 컨셉을 concepts 데이터 파일에 추가합니다.

## 사용법

```
/add-concept [컨셉 이름] [--type pass|run]
```

예시:
```
/add-concept Mesh --type pass
/add-concept Power Read --type run
```

## 실행 단계

1. **컨셉 정보 수집**
   - 이름이 제공되지 않으면 사용자에게 질문
   - 타입: pass 또는 run
   - 카테고리 선택:
     - Pass: quick, intermediate, deep, screen
     - Run: inside_zone, gap_power, outside, counter, special

2. **컨셉 데이터 생성**
   - ID 생성: `pass_[name]` 또는 `run_[name]`
   - 루트/블록 패턴 정의
   - 추천 힌트 설정

3. **파일 수정**
   - Pass: `c:/FOC/editor/src/data/concepts/pass-concepts.ts`
   - Run: `c:/FOC/editor/src/data/concepts/run-concepts.ts`

4. **컨셉 구조**
   ```typescript
   {
     id: 'pass_mesh',
     name: 'Mesh',
     type: 'pass',
     category: 'intermediate',
     description: '두 리시버가 서로 교차하는 크로싱 루트',
     template: {
       roles: [
         {
           appliesTo: ['WR:X', 'WR'],
           defaultRoute: {
             pattern: 'shallow',
             depth: 5,
             direction: 'inside',
           },
         },
         {
           appliesTo: ['WR:H', 'WR'],
           defaultRoute: {
             pattern: 'shallow',
             depth: 6,
             direction: 'inside',
           },
         },
       ],
     },
     requirements: {
       minReceivers: 2,
       preferredStructures: ['3x1', '2x2'],
     },
     suggestionHints: {
       passConcept: {
         protectionTime: 'quick',
         primaryRead: 'underneath',
         bestAgainst: ['man', 'zone'],
       },
     },
   },
   ```

5. **Run 컨셉 구조**
   ```typescript
   {
     id: 'run_power',
     name: 'Power',
     type: 'run',
     category: 'gap_power',
     description: '풀 가드와 킥아웃 블록을 활용한 갭 런',
     template: {
       roles: [
         {
           appliesTo: ['OL:RG'],
           defaultBlock: {
             scheme: 'pull',
             target: 'linebacker',
           },
         },
       ],
     },
     requirements: {
       minBlockers: 6,
     },
     suggestionHints: {
       runConcept: {
         gapScheme: 'gap',
         direction: 'right',
         bestAgainst: ['odd_front'],
       },
     },
   },
   ```

6. **빌드 확인**
   ```bash
   cd c:/FOC/editor && npm run build
   ```

## 루트 패턴 목록

### Angular Routes (꺾이는 루트)
- slant, out, corner, post, dig, in, cross, shallow, comeback, curl, hitch, flat, wheel, out_and_up, texas, whip

### Straight Routes (직선 루트)
- go, stick, snag, swing, flare, seam, screen, bubble

## 블록 스킴 목록

- zone_left, zone_right: 존 블로킹
- pull: 풀 블로킹
- trap: 트랩 블로킹
- kick_out: 킥아웃 블로킹
- down, base: 다운/베이스 블로킹

## 주의사항

- 컨셉 ID는 `pass_` 또는 `run_` 접두사 필수
- appliesTo 형식: `['WR:X', 'WR', 'TE:Y']` (포지션:라벨 또는 포지션만)
- depth는 야드 단위 (1-14)
- BALL과 QB에는 루트/블록 할당 금지
