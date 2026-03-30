# Zone Wars — Rewards & Milestones

## Currencies

The game has two currencies:

| Currency | Description |
|----------|-------------|
| **Cash ($)** | Primary currency, earned through gameplay. Used to buy wall visuals/skins. Premium players get a 1.2x bonus on all cash rewards. |
| **Crystals** | Secondary currency. Earned from daily rewards and picking up Crystal pickups on the map. |

---

## Per-Life Session Rewards (Cash)

These rewards are granted during a single life and reset on death.

### Rank Milestone Rewards

Granted once per life when the player first reaches a new top rank.

| Rank Achieved | Cash Reward |
|---------------|-------------|
| 1st place | $100 |
| 2nd place | $75 |
| 3rd place | $50 |

### Passive Rank Rewards

Granted every **3 minutes** (180s) while the player stays in the top 3.

| Rank Held | Cash per Tick |
|-----------|---------------|
| 1st place | $20 |
| 2nd place | $10 |
| 3rd place | $5 |

### Area Milestone Rewards

Granted once per life when the player's territory first crosses an area threshold.

| Area Threshold (studs^2) | Cash Reward |
|--------------------------|-------------|
| 5,000 | $50 |
| 10,000 | $100 |
| 25,000 | $250 |
| 50,000 | $500 |
| 100,000 | $1,000 |
| 250,000 | $2,500 |
| 500,000 | $5,000 |
| 1,000,000 | $10,000 |
| 1,500,000 | $15,000 |
| 2,000,000 | $20,000 |
| 2,500,000 | $25,000 |
| 2,800,000 | $28,000 |

### Kill Bounty Rewards

Granted immediately on each elimination. The bounty scales with the enemy's territory size, capped at $5,000.

| Trigger | Cash Reward |
|---------|-------------|
| Eliminate a player/bot | `min(ceil(enemyArea / 3), 5000)` |

### Passive Orb Income from Territory

Players earn orbs every 60 seconds based on current map ownership. Uses diminishing returns formula: `floor(sqrt(mapPercent * 100) / 2)`, capped at 35 orbs/min.

| Map % | Area (studs^2) | Orbs/min |
|-------|----------------|----------|
| 1% | ~29,000 | 5 |
| 2% | ~58,000 | 7 |
| 5% | ~145,000 | 11 |
| 10% | ~290,000 | 15 |
| 20% | ~580,000 | 22 |
| 50% | ~1,450,000 | 35 (cap) |

---

## Crystal Pickups (Map Rewards)

| Pickup | Crystals | Spawn | Respawn Delay |
|--------|----------|-------|---------------|
| ForceField Crystal | +1 crystal | 1 on map at a time, after 5s initial delay | 300s (5 min) after collected |

---

## Daily Rewards (Crystals)

A 7-day repeating cycle. The streak resets if the player doesn't claim within 48 hours of their last claim. Can only claim once per 24h.

| Day | Crystals |
|-----|----------|
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| 4 | 4 |
| 5 | 5 |
| 6 | 7 |
| 7 | 10 |

After day 7, the cycle repeats from day 1.

---

## Per-Life Milestones (tracked per life, reset on death)

These are tracked in the milestone state and reset when the player's soldier dies and respawns.

| Milestone | Tracked Value | Triggers Badge? |
|-----------|---------------|-----------------|
| Top Rank | Best rank achieved this life | Yes — Champion (1st), Runner Up (2nd), Podium (3rd) |
| Top Area | Highest area milestone reached | Yes — Settler (100K), Landlord (250K), Conqueror (500K), Empire (1M), World Dominator (2.5M) |
| Elimination Count | Total kills this life | Yes — First Blood (1), Killing Spree (5), Bounty Hunter (10), Executioner (50), Massacre (100) |
| Bot Kill Count | Bot kills this life | Yes — Bot Buster (10) |
| Candy Collected | Candy picked up this life | Yes — Collector (500) |
| Orbs Spent on Powerups | Total orbs spent this life | Yes — Big Spender (1,000) |
| Powerups Used | Unique powerups used this life | Yes — Speed Demon (turbo), Architect (tower), Nuke Option (nuke), Arsenal (all 5) |
| Head-On Victory | Won a head-on collision | Yes — Head-On Victor |
| Giant Slain | Eliminated the rank 1 player | Yes — Giant Slayer |
| Tower Destroyed | Destroyed an enemy tower | Yes — Tower Destroyer |
| Shield Blocked Death | Shield absorbed a lethal hit | Yes — Shielded |
| Last Damage At | Timestamp of last damage taken | Yes — Untouchable (5 min without damage) |
| Health < 10 | Survive with under 10 HP | Yes — Close Call |

---

## Session-Level Milestones (persist across lives, reset on leave)

These survive death and respawn but reset when the player leaves the server.

| Milestone | Tracked Value | Triggers Badge? |
|-----------|---------------|-----------------|
| Revive Count | Times revived this session | Yes — Second Chance (1 revive), Cat's Nine Lives (9 revives) |
| Rank 1 Count | Times reached rank 1 this session | Yes — Repeat Champion (10 times) |
| Rank 1 Since | Timestamp when rank 1 was first held | Yes — Undefeated (hold rank 1 for 5 continuous minutes) |

