import { Players, RunService } from "@rbxts/services";

// Premium benefit applied when earning money passively
// during a game or when purchasing a product from the shop.
export const PREMIUM_BENEFIT = 1.2;

export const WORLD_BOUNDS = 960;
export const WORLD_TICK = 1 / 20;

export const SOLDIER_MIN_AREA = 100;
export const SOLDIER_SPEED = 24;
export const SOLDIER_BOOST_SPEED = 34;
export const SOLDIER_MAX_ORBS = 400;

export const REMOTE_TICK = 1 / 20; // Roblox limits

export const IS_PROD = game.PlaceId === 14162747150;
export const IS_CANARY = !IS_PROD;
export const IS_EDIT = RunService.IsStudio() && !RunService.IsRunning();

export const USER_ID = Players.LocalPlayer ? Players.LocalPlayer.UserId : 0;
export const USER_NAME = Players.LocalPlayer ? Players.LocalPlayer.Name : "(server)";

export const INITIAL_POLYGON_DIAMETER = 70;
export const INITIAL_POLYGON_ITEMS = 40;

export const WALL_HEIGHT = 7.1;
export const WALL_THICKNESS = 1;

export const TRACER_PIECE_LENGTH = 2;
export const TRACER_PIECE_HEIGHT = 4;
