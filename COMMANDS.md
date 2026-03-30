# Admin Test Commands

Commands for testing locally in Studio or by admins. All commands use the in-game chat (prefix with `/`). Available only to admins or when running in Roblox Studio.

## General

| Command | Description |
| ------- | ----------- |
| `/help` | List all available commands. |
| `/commands` | Same as `/help`. |

---

## Orb Commands (prefixed with `orb`)

| Command | Args | Description |
| ------- | ---- | ----------- |
| `/orbset [n]` | `n` (number) | Set orbs to `n` (absolute value). |
| `/orbadd [n]` | `n` (number) | Add `n` orbs to current orbs. |
| `/orbremove [n]` | `n` (number) | Remove `n` orbs from current orbs. |

---

## Money Commands (prefixed with `money`)

| Command | Args | Description |
| ------- | ---- | ----------- |
| `/moneyadd [n]` | `n` (number) | Add `n` to balance. |
| `/moneyremove [n]` | `n` (number) | Subtract `n` from balance. |

---

## Area Commands (prefixed with `area`)

| Command | Args | Description |
| ------- | ---- | ----------- |
| `/areagrow [x]` | `x` (number) | Add `x` studs (square studs of area) to player's polygon area. |
| `/areashape [shape]` | `shape` (string) | Replace player's polygon with preset shape. Use `narrow` for a long, narrow rectangle (10×160 studs). Default shape is a circle if `shape` is not recognized. |

---

## Bot Commands (prefixed with `bot`)

### Spawn and Area

| Command | Args | Description |
| ------- | ---- | ----------- |
| `/botadd [n]` | `n` (number, optional) | Add `n` bots near the player. Default is 1 if no argument. |
| `/botgrow [id] [x]` | `id` (optional), `x` (number) | Add `x` studs to a bot's polygon area. If `id` omitted, targets nearest bot. |
| `/botarea [id] [shape]` | `id` (optional), `shape` (string) | Set a bot's polygon to a preset shape (e.g. `narrow`). If no bot exists, spawns one first. If `id` omitted, targets nearest bot. |

### Movement Control

| Command | Args | Description |
| ------- | ---- | ----------- |
| `/botstop [id]` | `id` (optional) | Stop bot movement (pause pathfinding). Targets nearest bot if `id` omitted. |
| `/botgo [id]` | `id` (optional) | Resume bot pathfinding. Targets nearest bot if `id` omitted. |
| `/botface [id]` | `id` (optional) | Make bot rotate to face you. Targets nearest bot if `id` omitted. |
| `/botcome [id]` | `id` (optional) | Make bot move toward you. Targets nearest bot if `id` omitted. |

### Powerups

| Command | Args | Description |
| ------- | ---- | ----------- |
| `/botpower [id] [powerup]` | `id` (optional), `powerup` (string) | Make a bot use a powerup (no orb cost). Valid values: `nuke`, `laser`, `shield`, `tower`, `turbo`. Targets nearest bot if `id` omitted. Laser direction is toward the commanding player. |

---

## Scenario Commands

Predefined setups for testing. Each scenario purges other soldiers and towers, then applies the described setup.

| Command | Args | Description |
| ------- | ---- | ----------- |
| `/scenario tower [n]` | `n` (number, optional, default 3) | Purge all. Give 500 orbs. Place enemy tower at origin (attacks you). Spawn `n` bots near you. Use to test tower attacking behavior. |
| `/scenario narrow` | - | Purge all. Set your polygon to a narrow rectangle (10×160). Spawn 1 bot with narrow polygon. Use to test area cutting. |
| `/scenario crowd` | - | Purge all. Set your polygon to a large circle (diameter 200). Spawn 10 bots. Use to test with many bots nearby. |

---

## Utility Commands

| Command | Args | Description |
| ------- | ---- | ----------- |
| `/purge` | - | Kill all soldiers except yourself. |
| `/purge bot` | - | Kill only bots (soldiers whose id starts with `BOT_`). |
| `/force-reset` | - | Reset your save to default. |

---

## Bot ID Resolution

For bot commands that accept an optional `[id]`:

- If you provide a valid bot id (e.g. `BOT_1`), that bot is targeted.
- If you omit the id or provide an invalid one, the **nearest alive bot** to your position is targeted.
- If no bots exist, some commands (e.g. `/botarea`) will spawn one first.
