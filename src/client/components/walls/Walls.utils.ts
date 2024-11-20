import { TweenService } from "@rbxts/services";
import { CollisionGroups } from "shared/constants/collision-groups";
import { sliceArray } from "shared/polybool/poly-utils";
import { Point } from "shared/polybool/polybool";

export const FORCE_MULTIPLIER = 15;
export const UPWARD_FORCE_BIAS = 0.3;
export const SPIN_FORCE = 90;
export const PIECE_SIZE = 1; // Each debris piece is 1x1x1 studs
export const FADE_DELAY = 5; // Seconds to wait before starting fade
export const FADE_DURATION = 1; // Duration of fade animation
export const MIN_PIECE_SIZE = 1;
export const MAX_PIECE_SIZE = 3;

const BATCH_SIZE = 5; // How many pieces to process per frame
const GRAVITY = new Vector3(0, -30, 0);
const INITIAL_VELOCITY_RANGE = new Vector3(10, 15, 10);
const INITIAL_SPIN_RANGE = new Vector3(2, 2, 2);

interface CreateWallPiecesOptions {
	position: Vector3;
	size: Vector3;
	rotation: CFrame;
	color: Color3;
	transparency: number;
}

interface WallBox {
	position: Vector3;
	size: Vector3;
	rotation: CFrame;
}

function randomRange(min: number, max: number) {
	return min + math.random() * (max - min);
}

function sliceWallBox(box: WallBox, minSize: number): WallBox[] {
	const boxes: WallBox[] = [];
	const queue: WallBox[] = [box];

	while (queue.size() > 0) {
		const current = queue.shift()!;

		// If box is too small to split further, keep it
		if (current.size.X < minSize * 2 && current.size.Y < minSize * 2 && current.size.Z < minSize * 2) {
			boxes.push(current);
			continue;
		}

		// Choose longest axis to split
		let axis = 0; // 0 = X, 1 = Y, 2 = Z
		if (current.size.Y > current.size.X && current.size.Y > current.size.Z) {
			axis = 1;
		} else if (current.size.Z > current.size.X && current.size.Z > current.size.Y) {
			axis = 2;
		}

		// Get size along chosen axis
		const axisSize = axis === 0 ? current.size.X : axis === 1 ? current.size.Y : current.size.Z;

		// If axis is too small to split, keep the box
		if (axisSize < minSize * 2) {
			boxes.push(current);
			continue;
		}

		// Random split position between 0.3 and 0.7
		const splitRatio = randomRange(0.3, 0.7);
		const splitSize = axisSize * splitRatio;

		// Create two new boxes
		const box1Size = new Vector3(
			axis === 0 ? splitSize : current.size.X,
			axis === 1 ? splitSize : current.size.Y,
			axis === 2 ? splitSize : current.size.Z,
		);

		const box2Size = new Vector3(
			axis === 0 ? axisSize - splitSize : current.size.X,
			axis === 1 ? axisSize - splitSize : current.size.Y,
			axis === 2 ? axisSize - splitSize : current.size.Z,
		);

		// Calculate offset for second box
		const offset = current.rotation.VectorToWorldSpace(
			new Vector3(axis === 0 ? splitSize : 0, axis === 1 ? splitSize : 0, axis === 2 ? splitSize : 0),
		);

		// Create boxes with new positions and sizes
		const box1: WallBox = {
			position: current.position,
			size: box1Size,
			rotation: current.rotation,
		};

		const box2: WallBox = {
			position: current.position.add(offset),
			size: box2Size,
			rotation: current.rotation,
		};

		// Add new boxes to queue for further splitting
		queue.push(box1, box2);
	}

	return boxes;
}

export function createWallPieces({ position, size, rotation, color, transparency }: CreateWallPiecesOptions) {
	// Initial wall box
	const initialBox: WallBox = {
		position,
		size,
		rotation,
	};

	// Slice the wall into boxes
	const boxes = sliceWallBox(initialBox, MIN_PIECE_SIZE);

	// Create pieces from boxes
	return boxes.map((box, index) => {
		const piece = new Instance("Part");
		piece.Name = `debris_${index}`;
		piece.Size = box.size;
		piece.Color = color;
		piece.Transparency = transparency;
		piece.Material = Enum.Material.SmoothPlastic;
		piece.TopSurface = Enum.SurfaceType.Smooth;
		piece.BottomSurface = Enum.SurfaceType.Smooth;
		piece.CollisionGroup = CollisionGroups.WALL;
		piece.CFrame = new CFrame(box.position).mul(box.rotation);

		return piece;
	});
}

