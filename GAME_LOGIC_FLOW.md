# LOL Classical - Toan bo luong logic hien tai

Tai lieu nay mo ta logic moi nhat, bao gom:
- lobby nhap nickname truoc khi vao game,
- campaign level tuan tu 1 -> 5 (khong cho chon level giua tran),
- timer theo level,
- pause/restart/hint,
- pathfinding BFS + shift board theo level.

## 1) Tong quan kien truc file

- `src/App.vue`: lobby, campaign progression, mount `GameBoard` theo level hien tai.
- `src/components/GameBoard.vue`: gameplay UI + dieu phoi cac composable.
- `src/components/Tile.vue`: 1 tile, render icon champion + state selected/invalid/hint.
- `src/composables/useGameBoard.ts`: board engine (init/remove/shift/shuffle/deadlock/hint).
- `src/composables/useSelection.ts`: state machine chon tile.
- `src/composables/usePathFinding.ts`: BFS tim duong hop le <= 2 turns.
- `src/composables/useGameSession.ts`: timer, pause, game over state.
- `src/utils/champion-icons.ts`: load icon tu folder `lol_champion_icons`.
- `src/utils/board-helpers.ts`: helper clone board, check board cleared.
- `src/types/game.ts`: type trung tam.

## 2) Luong khoi dong app va vao tran

### Buoc A - Render root

1. `src/main.ts` mount `App.vue`.
2. `App.vue` hien header + lobby card (`Enter The Rift`).

### Buoc B - Lobby

1. Nguoi choi nhap nickname.
2. Nhan `Start`:
   - `playerName` duoc gan,
   - `currentLevel` reset ve 1,
   - `hasStarted = true`,
   - `boardInstanceKey` tang de mount moi board.
3. Luu y:
   - block chon level da bi comment tam thoi.
   - level duoc khoa theo campaign tuan tu.

### Buoc C - Mount GameBoard

`App.vue` render:
- `<GameBoard :player-name :level :key ... @level-complete="onLevelComplete" />`

`key` thay doi theo level de reset toan bo state game cho level tiep theo.

## 3) Campaign progression (1 -> 5)

Trong `App.vue`:

1. `GameBoard` emit su kien `levelComplete(level)` khi thang level hien tai.
2. `onLevelComplete` xu ly:
   - neu level < 5: tang `currentLevel`, tang `boardInstanceKey` -> vao level tiep.
   - neu level = 5: `isCampaignCompleted = true` -> hien man hinh complete.
3. Man hinh complete co nut `Choi lai tu level 1`.

## 4) Board engine va level shift

Trong `useGameBoard.ts`:

### Khoi tao board

1. Lay icon tu `championIconIds`.
2. `buildBoard(width, height, icons)`:
   - tao pool icon theo cap (so luong chan),
   - shuffle pool,
   - tao padded board (`width + 2`, `height + 2`),
   - dat tile playable vao [1..width], [1..height].

### Remove pair + apply level behavior

`removePair(first, second, level)`:
1. set 2 tile vua match thanh empty.
2. goi `applyLevelShift(next, level)`:
   - Level 1: khong shift.
   - Level 2: shift ngang, tile tu phai bo vao o trong (don ve trai).
   - Level 3: shift ngang, tile tu trai bo vao o trong (don ve phai).
   - Level 4: shift doc, tile tu tren bo xuong (don xuong duoi).
   - Level 5: shift doc, tile tu duoi bo len (don len tren).

### Deadlock va shuffle

- `hasValidMoveInternal(board)`: group theo icon, check pair cung icon bang `isMatch`.
- `shuffleRemaining()`: tron icon cua tile khong rong va gan lai.
- `shuffleUntilPlayable(maxRetries=40)`: lap den khi co move hop le.

### Hint

- `getHintPair()`: tim va tra ve cap tile hop le dau tien (neu co).

## 5) Selection flow (click tile)

Trong `useSelection.ts`, `selectTile(board, tile)`:

