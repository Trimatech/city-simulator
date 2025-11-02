import { Debris, TweenService, Workspace } from "@rbxts/services";
import { CollisionGroups } from "shared/constants/collision-groups";
import { sliceArray } from "shared/polybool/poly-utils";

export const FORCE_MULTIPLIER = 15;
export const UPWARD_FORCE_BIAS = 0.3;
export const SPIN_FORCE = 90;
export const PIECE_SIZE = 1; // Each debris piece is 1x1x1 studs
export const FADE_DELAY = 5; // Seconds to wait before starting fade
export const FADE_DURATION = 1; // Duration of fade animation
export const MIN_PIECE_SIZE = 2;
export const MAX_PIECE_SIZE = 5;

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
	material?: Enum.Material;
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

export function createWallPieces({
	position,
	size,
	rotation,
	color,
	transparency,
	material = Enum.Material.SmoothPlastic,
}: CreateWallPiecesOptions) {
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
		piece.Material = material;
		piece.TopSurface = Enum.SurfaceType.Smooth;
		piece.BottomSurface = Enum.SurfaceType.Smooth;
		piece.CollisionGroup = CollisionGroups.WALL;
		piece.CFrame = new CFrame(box.position).mul(box.rotation);

		return piece;
	});
}

const Y_OFFSET = -1;

export function calculateWallTransform(line: [Vector2, Vector2], height: number) {
	const startP = line[0];
	const endP = line[1];

	// Create points at ground level (Y = 0)
	const startPoint = new Vector3(startP.X, 0, startP.Y);
	const endPoint = new Vector3(endP.X, 0, endP.Y);

	const direction = endPoint.sub(startPoint);
	const width = direction.Magnitude;

	// Calculate center position at ground level, then move up by height/2
	const groundCenter = startPoint.add(direction.mul(0.5));
	const center = new Vector3(groundCenter.X, height / 2 + Y_OFFSET, groundCenter.Z);

	// Calculate start position for cylinder
	const startPosition = new Vector3(startPoint.X, height / 2 + Y_OFFSET, startPoint.Z);

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

export function createWallHighlight(part: Part, color = Color3.fromRGB(255, 255, 255)) {
	const highlight = new Instance("Highlight");
	highlight.Adornee = part;
	highlight.FillTransparency = 1;
	highlight.OutlineTransparency = 0;
	highlight.OutlineColor = color;
	highlight.Parent = part;
	return highlight;
}

interface WallPartOptions {
	folderName: string;
	width: number;
	height: number;
	thickness: number;
	center: Vector3;
	rotation: CFrame;
	color: Color3;
	transparency: number;
	material: Enum.Material;
}

export function createWallPart({
	folderName,
	width,
	height,
	thickness,
	center,
	rotation,
	color,
	transparency,
	material,
}: WallPartOptions) {
	const part = new Instance("Part");
	part.Name = `${folderName}_wall`;
	part.Size = new Vector3(width, height, thickness);
	part.Color = color;
	part.Transparency = transparency;
	part.Material = material;
	part.TopSurface = Enum.SurfaceType.Smooth;
	part.BottomSurface = Enum.SurfaceType.Smooth;
	part.Anchored = true;
	part.CanCollide = false;
	part.CFrame = new CFrame(center).mul(rotation);
	return part;
}

interface CylinderOptions {
	folderName: string;
	height: number;
	thickness: number;
	startPosition: Vector3;
	color: Color3;
	transparency: number;
	material: Enum.Material;
}

export function createCylinder({
	folderName,
	height,
	thickness,
	startPosition,
	color,
	transparency,
	material,
}: CylinderOptions) {
	const cylinder = new Instance("Part");
	cylinder.Name = `${folderName}_cylinder`;
	cylinder.Size = new Vector3(height, thickness, thickness);
	cylinder.Color = color;
	cylinder.Transparency = transparency;
	cylinder.Material = material;
	cylinder.TopSurface = Enum.SurfaceType.Smooth;
	cylinder.BottomSurface = Enum.SurfaceType.Smooth;
	cylinder.Shape = Enum.PartType.Cylinder;
	cylinder.Anchored = true;
	cylinder.CanCollide = false;

	// Position cylinder at start of wall
	const cylinderCFrame = new CFrame(startPosition).mul(CFrame.fromEulerAnglesXYZ(0, 0, math.rad(90))); // Rotate cylinder to stand upright
	cylinder.CFrame = cylinderCFrame;

	return cylinder;
}

export function uncollideAndDestroy(part: Part, delay: number) {
	part.CanCollide = false;
	part.Anchored = false;
	part.Parent = Workspace;
	Debris.AddItem(part, delay);
}

export function positionWallAtGround({
	part,
	cylinder,
	center,
	rotation,
	startPosition,
}: {
	part: Part;
	cylinder: Part;
	center: Vector3;
	rotation: CFrame;
	startPosition: Vector3;
}) {
	const groundPartCFrame = new CFrame(new Vector3(center.X, 0, center.Z)).mul(rotation);
	part.CFrame = groundPartCFrame;
	const groundCylinderCFrame = new CFrame(new Vector3(startPosition.X, 0, startPosition.Z)).mul(
		CFrame.fromEulerAnglesXYZ(0, 0, math.rad(90)),
	);
	cylinder.CFrame = groundCylinderCFrame;
}

export function tweenWallToTarget({
	part,
	cylinder,
	targetPartCFrame,
	targetCylinderCFrame,
	duration = 0.8,
}: {
	part: Part;
	cylinder: Part;
	targetPartCFrame: CFrame;
	targetCylinderCFrame: CFrame;
	duration?: number;
}) {
	const info = new TweenInfo(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
	const partTween = TweenService.Create(part, info, { CFrame: targetPartCFrame });
	const cylinderTween = TweenService.Create(cylinder, info, { CFrame: targetCylinderCFrame });

	partTween.Play();
	cylinderTween.Play();

	return () => {
		partTween.Cancel();
		cylinderTween.Cancel();
	};
}
