import { PhysicsService } from "@rbxts/services";

export const CollisionGroups = {
	WALL: "Wall",
	PLAYER: "Player",
	DEBRIS: "Debris",
} as const;

export function initiCollisionGroups() {
	// Register collision groups
	PhysicsService.RegisterCollisionGroup(CollisionGroups.WALL);
	PhysicsService.RegisterCollisionGroup(CollisionGroups.PLAYER);
	PhysicsService.RegisterCollisionGroup(CollisionGroups.DEBRIS);

	// Configure collision rules
	PhysicsService.CollisionGroupSetCollidable(CollisionGroups.WALL, CollisionGroups.PLAYER, false);
	PhysicsService.CollisionGroupSetCollidable(CollisionGroups.WALL, CollisionGroups.WALL, true);
}