1. tile empty -> bo qua.
2. chua co `first` -> gan `first`.
3. click lai cung tile -> giu single selection.
4. co `first` roi -> gan `second`, goi `findPath`.
5. neu match:
   - callback `onMatch(first, second, path)`.
   - reset selection.
6. neu fail:
   - callback `onInvalid()`,
   - reset selection.

## 6) Pathfinding BFS

Trong `usePathFinding.ts`:

1. Check input:
   - 2 tile khong rong, cung icon, khong trung vi tri.
2. BFS state gom:
   - `(x, y)`,
   - `direction`,
   - `turns`,
   - `path`.
3. Moi step thu 4 huong `up/right/down/left`.
4. `canStep` cho phep di qua:
   - o rong,
   - hoac tile dich,
   - trong gioi han padded board.
5. Gioi han:
   - `turns <= 2`.
6. Den dich -> tra `isMatch=true` + full path + turns.
7. Het queue -> `isMatch=false`.

## 7) Game session: timer, pause, restart

Trong `useGameSession.ts`:

### Timer theo level

Duration duoc truyen tu `GameBoard` theo mapping:
- L1: 180s
- L2: 160s
- L3: 160s
- L4: 140s
- L5: 140s

### State va ham

- `remainingSeconds`
- `formattedTime` (mm:ss)
- `isPaused`
- `isComplete`
- `isTimeUp`
- `isGameOver = isComplete || isTimeUp`
- `togglePause()`
- `restartTimer()`

Khi pause:
- timer dung.
- UI board bi overlay che kin de chong gian lan.

## 8) Luong onMatch trong GameBoard

Trong callback `onMatch` cua `GameBoard.vue`:

1. gan `lastPath` de ve line.
2. goi `removePair(first, second, props.level)`.
3. neu chua complete va het move -> `shuffleUntilPlayable()`.
4. setTimeout de an path sau ~260ms.

## 9) UI controls trong GameBoard

- `Pause/Resume`: khoa tuong tac tile khi pause, che board.
- `Shuffle`: chi dung khi khong pause va chua game over.
- `Hint`: highlight 1 cap hop le tam thoi (~900ms).
- `Restart`: reset board + timer + local ui state (selection/path/invalid/hint).

## 10) Render icon va duong noi

### Icon champion

`Tile.vue`:
- lay URL icon qua `getChampionIconUrl(tile.icon)`,
- render `<img>` neu tile khong rong.

### Path line

`GameBoard.vue`:
1. convert `lastPath.nodes` -> pixel points.
2. render `svg polyline`.
3. svg mo rong voi `borderOffset` de hien duong vong border ao.
4. khong cat bot diem border, tranh noi tat de len icon.

## 11) Chuoi call ham thao tac chinh

Khi click tile:

1. `Tile.vue` emit `click(tile)`.
2. `GameBoard:onTileClick(tile)` -> guard `isGameOver/isPaused`.
3. `useSelection.selectTile(board, tile)`.
4. `usePathFinding.findPath(...)`.
5. Neu match:
   - `GameBoard:onMatch(...)`
   - `useGameBoard.removePair(..., level)`
   - co the `shuffleUntilPlayable()`.
6. UI cap nhat:
   - tile bien mat + shift theo level,
   - line hien thi tam thoi,
   - timer tiep tuc (neu khong pause),
   - neu clear board -> emit `levelComplete`.

## 12) Chuc nang theo file (tom tat nhanh)

- `src/App.vue`: lobby + campaign state machine + transition level.
- `src/components/GameBoard.vue`: gameplay orchestration + controls.
- `src/components/Tile.vue`: tile render va tile states.
- `src/composables/useGameBoard.ts`: board lifecycle + level shift + hint/deadlock.
- `src/composables/useSelection.ts`: selection state machine.
- `src/composables/usePathFinding.ts`: BFS rule engine.
- `src/composables/useGameSession.ts`: timer/pause/gameover.
- `src/utils/champion-icons.ts`: asset adapter cho icon champion.
- `src/utils/board-helpers.ts`: clone/clear checks.
- `src/types/game.ts`: data contracts/type contracts.