export function calculateWallTransform(line: [Point, Point], position: Vector3, height: number) {
	const startP = line[0];
	const endP = line[1];

	// Create points at ground level (Y = 0)
	const startPoint = new Vector3(startP[0], 0, startP[1]);
	const endPoint = new Vector3(endP[0], 0, endP[1]);

	const direction = endPoint.sub(startPoint);
	const width = direction.Magnitude;

	// Calculate center position at ground level, then move up by height/2
	const groundCenter = startPoint.add(direction.mul(0.5));
	const center = new Vector3(
		groundCenter.X + position.X,
		height / 2 + position.Y, // Move up by half height
		groundCenter.Z + position.Z,
	);

	// Calculate start position for cylinder
	const startPosition = new Vector3(startPoint.X + position.X, height / 2 + position.Y, startPoint.Z + position.Z);

	const rotation = CFrame.lookAt(new Vector3(), new Vector3(direction.X, 0, direction.Z)).mul(
		CFrame.fromEulerAnglesXYZ(0, math.rad(90), 0),
	);

	return {
		width,
		center,
		rotation,
		startPosition,
	};
}

export function startFadeOut(piece: Part) {
	const tweenInfo = new TweenInfo(FADE_DURATION, Enum.EasingStyle.Linear);

	// Wait for delay then start fade
	task.delay(FADE_DELAY, () => {
		const fadeTween = TweenService.Create(piece, tweenInfo, {
			Transparency: 1,
		});

		fadeTween.Play();
		fadeTween.Completed.Once(() => piece.Destroy());
	});
}

export function calculateDebrisForces(position: Vector3) {
	// Calculate force direction relative to center
	const horizontalDir = new Vector3(math.random(-1, 1), 0, math.random(-1, 1)).Unit;

	// Add upward component
	const force = horizontalDir
		.add(new Vector3(0, UPWARD_FORCE_BIAS, 0))
		.mul(FORCE_MULTIPLIER * (0.8 + math.random() * 0.4)); // Add some randomness to force magnitude

	// Reduced spin forces
	const torque = new Vector3(
		math.random(-SPIN_FORCE, SPIN_FORCE),
		math.random(-SPIN_FORCE, SPIN_FORCE),
		math.random(-SPIN_FORCE, SPIN_FORCE),
	);

	return { force, torque };
}

interface PhysicsState {
	velocity: Vector3;
	angularVelocity: Vector3;
}

// Keep track of physics states outside React's state
const physicsStates = new Map<Part, PhysicsState>();

export function initializePhysics(piece: Part) {
	// Random initial velocity with upward bias
	const velocity = new Vector3(
		math.random(-1, 1) * INITIAL_VELOCITY_RANGE.X,
		math.random(5, INITIAL_VELOCITY_RANGE.Y),
		math.random(-1, 1) * INITIAL_VELOCITY_RANGE.Z,
	);

	// Random initial spin
	const angularVelocity = new Vector3(
		math.random(-1, 1) * INITIAL_SPIN_RANGE.X,
		math.random(-1, 1) * INITIAL_SPIN_RANGE.Y,
		math.random(-1, 1) * INITIAL_SPIN_RANGE.Z,
	);

	physicsStates.set(piece, { velocity, angularVelocity });
}

export function cleanupPhysics(piece: Part) {
	physicsStates.delete(piece);
}

// Update physics for a batch of pieces
export function updatePiecesPhysics(pieces: Part[]) {
	const deltaTime = game.GetService("RunService").Heartbeat.Wait()[0];

	for (const piece of pieces) {
		const state = physicsStates.get(piece);
		if (!state) continue;

		// Update velocity with gravity
		state.velocity = state.velocity.add(GRAVITY.mul(deltaTime));

		// Update position
		const newPosition = piece.Position.add(state.velocity.mul(deltaTime));

		// Update rotation
		const rotation = piece.CFrame.ToEulerAnglesXYZ();
		const newRotation = new Vector3(
			rotation[0] + state.angularVelocity.X * deltaTime,
			rotation[1] + state.angularVelocity.Y * deltaTime,
			rotation[2] + state.angularVelocity.Z * deltaTime,
		);

		// Apply new transform
		piece.CFrame = new CFrame(newPosition).mul(
			CFrame.fromEulerAnglesXYZ(newRotation.X, newRotation.Y, newRotation.Z),
		);

		// Optional: Destroy pieces that fall too far
		if (newPosition.Y < -50) {
			piece.Destroy();
			physicsStates.delete(piece);
		}
	}
}

// Start crumbling animation for a group of pieces
export function startCrumbling(pieces: Part[]) {
	let currentBatch = 0;

	// Initialize physics for all pieces
	pieces.forEach((piece) => {
		piece.Anchored = false;
		initializePhysics(piece);
	});

	// Create physics update connection
	const connection = game.GetService("RunService").Heartbeat.Connect(() => {
		// Process next batch
		const start = currentBatch * BATCH_SIZE;
		const batch = sliceArray(pieces, start, start + BATCH_SIZE);

		if (batch.size() === 0) {
			// All pieces processed, cleanup
			connection.Disconnect();
			return;
		}

		updatePiecesPhysics(batch);
		currentBatch += 1;

		// Reset batch counter if we've processed all pieces
		if (start >= pieces.size()) {
			currentBatch = 0;
		}
	});

	// Start fade out for each piece
	pieces.forEach((piece, index) => {
		// Stagger the fade out to reduce load
		task.delay(FADE_DELAY + index * 0.1, () => {
			startFadeOut(piece);
		});
	});

	return () => {
		connection.Disconnect();
		pieces.forEach(cleanupPhysics);
	};
}
