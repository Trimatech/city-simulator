// Tracks last position where isInside was checked, for spatial optimization.
// Extracted to its own module to avoid circular dependencies.
const lastIsInsideCheckPosition = new Map<string, Vector2>();

export function getLastIsInsideCheckPosition(soldierId: string) {
	return lastIsInsideCheckPosition.get(soldierId);
}

export function setLastIsInsideCheckPosition(soldierId: string, position: Vector2) {
	lastIsInsideCheckPosition.set(soldierId, position);
}

/**
 * Invalidate the cached isInside position for a soldier, forcing a recheck
 * on the next collision tick. Call this when a soldier's polygon changes
 * externally (e.g. territory captured by another player).
 */
export function invalidateIsInsideCache(soldierId: string) {
	lastIsInsideCheckPosition.delete(soldierId);
}
