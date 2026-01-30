# Custom Game Systems Documentation

A comprehensive overview of all custom game systems developed for this Roblox game.

---

## 1. State Management System (Reflex-based)

**Main Files:**
- [store/index.ts](src/shared/store/index.ts) - Shared state definition
- [server/store/index.ts](src/server/store/index.ts) - Server store with broadcaster middleware
- [client/store/index.ts](src/client/store/index.ts) - Client store with receiver middleware

**Key Features:**
- Redux-like producer pattern using `@rbxts/reflex`
- Slice-based architecture with specialized producers:
  - `soldiersSlice` - Player/enemy soldier entities
  - `saveSlice` - Player save data (balance, skins)
  - `towerSlice` - Defensive tower entities
  - `gridSlice` - Territory/area claiming grid
  - `candyGridSlice` - Collectible candy entities
  - `milestoneSlice` - Server-side player achievement tracking

**Technical Challenges Solved:**
- Real-time state synchronization across server/client with automatic broadcasting
- Efficient state serialization for network transmission
- Centralized, immutable state updates with selector pattern

---

## 2. DataStore Wrapper & Player Persistence

**Main Files:**
- [save.ts](src/server/players/services/save.ts) - Save/load logic
- [save-slice.ts](src/shared/store/saves/save-slice.ts) - Save state slice
- [save-types.ts](src/shared/store/saves/save-types.ts) - PlayerSave interface

**Key Features:**
- Lapis-based DataStore wrapper for persistent player data
- Automatic save synchronization - watches store changes and writes to DataStore
- Graceful error handling with fallback to default save
- Player data schema validation using `@rbxts/t`

**Data Schema:**
```typescript
interface PlayerSave {
  balance: number;        // In-game currency
  skins: string[];        // Owned character skins
  skin: string;           // Currently equipped skin
}
```

**Technical Challenges Solved:**
- Automatic reactive persistence without explicit save calls
- Race condition handling between store updates and DataStore writes

---

## 3. Networking System (Remo + Reflex)

**Main Files:**
- [remotes.ts](src/shared/remotes.ts) - Remote definition and type safety
- [broadcaster.ts](src/server/store/middleware/broadcaster.ts) - Server broadcast middleware
- [receiver.ts](src/client/store/middleware/receiver.ts) - Client receiver middleware
- [serdes/index.ts](src/shared/serdes/index.ts) - State serialization/deserialization

**Remote Events:**
```typescript
remotes.store.dispatch()    // Send store actions to client
remotes.store.hydrate()     // Initial full state sync
remotes.soldier.spawn()     // Request spawn
remotes.soldier.move()      // Movement input
remotes.save.setSkin()      // Change equipped skin
remotes.save.buySkin()      // Purchase new skin
remotes.powerups.use()      // Activate powerup
remotes.client.alert()      // Client notifications
```

**Bandwidth Optimizations:**
- Excludes heavy actions from dispatch (`setSoldierPolygon`, `setSoldierTracers`)
- Excludes candy grid on subsequent hydrates
- Compresses grid cell line data using custom serialization
- Phasic dispatch rate batching

**Technical Challenges Solved:**
- Type safety for cross-boundary RPC calls
- Efficient network bandwidth management (~60-70% reduction)

---

## 4. Combat & Gameplay Mechanics

### Soldier/Player System

**Main Files:**
- [soldiers-saga.ts](src/server/world/services/soldiers/soldiers-saga.ts) - Soldier lifecycle
- [soldier-tick.ts](src/server/world/services/soldiers/soldier-tick.ts) - Per-frame updates
- [soldier-claims.ts](src/server/world/services/soldiers/soldier-claims.ts) - Territory claiming
- [soldier-slice.ts](src/shared/store/soldiers/soldier-slice.ts) - Entity definition

**Soldier Entity:**
```typescript
interface SoldierEntity {
  id: string;
  position: Vector2;
  polygon: Vector2[];           // Territory owned
  tracers: Vector2[];           // Trail for expansion
  orbs: number;                 // Powerup resource
  health: number;
  shieldActive: boolean;
  eliminations: number;
}
```

### Collision & Territory System

**Main Files:**
- [collision-tick.ts](src/server/world/services/collision/collision-tick.ts) - Collision detection
- [soldier-grid.ts](src/server/world/services/soldiers/soldier-grid.ts) - Spatial grid tracking
- [polybool/](src/shared/polybool/) - Polygon boolean operations library

**Key Features:**
- Polygon-based territory system with 2D polygonal areas
- Advanced polygon operations (Union, Difference, Intersection)
- Spatial grid optimization for collision queries
- 2-phase territory update: expansion and reduction

