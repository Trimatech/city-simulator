import { PhysicsService } from "@rbxts/services";

export const CollisionGroups = {
	WALL: "Wall",
	PLAYER: "Player",
} as const;

export function initiCollisionGroups() {
	// Register collision groups
	PhysicsService.RegisterCollisionGroup(CollisionGroups.WALL);
	PhysicsService.RegisterCollisionGroup(CollisionGroups.PLAYER);

	// Configure collision rules
	PhysicsService.CollisionGroupSetCollidable(CollisionGroups.WALL, CollisionGroups.PLAYER, false);
	PhysicsService.CollisionGroupSetCollidable(CollisionGroups.WALL, CollisionGroups.WALL, true);
}
