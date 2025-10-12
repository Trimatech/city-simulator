import { WORLD_BOUNDS } from "shared/constants/core";

interface ClampToCircleParams {
	readonly position: Vector2;
	readonly radius?: number;
}

export function clampToCircle({ position, radius = WORLD_BOUNDS }: ClampToCircleParams) {
	if (radius <= 0) {
		return new Vector2();
	}

	const magnitude = position.Magnitude;
	if (magnitude <= radius) {
		return position;
	}

	const direction = position.Unit;
	return direction.mul(radius);
}