**Technical Challenges Solved:**
- Complex polygon boolean operations without external dependencies
- Efficient collision detection via spatial partitioning

### Bot/AI System

**Main Files:**
- [bot-saga.ts](src/server/world/services/bots/bot-saga.ts) - Bot lifecycle
- [buildBotMovementPath.ts](src/server/world/services/bots/buildBotMovementPath.ts) - Pathfinding
- [bot-events.ts](src/server/world/services/bots/bot-events.ts) - Bot event signals

**Key Features:**
- Dynamic bot population relative to player count
- Waypoint-based navigation with rectangle patterns
- Event-driven movement replanning
- Automatic respawn with cooldown

---

## 5. Combat Powerup System

**Main Files:**
- [powerups.service.ts](src/server/world/services/powerups/powerups.service.ts) - Powerup execution
- [powerups.ts](src/shared/constants/powerups.ts) - Configuration

**Available Powerups:**

| Powerup | Cost | Effect |
|---------|------|--------|
| **Turbo** | 10 orbs | 2x speed for 8 seconds |
| **Shield** | 20 orbs | Invulnerability for 10 seconds |
| **Tower** | 50 orbs | Defensive structure that damages enemies |
| **Laser Beam** | 100 orbs | Rectangular area damage corridor |
| **Nuclear** | 150 orbs | Circular explosion, kills all in radius |

**Technical Challenges Solved:**
- 3D geometry to 2D footprint conversion for collision
- Polygon difference operations for territory damage
- Circular explosion polygon generation

---

## 6. Economy & Rewards System

**Main Files:**
- [process-receipt.ts](src/server/products/services/process-receipt.ts) - Purchase handler
- [money.ts](src/server/products/services/money.ts) - Monetization config
- [rewards.ts](src/server/rewards/services/rewards.ts) - In-game rewards
- [badges.ts](src/server/rewards/services/badges.ts) - Achievement badges

**DevProducts (Real Money):**
- $0.99 → 100 credits
- $4.99 → 500 credits
- $49.99 → 5000 credits

**In-Game Rewards:**
- Score Milestones: $50-$28,000 for area achievements
- Rank Rewards: Top 3 earn $100/$75/$50 per session
- Passive Income: $20/$10/$5 per minute while top 3
- Kill Bounties: Dynamic based on enemy territory size

**Technical Challenges Solved:**
- Real-time reward detection via store observation
- Conditional passive income tracking

---

## 7. Inventory & Skin System

**Main Files:**
- [skins/](src/shared/constants/skins/) - Skin definitions
- [save-slice.ts](src/shared/store/saves/save-slice.ts) - Ownership tracking

**Features:**
- Free and purchasable skins
- Random skin option
- Persistent skin selection per player

---

## 8. Collection/Loot System (Candy)

**Main Files:**
- [candy-saga.ts](src/server/world/services/candy/candy-saga.ts) - Candy lifecycle
- [candy-tick.ts](src/server/world/services/candy/candy-tick.ts) - Per-frame updates
- [candy-grid/](src/shared/store/candy-grid/) - Candy state

**Features:**
- Dynamic spawning with world limits (2048 default, 256 dropping, 256 loot)
- Candy types: Default, Dropping, Loot (on death)
- Spatial grid management (resolution 5)
- Timed decay system

**Technical Challenges Solved:**
- Efficient management at scale (2000+ entities)
- Network optimization through spatial binning

---

## 9. Tower Defense System

**Main Files:**
- [tower-saga.ts](src/server/world/services/towers/tower-saga.ts) - Tower lifecycle
- [tower-tick.ts](src/server/world/services/towers/tower-tick.ts) - Combat logic
- [tower-slice.ts](src/shared/store/towers/tower-slice.ts) - Tower state

**Tower Entity:**
```typescript
interface TowerEntity {
  id: string;
  position: Vector2;
  ownerId: string;
  range: number;
  damage: number;
  currentTargetId?: string;
}
```

**Features:**
- Player-placed defensive structures
- Automatic enemy targeting and attack
- Cleanup on owner death
- Destructible via enemy powerups

---

## 10. Score/Milestone System

**Main Files:**
- [milestone-slice.ts](src/server/store/milestones/milestone-slice.ts) - State
- [milestones-saga.ts](src/server/rewards/services/milestones-saga.ts) - Setup
- [milestone-selectors.ts](src/server/store/milestones/milestone-selectors.ts) - Queries

**Milestone Thresholds:**
5K, 10K, 25K, 50K, 100K, 250K, 500K, 1M, 1.5M, 2M, 2.5M, 2.8M studs²

