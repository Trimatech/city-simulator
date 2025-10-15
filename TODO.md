# ✅ Divide and Qonquer – Development To-Do List

A structured roadmap to build and polish _Divide and Qonquer_, a viral, competitive Roblox land-control game.

---

## 🔹 Phase 1: Core Gameplay Prototype

_Goal: Build the minimum playable version to test the main loop._

-   [x] Implement player movement (WASD / joystick / mobile drag)
-   [x] Detect when player exits their conquered zone
-   [x] Begin drawing line automatically on exit
-   [x] Stop line when returning to territory
-   [x] Calculate enclosed area and claim it visually
-   [x] Add death condition if another player touches the line
-   [x] Respawn player after death
-   [x] Create basic arena map with 1 biome (e.g. Grassland)

---

## 🔹 Phase 2: Multiplayer & Collision Logic

_Goal: Real-time PvP and territory management._

-   [x] Support multiple players in the same arena
-   [x] Handle safe/unsafe zones per player
-   [ ] Add collision bounce when players meet outside their zones
-   [x] Add player death if line is touched by another
-   [x] Track and update territory percentage per player

---

## 🔹 Phase 3: Orb System & Abilities

_Goal: Add resource collection and competitive powers._

-   [x] Spawn orbs randomly on the map
-   [x] Add orb pickup logic
-   [ ] Display and fill Orb Power Meter (UI)
-   [ ] Play progressively deeper sound on each orb collected
-   [ ] Unlock powers as meter fills:
    -   [x] Turbo
    -   [x] Turbo 2x (perhaps we will remove this)
    -   [ ] Build Tower
    -   [x] Shield
    -   [x] Explosion
    -   [x] Mega Explosion
-   [ ] Add visual + sound effects for each ability

---

## 🔹 Phase 4: Sound & Visual Polish

_Goal: Satisfying game feel through feedback._

-   [ ] Line drawing: smooth glide sound with rising pitch
-   [ ] Land claim: pop + ripple animation and sound
-   [ ] Orb pickup: glow pulse + collection sound
-   [ ] Player death: crack sound + shatter dissolve effect
-   [ ] Explosion: shockwave, particles, screen shake
-   [ ] Player trails and zone colors should be unique per player

---

## 🔹 Phase 5: Biomes & Map Variety

_Goal: Visual depth and strategic variety._

-   [ ] Add new biomes: Desert, Forest, City, River, Lava
-   [ ] Biome-specific visuals and sounds
-   [ ] Vary orb spawn types and densities by biome
-   [ ] Optional: Biomes influence risk/reward balance

---

## 🔹 Phase 6: UI, Leaderboard & Progress Feedback

_Goal: Reinforce player progress and competition._

-   [ ] Real-time leaderboard showing top 5 players (by land %)
-   [ ] Live % of map owned shown in UI and on mini-map
-   [ ] Show gold crown above top player
-   [ ] Display player kill counter + badges

---

## 🔹 Phase 7: Viral & Social Features

_Goal: Drive content creation and social engagement._

-   [ ] "First Blood" notification + sound effect
-   [ ] Kill streak UI popups
-   [ ] Trigger slow-mo camera on big kills/explosions
-   [ ] Auto-record highlights for TikTok/Shorts
-   [ ] Emote wheel (trigger emotes after kill or land claim)
-   [ ] Reward first kill with cosmetic or badge

---

## 🔹 Phase 8: Monetization (Optional)

_Goal: Generate revenue through non-pay-to-win cosmetics._

-   [ ] Cosmetic shop for:
    -   [ ] Player skins
    -   [ ] Trail effects
    -   [ ] Explosion styles
    -   [ ] Emotes
    -   [ ] Tower skins
-   [ ] VIP pass (early access, bonus orb spawns, exclusive skins)
-   [ ] Daily cosmetic rotation system

---

## 🔹 Phase 9: Testing & Optimization

_Goal: Prep for a stable and polished launch._

-   [ ] Playtest in small group
-   [ ] Fix multiplayer desync / latency issues
-   [ ] Optimize land calculation and drawing performance
-   [ ] Polish UI transitions and responsiveness
-   [ ] Add quick tutorial for new players
-   [ ] Bug tracking & crash testing
