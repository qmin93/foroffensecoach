# Formation Presets Audit Report

## 1. Current System Overview

### Data Sources
| File | Count | Purpose |
|------|-------|---------|
| `docs/exports/formation-presets.ts` | 51 | Main presets with hardcoded coordinates |
| `editor/src/lib/alignment/formationRules.ts` | 12 | Rule-based system (AlignmentSpec) |
| `editor/src/data/formation-library.ts` | 18 | Metadata for recommendations |
| `docs/audits/formation-presets.audit.ts` | 11 | Audit version (symbolic positions) |

### Reference Document
- `docs/formations-and-concepts.md` lists **51 formations** as the specification

---

## 2. Audit File Analysis

### Formation Coverage
The audit file (`formation-presets.audit.ts`) covers 11 formations:

| Audit ID | Name | Structure | Personnel | Status in Main Presets |
|----------|------|-----------|-----------|------------------------|
| `under_ace` | Ace (Under) | under_center | 12 | ✅ Exists as `ace` |
| `under_i` | I-Formation | under_center | 21 | ✅ Exists as `iFormation` |
| `gun_2x2` | Shotgun 2x2 | shotgun | 11 | ✅ Exists as `spread` |
| `gun_3x1` | Shotgun 3x1 | shotgun | 11 | ⚠️ Similar to `trips` |
| `gun_trips_open` | Trips Open | shotgun | 11 | ⚠️ Duplicate of gun_3x1 |
| `gun_bunch` | Shotgun Bunch | shotgun | 11 | ✅ Exists as `bunch` |
| `gun_stack` | Shotgun Stack | shotgun | 11 | ✅ Exists as `stackRight` |
| `pistol_2x2` | Pistol 2x2 | pistol | 11 | ✅ Exists as `pistol` |
| `pistol_ace` | Pistol Ace | pistol | 12 | ❌ Missing |
| `empty_3x2` | Empty 3x2 | shotgun | 10 | ✅ Exists as `emptySet` |
| `empty_3x1` | Empty 3x1 | shotgun | 10 | ⚠️ Partially as `emptyTrips` |

### Issues Found
1. **Duplicate**: `gun_3x1` and `gun_trips_open` have identical positions
2. **Missing**: `pistol_ace` (12 personnel pistol) not in main presets
3. **Symbolic positions** need mapping to `ALIGNMENT_PRESETS`

---

## 3. Position Mapping

### Audit Symbolic Positions → ALIGNMENT_PRESETS

| Audit Position | AlignmentSpec Key | Coordinates |
|----------------|-------------------|-------------|
| `under_center` | `QB_UC` | x: 0.5, y: -0.09 |
| `shotgun` | `QB_GUN` | x: 0.5, y: -0.15 |
| `pistol` | `QB_PISTOL` | x: 0.5, y: -0.10 |
| `wide_left` | `SIDELINE_L` + 0 offset | x: 0.05, y: -0.03 |
| `wide_right` | `SIDELINE_R` + 0 offset | x: 0.95, y: -0.03 |
| `slot_left` | `SLOT_L` | x: 0.15, y: -0.05 |
| `slot_right` | `SLOT_R` | x: 0.85, y: -0.05 |
| `inline_left` | `TE_L` | x: 0.38, y: -0.03 |
| `inline_right` | `TE_R` | x: 0.62, y: -0.03 |
| `i_depth` | Custom: -4.75 yards | x: 0.5, y: -0.19 |
| `deep_i` | Custom: -4.75 yards | x: 0.5, y: -0.19 |
| `offset_weak` | `RB_GUN_L` | x: 0.46, y: -0.15 |
| `offset_strong` | `RB_GUN_R` | x: 0.54, y: -0.13 |
| `pistol_depth` | Custom: -4.5 yards | x: 0.5, y: -0.18 |
| `inside_slot_right` | `SLOT_R_TIGHT` | x: ~0.78, y: -0.05 |
| `inside_slot_left` | `SLOT_L_TIGHT` | x: ~0.22, y: -0.05 |
| `point` | Bunch point | x: 0.75, y: -0.03 |
| `inside_bunch` | Bunch inside | x: 0.78, y: -0.08 |
| `outside_bunch` | Bunch outside | x: 0.82, y: -0.03 |
| `stack_front_left` | Stack front | x: 0.15, y: -0.03 |
| `stack_back_left` | Stack back | x: 0.15, y: -0.09 |

### Missing Mappings (Need Definition)
- `slot_left_inside` - RB as slot in empty
- Custom bunch/stack positions need precise specs

---

## 4. Validation Against Reference (51 Formations)

### Coverage Analysis