**Tracked Metrics:**
- Territory area (polygon size)
- Player rank (leaderboard position)
- Personal records per session

---

## 11. UI Framework (React-based)

**Main Files:**
- [app.tsx](src/client/app/app.tsx) - Main component
- [layout/](src/client/ui/layout/) - Layout components
- [components/](src/client/components/) - Game-specific UI

**Component Hierarchy:**
```
<App>
  <ErrorHandler>
    <BackgroundMusic />
    <Preloader />
    <Layer> (Game) - BirdCamera, Controller, World, GameUI
    <Layer> (Menu) - Home
    <Layer> (Alerts) - Alerts
  </ErrorHandler>
</App>
```

**Layout Components:**
- `VStack`/`HStack` - Flex-like layouts
- `ScrollingFrame` - Scrollable content
- `Layer` - Layered UI rendering
- `Padding` - Consistent spacing

---

## 12. Alert System

**Main Files:**
- [alerts.client.ts](src/client/alerts/alerts.client.ts) - Alert init
- [alert-remote.ts](src/client/alerts/handlers/alert-remote.ts) - Remote handler
- [alert-ranks.ts](src/client/alerts/handlers/alert-ranks.ts) - Rank alerts
- [alert-slice.ts](src/client/store/alert/alert-slice.ts) - Alert state

**Alert Types:**
- Remote alerts (money, purchases)
- Rank change notifications
- Powerup activation feedback

---

## 13. Game Tick Scheduler

**Main Files:**
- [scheduler.ts](src/shared/utils/scheduler.ts) - Universal tick scheduler

**Tick Phases:**
```
Phase 0.0   - Soldier movement
Phase 0.33  - Candy updates
Phase 0.66  - Collision detection
Phase 4     - Tower combat
```

**Technical Challenges Solved:**
- Distributes heavy computation across frames
- Prevents single-frame lag spikes

---

## 14. Serialization System

**Main Files:**
- [serdes/index.ts](src/shared/serdes/index.ts) - Main logic
- [serdes-soldier.ts](src/shared/serdes/handlers/serdes-soldier.ts) - Soldier serialization
- [serdes-candy-grid.ts](src/shared/serdes/handlers/serdes-candy-grid.ts) - Candy serialization
- [serdes-grid.ts](src/shared/serdes/handlers/serdes-grid.ts) - Territory serialization

**Features:**
- Memoization to avoid re-computation
- Custom string encoding (BitBuffer2)
- Differential updates

**Technical Challenges Solved:**
- 60-70% network payload reduction
- Efficient frequently-updated grid data

---

## 15. Polygon Geometry System

**Main Files:**
- [polybool/](src/shared/polybool/) - Full boolean geometry library
- [polygon.utils.ts](src/shared/polygon.utils.ts) - Extended utilities
- [polygon-extra.utils.ts](src/shared/polygon-extra.utils.ts) - Additional calculations

**Operations:**
- Union - Combine territories
- Difference - Cut damage/enemy areas
- Intersection - Find overlaps
- Area calculation
- Point-in-polygon testing

**Technical Achievement:**
- Full port of PolyBool library to TypeScript
- Robust polygon algebra without floating-point errors

---

## 16. Spatial Grid System

**Main Files:**
- [grid.ts](src/shared/utils/grid.ts) - Generic spatial grid
- [grid-lines.utils.ts](src/shared/utils/grid-lines.utils.ts) - Utilities

**Usage:**
- Soldier grid (resolution 20) - Territory cells
- Candy grid (resolution 5) - Collectible optimization
- Grid lines - Per-cell territory boundaries

---

## Architecture Summary

### Tech Stack
| Category | Technology |
|----------|------------|
| Language | TypeScript (roblox-ts) |
| State | Reflex (Redux-like) |
| UI | React (rbxts/react) |
| Networking | Remo (type-safe remotes) |
| Persistence | Lapis (DataStore wrapper) |
| Animation | Flipper (spring-based) |
| Validation | @rbxts/t |

### Design Patterns Used
1. **Producer Pattern** - Immutable state updates
2. **Observer Pattern** - Reactive store subscriptions
3. **Middleware Pattern** - State broadcasting/receiving
4. **Event-Driven** - Inter-system communication
5. **Scheduler Pattern** - Distributed tick execution
6. **Factory Pattern** - Command/product creation
7. **Strategy Pattern** - Domain-specific serialization

### Performance Optimizations
- Network bandwidth: ~60-70% reduction via compression
- CPU load: Distributed phased execution
- Collision: Spatial grid partitioning
- State: Selective broadcasting (excludes heavy actions)
- Serialization: Memoization of unchanged states
- Candy: Cell-based batching
- Grid: Differential cell updates
