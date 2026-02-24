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
export const IS_EDITOR = RunService.IsStudio() && !RunService.IsRunning();
export const IS_LOCAL = RunService.IsStudio() && RunService.IsRunning();

export const USER_ID = Players.LocalPlayer ? Players.LocalPlayer.UserId : 0;
export const USER_NAME = Players.LocalPlayer ? Players.LocalPlayer.Name : "(server)";

export const INITIAL_POLYGON_DIAMETER = 70;
export const INITIAL_POLYGON_ITEMS = 40;

export const WALL_HEIGHT = 12.1;
export const WALL_THICKNESS = 1;

export const TRACER_PIECE_LENGTH = 5;
export const TRACER_PIECE_HEIGHT = 6;

// Wall tags for CollectionService
export const WALL_TAG = "GameWall";

// Wall attributes
export const WALL_ATTR_TIME_ADDED = "TimeAdded";
export const WALL_ATTR_KIND = "WallKind";
export const WALL_ATTR_OWNER_ID = "OwnerId";
export const WALL_ATTR_EDGE_ID = "EdgeId";
export const WALL_ATTR_TARGET_Y = "TargetY";
export const WALL_ATTR_SKIN_ID = "SkinId";

// How far underground to spawn walls (just below ground level)
export const WALL_UNDERGROUND_OFFSET = -2;

// Animation threshold in seconds
export const WALL_ANIMATION_THRESHOLD = 1;

// Candy tags for CollectionService
export const CANDY_TAG = "GameCandy";

// Candy attributes
export const CANDY_ATTR_ID = "CandyId";
export const CANDY_ATTR_TIME_ADDED = "TimeAdded";
export const CANDY_ATTR_SIZE = "Size";
export const CANDY_ATTR_TARGET_Y = "TargetY";
export const CANDY_ATTR_EATEN = "Eaten";

// Candy spawn height (at ground level, will animate up)
export const CANDY_GROUND_Y = 0;
export const CANDY_TARGET_Y = 4;

// Candy animation
export const CANDY_SPAWN_ANIMATION_DURATION = 0.5;
export const CANDY_EAT_ANIMATION_DURATION = 1;
export const CANDY_EAT_FLOAT_HEIGHT = 15;
export const CANDY_EAT_FINAL_SIZE = 0.1;