#### Covered by Rule System (12)
- spread_2x2, trips_rt, i_formation, singleback, shotgun_11, pistol
- bunch_rt, twins_rt, pro_set, ace_12, empty_3x2, goal_line

#### In Main Presets but Not Rules (39)
| Category | Formations |
|----------|-----------|
| **Spread/Trips** | trips, tripsLeft, bunchLeft, quadsRight, quadsLeft |
| **Twins** | twins, twinsLeft, aceTwinsRight, aceTwinsLeft |
| **Stack** | stackRight, stackLeft |
| **Tight End** | doubleTightRight, doubleTightLeft, treyRight, treyLeft |
| **Heavy** | goalLine, heavy, jumbo, big |
| **Pro Style** | proSet, splitBacks, near, far, fullHouse, marylandI, powerI |
| **Wing** | wingT, wingRight, wingLeft |
| **Unbalanced** | unbalancedRight, unbalancedLeft |
| **Option** | tFormation, wishbone, flexbone, veer, wildcat, speedOption, midlineOption, loadOption, tripleRight |
| **Slot** | slot, slotLeft, spreadTight |
| **Bunch** | tightBunchRight, tightBunchLeft |

---

## 5. Integration Plan

### Phase 1: Add Missing Position Mappings to alignmentSpecs.ts
```typescript
// Add to ALIGNMENT_PRESETS
'RB_PISTOL': { anchor: 'CENTER', offsetYards: 0, depth: -4.5 },
'FB_OFFSET_STRONG': { anchor: 'RG', offsetYards: 1, depth: 'FB' },
'INSIDE_SLOT_R': { anchor: 'RT', offsetYards: 4, depth: 'SLOT', onLOS: false },
'INSIDE_SLOT_L': { anchor: 'LT', offsetYards: -4, depth: 'SLOT', onLOS: false },
'BUNCH_POINT_R': { anchor: 'HASH_R', offsetYards: 2, depth: 'LOS', onLOS: true },
'BUNCH_INSIDE_R': { anchor: 'HASH_R', offsetYards: 3, depth: -2, onLOS: false },
'BUNCH_OUTSIDE_R': { anchor: 'HASH_R', offsetYards: 4, depth: 'LOS', onLOS: true },
'STACK_FRONT_L': { anchor: 'NUMBERS_L', offsetYards: 0, depth: 'LOS', onLOS: true },
'STACK_BACK_L': { anchor: 'NUMBERS_L', offsetYards: 0, depth: 'SLOT', onLOS: false },
```

### Phase 2: Add Pistol Ace to formationRules.ts
```typescript
pistol_ace: {
  id: 'pistol_ace',
  name: 'Pistol Ace',
  personnel: '12',
  tags: ['pistol', 'power', 'duo', 'play_action'],
  snapType: 'pistol',
  strength: 'balanced',
  playerRules: [
    // O-Line + 2 TE + 2 WR + QB + RB
  ],
},
```

### Phase 3: Migrate Remaining 39 Formations to Rule System
Priority order:
1. High-use formations (twins, slot, treyRight)
2. Heavy/Goal Line (jumbo, heavy, big)
3. Option formations (wishbone, flexbone, veer)
4. Unbalanced (requires shifted O-Line anchors)

---

## 6. Recommendations

1. **Remove duplicate** `gun_trips_open` from audit (identical to `gun_3x1`)
2. **Add `pistol_ace`** to both rule system and main presets
3. **Standardize naming** convention:
   - Audit uses `gun_*`, `under_*`, `pistol_*` prefixes
   - Main presets use camelCase without prefix
   - Recommend: Use audit naming for new rule-based system

4. **Create FormationPreset type** that bridges symbolic positions to AlignmentSpecs
5. **Migrate incrementally** - don't replace all 51 at once

---

## 7. Type Definition Needed

```typescript
// editor/src/types/formation.ts
export interface FormationPreset {
  id: string;
  name: string;
  structure: 'under_center' | 'shotgun' | 'pistol';
  personnel: '10' | '11' | '12' | '20' | '21' | '22' | '13';
  tags: string[];
  positions: Record<string, PositionKey>;  // X, Y, Z, H, QB, RB, FB → PositionKey
}

export type PositionKey =
  | 'under_center' | 'shotgun' | 'pistol'  // QB
  | 'wide_left' | 'wide_right'              // WR outside
  | 'slot_left' | 'slot_right'              // WR slot
  | 'inline_left' | 'inline_right'          // TE
  | 'i_depth' | 'deep_i' | 'pistol_depth'   // RB
  | 'offset_weak' | 'offset_strong'         // FB/RB offset
  | 'point' | 'inside_bunch' | 'outside_bunch'  // Bunch
  | 'stack_front_left' | 'stack_back_left';     // Stack
```