---

## Lifetime / Overall Milestones (persisted in save data)

These are saved permanently across sessions. Badges are one-time Roblox achievements.

| Milestone | Tracked Value | Triggers Badge? |
|-----------|---------------|-----------------|
| First Join | Player joined for the first time | Yes — Welcome |
| Daily Streak | Consecutive daily login streak | Yes — Dedicated (7-day streak completed) |
| Cash Balance | Current cash balance | Yes — Wealthy ($50,000), High Roller ($100,000) |
| Skin Equipped | Equipped a non-default skin | Yes — Fashionista |
| First Kill Bounty | Earned a kill bounty for the first time | Yes — Claimed |
| Laser Hit | Hit an enemy with Laser Beam powerup | Yes — Laser Precision |

---

## Lifetime Progression Milestones (cumulative, persisted)

These track cumulative stats across all sessions. Each category has multiple tiers with escalating thresholds and rewards (cash, crystals, orbs). Progress resets only on Ascension (prestige).

### A. Total Eliminations (10 tiers)
First Strike (1) -> Fighter (10) -> Warrior (25) -> Slayer (50) -> Destroyer (100) -> Annihilator (250) -> Warlord (500) -> Reaper (1K) -> Apex Predator (2.5K) -> Legend of War (5K)

### B. Total Area Claimed (10 tiers)
Newcomer (10K) -> Homesteader (50K) -> Landowner (250K) -> Baron (1M) -> Duke (5M) -> Sovereign (15M) -> Emperor (50M) -> Continental (150M) -> World Shaper (500M) -> Eternal Domain (1B)

### C. Total Orbs Earned (8 tiers)
Scavenger (200) -> Forager (1K) -> Harvester (5K) -> Hoarder (15K) -> Stockpiler (50K) -> Orb Lord (150K) -> Energy Baron (500K) -> Orb Master (1M)

### D. Total Time Alive (8 tiers)
Survivor (5 min) -> Tenacious (30 min) -> Enduring (2 hr) -> Steadfast (8 hr) -> Ironclad (24 hr) -> Immortal (72 hr) -> Timeless (200 hr) -> Eternal (500 hr)

### E. Times Reached Rank 1 (6 tiers)
Contender (1) -> Victor (5) -> Dominant (15) -> Supremacy (50) -> Undisputed (100) -> Goat (250)

### F. Total Orbs Spent (5 tiers)
Tactician (500) -> Strategist (2K) -> Commander (10K) -> General (50K) -> Mastermind (200K)

### G. Total Games Played (6 tiers)
Rookie (5) -> Regular (25) -> Dedicated (100) -> Veteran (500) -> Grinder (2K) -> Legend (10K)

---

## Prestige / Ascension System

When all 7 lifetime milestone categories are at max tier, the player can **Ascend**:
- All lifetime stat counters and milestone progress reset to 0
- Player keeps: cash, crystals, skins, daily streak
- Cosmetic rewards only (no gameplay advantages):
  - Ascension 1: Exclusive "Prestige Gold" wall skin + "Ascended" title
  - Ascension 2: "Prestige Diamond" skin + "Twice Ascended" title
  - Ascension 3+: "Prestige Obsidian" skin + escalating titles + 5 crystals each
  - Star icon next to name on scoreboard showing ascension count

---

## Badge Summary by Trigger Scope

| Scope | Badges |
|-------|--------|
| **Per-Life** | Settler, Landlord, Conqueror, Empire, World Dominator, Champion, Runner Up, Podium, First Blood, Killing Spree, Bounty Hunter, Executioner, Massacre, Bot Buster, Head-On Victor, Giant Slayer, Collector, Big Spender, Speed Demon, Architect, Nuke Option, Arsenal, Tower Destroyer, Shielded, Untouchable, Close Call |
| **Per-Session** | Second Chance, Cat's Nine Lives, Repeat Champion, Undefeated |
| **Lifetime** | Welcome, Dedicated, Wealthy, High Roller, Fashionista, Claimed, Laser Precision |

---

## Dev Products (Cash Purchases)

| Product | Cash Granted (includes bonus) |
|---------|-------------------------------|
| MONEY_100 | $110 |
| MONEY_500 | $600 |
| MONEY_2500 | $2,700 |
| MONEY_10000 | $20,000 |
| MONEY_100000 | $110,000 |

*Note: Premium players receive an additional 1.2x multiplier on top of these amounts.*

---

## Social Feed Alerts (no rewards, notifications only)

These are broadcast alerts shown to players but do not grant currency or badges.

| Event | Alert |
|-------|-------|
| First Blood | First non-bot kill of the round, broadcast to all |
| Kill Streak | Broadcast at 2, 3, 5, 10 kill streaks |
| Leader Eliminated | Broadcast when rank 1 player is killed |
| Revenge Kill | Personal alert when you kill the player who last killed you |
| Elimination | Personal kill/death notifications |
