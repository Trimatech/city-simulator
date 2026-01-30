import { useCamera, useEventListener } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useMemo, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Players, RunService } from "@rbxts/services";
import { WORLD_BOUNDS } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { selectLocalIsSpawned, selectLocalSoldier } from "shared/store/soldiers";
import { clampToCircle } from "shared/utils/world-bounds";

function noiseDirection(t: number, seedX: number, seedY: number) {
	const nx = math.noise(t, seedX);
	const ny = math.noise(seedY, t);
	const v = new Vector2(nx, ny);
	return v === Vector2.zero ? new Vector2(1, 0) : v.Unit;
}

function clamp01(value: number) {
	return math.clamp(value, 0, 1);
}

function rotateTowards(current: Vector2, target: Vector2, maxAngleRadians: number) {
	if (current === Vector2.zero) {
		return target;
	}

	if (target === Vector2.zero) {
		return current;
	}

	const currentUnit = current.Unit;
	const targetUnit = target.Unit;
	const dot = currentUnit.X * targetUnit.X + currentUnit.Y * targetUnit.Y;
	const crossZ = currentUnit.X * targetUnit.Y - currentUnit.Y * targetUnit.X;
	const angle = math.atan2(crossZ, dot);
	const absAngle = math.abs(angle);

	if (absAngle <= maxAngleRadians) {
		return targetUnit; // can snap to target within limit
	}

	const rotateBy = maxAngleRadians * math.sign(angle);
	const cosA = math.cos(rotateBy);
	const sinA = math.sin(rotateBy);
	// 2D rotation
	const x = currentUnit.X * cosA - currentUnit.Y * sinA;
	const y = currentUnit.X * sinA + currentUnit.Y * cosA;
	return new Vector2(x, y);
}

