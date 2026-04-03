import { Players, RunService } from "@rbxts/services";

// ── Map dimensions ──────────────────────────────────────────────────
export const MAP_WIDTH = 120;
export const MAP_HEIGHT = 100;
export const MAP_TOTAL_TILES = MAP_WIDTH * MAP_HEIGHT; // 12,000

// ── Rendering ───────────────────────────────────────────────────────
export const TILE_SIZE = 4; // studs per tile edge
export const CHUNK_SIZE = 10; // tiles per chunk edge (10×10 = 100 tiles per chunk)
export const CHUNKS_X = MAP_WIDTH / CHUNK_SIZE; // 12 chunks across
export const CHUNKS_Y = MAP_HEIGHT / CHUNK_SIZE; // 10 chunks down

// ── Simulation ──────────────────────────────────────────────────────
export const SIM_TICK = 1; // seconds between simulation ticks
export const WORLD_TICK = 1 / 20; // replication tick rate (Roblox limit)

// ── Economy ─────────────────────────────────────────────────────────
export const STARTING_FUNDS = 20000;

// Tool costs (Micropolis standard)
export const COST_RESIDENTIAL = 100;
export const COST_COMMERCIAL = 100;
export const COST_INDUSTRIAL = 100;
export const COST_ROAD = 10;
export const COST_RAIL = 20;
export const COST_POWER_LINE = 5;
export const COST_FIRE_STATION = 500;
export const COST_POLICE_STATION = 500;
export const COST_COAL_POWER = 3000;
export const COST_NUCLEAR_POWER = 5000;
export const COST_AIRPORT = 10000;
export const COST_SEAPORT = 5000;
export const COST_STADIUM = 5000;
export const COST_PARK = 10;
export const COST_BULLDOZE = 1;

// ── Environment flags ───────────────────────────────────────────────
export const IS_PROD = game.PlaceId === 137091142050829;
export const IS_CANARY = !IS_PROD;
export const IS_EDITOR = RunService.IsStudio() && !RunService.IsRunning();
export const IS_LOCAL = RunService.IsStudio() && RunService.IsRunning();

export const USER_ID = Players.LocalPlayer ? Players.LocalPlayer.UserId : 0;
export const USER_NAME = Players.LocalPlayer ? Players.LocalPlayer.Name : "(server)";
