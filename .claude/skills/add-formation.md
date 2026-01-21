# /add-formation - 포메이션 추가

이 스킬은 새로운 포메이션을 editorStore.ts의 FORMATION_PRESETS에 추가합니다.

## 사용법

```
/add-formation [포메이션 이름]
```

예시:
```
/add-formation Trips Left
/add-formation Wishbone
```

## 실행 단계

1. **포메이션 정보 수집**
   - 이름이 제공되지 않으면 사용자에게 질문
   - 포메이션 타입 확인: Spread, Pro Style, Power, Option 중 선택

2. **플레이어 배치 결정**
   - 기본 OL (C, LG, RG, LT, RT) 배치
   - BALL 추가 (x: 0.5, y: 0)
   - 포지션별 배치 결정:
     - QB 위치 (under center vs shotgun)
     - RB/FB 위치
     - WR/TE 배치

3. **editorStore.ts 수정**
   - 파일 경로: `c:/FOC/editor/src/store/editorStore.ts`
   - FORMATION_PRESETS 객체에 새 포메이션 추가

4. **포메이션 구조**
   ```typescript
   formationKey: {
     name: '포메이션 이름',
     players: [
       { role: 'BALL', label: '', x: 0.5, y: 0, appearance: { shape: 'football', fill: '#8B4513', stroke: '#ffffff', showLabel: false, radius: 10 } },
       { role: 'C', label: 'C', x: 0.5, y: -0.03 },
       { role: 'LG', label: 'LG', x: 0.45, y: -0.03 },
       { role: 'RG', label: 'RG', x: 0.55, y: -0.03 },
       { role: 'LT', label: 'LT', x: 0.40, y: -0.03 },
       { role: 'RT', label: 'RT', x: 0.60, y: -0.03 },
       // ... 나머지 플레이어들
     ],
   },
   ```

5. **빌드 확인**
   ```bash
   cd c:/FOC/editor && npm run build
   ```

## 좌표 규칙

- X: 0.0 (왼쪽) ~ 1.0 (오른쪽), 0.5가 중앙
- Y: -0.4 (백필드 최대) ~ 0.6 (앞쪽)
- Y=0: LOS (Line of Scrimmage)
- Y=-0.03: OL 라인
- 1 yard = 0.04 normalized

## 주의사항

- BALL은 항상 포함 (x: 0.5, y: 0)
- 플레이어 role은 반드시 유효한 값: BALL, QB, RB, FB, WR, TE, C, LG, RG, LT, RT
- appearance 객체는 BALL만 커스텀, 나머지는 기본값 사용
