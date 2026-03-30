import { SoldierEntity, SoldiersState } from "shared/store/soldiers";

// --- Vector math helpers ---

export function noiseDirection(t: number, seedX: number, seedY: number) {
	const nx = math.noise(t, seedX);
	const ny = math.noise(seedY, t);
	const v = new Vector2(nx, ny);
	return v === Vector2.zero ? new Vector2(1, 0) : v.Unit;
}

export function clamp01(value: number) {
	return math.clamp(value, 0, 1);
}

export function rotateTowards(current: Vector2, target: Vector2, maxAngleRadians: number) {
	if (current === Vector2.zero) return target;
	if (target === Vector2.zero) return current;

	const currentUnit = current.Unit;
	const targetUnit = target.Unit;
	const dot = currentUnit.X * targetUnit.X + currentUnit.Y * targetUnit.Y;
	const crossZ = currentUnit.X * targetUnit.Y - currentUnit.Y * targetUnit.X;
	const angle = math.atan2(crossZ, dot);

	if (math.abs(angle) <= maxAngleRadians) return targetUnit;

	const rotateBy = maxAngleRadians * math.sign(angle);
	const cosA = math.cos(rotateBy);
	const sinA = math.sin(rotateBy);
	return new Vector2(currentUnit.X * cosA - currentUnit.Y * sinA, currentUnit.X * sinA + currentUnit.Y * cosA);
}

// --- Death camera helpers ---

export function getDirectionToKiller(
	victimPos: Vector3,
	fallbackLookVector: Vector3,
	localSoldier: SoldierEntity,
	soldiersById: SoldiersState,
): Vector3 {
	const killerId = localSoldier.killedBy;
	const killer = killerId !== undefined ? soldiersById[killerId] : undefined;

	if (killer && killerId !== localSoldier.id) {
		const killerPos = new Vector3(killer.position.X, victimPos.Y, killer.position.Y);
		const flat = killerPos.sub(victimPos).mul(new Vector3(1, 0, 1));
		if (flat.Magnitude > 0.1) return flat.Unit;
	}

	return fallbackLookVector;
}

export function computeDeathCameraCFrame(pos: Vector3, direction: Vector3): CFrame {
	const right = new Vector3(-direction.Z, 0, direction.X);
	const eye = pos
		.sub(direction.mul(8))
		.add(right.mul(4))
		.add(new Vector3(0, 3, 0));
	const focus = pos.add(direction.mul(5)).add(new Vector3(0, 1, 0));
	return CFrame.lookAt(eye, focus);
}