export function BirdCamera() {
	const camera = useCamera();
	const isSpawned = useSelector(selectLocalIsSpawned);
	const localSoldier = useSelector(selectLocalSoldier);

	const timeRef = useRef(0);
	const position2DRef = useRef(new Vector2(0, 0));
	const velocityRef = useRef(new Vector2(1, 0));
	const turnHandRef = useRef(math.random() < 0.5 ? 1 : -1); // 1: CCW, -1: CW
	const lastStreamUpdateRef = useRef(0); // Track when we last sent position to server

	const settings = useMemo(() => {
		return {
			altitude: 120,
			moveSpeed: 20, // slower sweep speed
			followDistance: 50, // how far behind the focus to place the eye (2D space)
			seedX: math.random(1, 1000),
			seedY: math.random(1, 1000),
			maxTurnDegPerSec: 30, // lower to avoid sharp turns at higher speed
		};
	}, []);

	useEffect(() => {
		// Initialize with a random starting point inside the world
		if (position2DRef.current.Magnitude === 0) {
			const angle = math.random() * 2 * math.pi;
			const radius = math.random() * (WORLD_BOUNDS * 0.5);
			position2DRef.current = new Vector2(math.cos(angle), math.sin(angle)).mul(radius);
		}
	}, []);

	useEffect(() => {
		if (isSpawned) {
			// Reset camera to follow the local humanoid when player (re)spawns
			const resetToCharacter = () => {
				const character = Players.LocalPlayer.Character;
				const humanoid = character?.FindFirstChildOfClass("Humanoid");
				if (!humanoid) return;
				camera.CameraSubject = humanoid;
				camera.CameraType = Enum.CameraType.Custom;
			};

			resetToCharacter();
			// ensure after replication settles
			//	Promise.delay(0).then(resetToCharacter);
			return;
		}

		const startPosition = localSoldier?.position;
		if (startPosition) {
			const clamped = clampToCircle({ position: startPosition, radius: WORLD_BOUNDS - 5 });
			position2DRef.current = clamped;
		}

		camera.CameraSubject = undefined;
		camera.CameraType = Enum.CameraType.Scriptable;

		// Send initial bird position to server for streaming
		remotes.camera.updateBirdPosition.fire(position2DRef.current);
		lastStreamUpdateRef.current = os.clock();
		return () => {
			camera.CameraType = Enum.CameraType.Custom;
		};
	}, [isSpawned]);

	useEventListener(RunService.RenderStepped, (dt) => {
		if (isSpawned) return;

		// Ensure we keep control of the camera while spectating
		camera.CameraType = Enum.CameraType.Scriptable;

		// Update server with bird position every 10 seconds for streaming
		const now = os.clock();
		if (now - lastStreamUpdateRef.current >= 5) {
			lastStreamUpdateRef.current = now;
			remotes.camera.updateBirdPosition.fire(position2DRef.current);
		}

		// Advance time for noise steering (slower noise progression for straighter flight)
		timeRef.current += dt * 0.05;
		const baseSteer = noiseDirection(timeRef.current, settings.seedX, settings.seedY);

		// Soft boundary steering: gently push inward as we approach the edge
		const position2D = position2DRef.current;
		const radius = position2D.Magnitude;
		const softStart = WORLD_BOUNDS * 0.6;
		const softEnd = WORLD_BOUNDS * 0.98;
		const edgeT = clamp01((radius - softStart) / (softEnd - softStart));
		const inward = position2D === Vector2.zero ? new Vector2(0, 0) : position2D.mul(-1).Unit;
		const boundarySteer = inward.mul(edgeT * edgeT);

		// Desired direction is a mix of current direction, noise, and boundary steer
		const mixed = velocityRef.current.mul(0.92).add(baseSteer.mul(0.08)).add(boundarySteer.mul(0.5));
		const desiredDir = mixed === Vector2.zero ? velocityRef.current : mixed.Unit;

		// Limit turn rate per frame to avoid sharp U-turns
		const maxTurn = ((settings.maxTurnDegPerSec * math.pi) / 180) * dt;
		velocityRef.current = rotateTowards(velocityRef.current, desiredDir, maxTurn);

		// Integrate position and clamp to world circle
		// Slightly reduce speed near the edge to help curving
		const speedFactor = 1 - 0.5 * edgeT;
		const nextPosition = position2DRef.current.add(velocityRef.current.mul(settings.moveSpeed * speedFactor * dt));
		const clamped = clampToCircle({ position: nextPosition, radius: WORLD_BOUNDS - 1 });
		position2DRef.current = clamped;

		// If we hit the boundary (clamp engaged), align velocity to a randomized tangent to avoid bias
		if (nextPosition !== clamped) {
			const radialDir = clamped === Vector2.zero ? new Vector2(1, 0) : clamped.Unit;
			const tangentCCW = new Vector2(-radialDir.Y, radialDir.X);
			const tangentCW = tangentCCW.mul(-1);
			const preferred = turnHandRef.current > 0 ? tangentCCW : tangentCW;
			const maxTurn = ((settings.maxTurnDegPerSec * math.pi) / 180) * dt;
			velocityRef.current = rotateTowards(velocityRef.current, preferred, maxTurn);

			// Occasionally flip handedness to randomize future edge glides
			if (math.random() < 0.3) {
				turnHandRef.current = -turnHandRef.current;
			}
		}

		// Compute eye and focus in 3D, mapping 2D world -> real space (1:1)
		const margin = 5;
		const focus2D = clampToCircle({ position: position2DRef.current, radius: WORLD_BOUNDS - margin });
		const effectiveFollow = settings.followDistance * (1 - 0.8 * edgeT);
		const unboundedEye2D = focus2D.sub(velocityRef.current.mul(effectiveFollow));
		const eye2D = clampToCircle({ position: unboundedEye2D, radius: WORLD_BOUNDS - margin });
		const focus3D = new Vector3(focus2D.X, 0, focus2D.Y);
		const eye3D = new Vector3(eye2D.X, settings.altitude, eye2D.Y);

		camera.CFrame = CFrame.lookAt(eye3D, focus3D, new Vector3(0, 1, 0));
	});

	return <></>;
}
