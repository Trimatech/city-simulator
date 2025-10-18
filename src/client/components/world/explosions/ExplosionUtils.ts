import { TweenService, Workspace } from "@rbxts/services";
import { palette } from "shared/constants/palette";

interface Edge {
	start: Vector3;
	end: Vector3;
}

interface Face {
	points: Vector3[];
	normal: Vector3;
	direction: Vector3;
	surface: string;
}

interface Geometry {
	vertices: Vector3[];
	edges: Edge[];
	faces: Face[];
}

const EXPLOSION_DURATION = 2;

export function convertPartToGeometry(part: BasePart): Geometry {
	const cf = part.CFrame;
	const pos = cf.Position;

	const sx = part.Size.X / 2;
	const sy = part.Size.Y / 2;
	const sz = part.Size.Z / 2;

	const xvec = cf.RightVector;
	const yvec = cf.UpVector;
	const zvec = cf.LookVector.mul(-1);

	const verts: Vector3[] = [];
	const edges: Edge[] = [];
	const faces: Face[] = [];

	const top1 = pos.add(xvec.mul(sx)).add(yvec.mul(sy)).add(zvec.mul(sz));
	const top2 = pos.add(xvec.mul(sx)).add(yvec.mul(sy)).add(zvec.mul(-sz));
	const top3 = pos.add(xvec.mul(-sx)).add(yvec.mul(sy)).add(zvec.mul(-sz));
	const top4 = pos.add(xvec.mul(-sx)).add(yvec.mul(sy)).add(zvec.mul(sz));
	//
	const bottom5 = pos.add(xvec.mul(sx)).add(yvec.mul(-sy)).add(zvec.mul(sz));
	const bottom6 = pos.add(xvec.mul(sx)).add(yvec.mul(-sy)).add(zvec.mul(-sz));
	const bottom7 = pos.add(xvec.mul(-sx)).add(yvec.mul(-sy)).add(zvec.mul(-sz));
	const bottom8 = pos.add(xvec.mul(-sx)).add(yvec.mul(-sy)).add(zvec.mul(sz));

	verts.push(top1, top2, top3, top4, bottom5, bottom6, bottom7, bottom8);

	// 6 faces
	/*

	{verts[1],  xvec, 'RightSurface',  zvec, {verts[5], verts[6], verts[2], verts[1]}}, --right
	{verts[3], -xvec, 'LeftSurface',   zvec, {verts[3], verts[4], verts[8], verts[7]}}, --left
	{verts[1],  yvec, 'TopSurface',    xvec, {verts[1], verts[2], verts[4], verts[3]}}, --top
	{verts[5], -yvec, 'BottomSurface', xvec, {verts[7], verts[8], verts[6], verts[5]}}, --bottom
	{verts[1],  zvec, 'BackSurface',   xvec, {verts[1], verts[3], verts[7], verts[5]}}, --back
	{verts[2], -zvec, 'FrontSurface',  xvec, {verts[6], verts[8], verts[4], verts[2]}}, --front

			*/
	faces.push(
		{
			points: [top1, top2, bottom6, bottom5],
			normal: xvec.mul(-1), // Flipped normal
			direction: yvec, // Up direction for vertical faces
			surface: "RightSurface",
		}, // right
		{
			points: [top4, top3, bottom7, bottom8],
			normal: xvec, // Flipped normal
			direction: yvec, // Up direction for vertical faces
			surface: "LeftSurface",
		}, // left
		{
			points: [top1, top2, top3, top4],
			normal: yvec.mul(-1), // Flipped normal
			direction: zvec, // Forward direction for horizontal faces
			surface: "TopSurface",
		}, // top
		{
			points: [bottom5, bottom6, bottom7, bottom8],
			normal: yvec, // Flipped normal
			direction: zvec, // Forward direction for horizontal faces
			surface: "BottomSurface",
		}, // bottom
		{
			points: [top2, top3, bottom7, bottom6],
			normal: zvec, // Flipped normal
			direction: yvec, // Up direction for vertical faces
			surface: "BackSurface",
		}, // back
		{
			points: [top1, top4, bottom8, bottom5],
			normal: zvec.mul(-1), // Flipped normal
			direction: yvec, // Up direction for vertical faces
			surface: "FrontSurface",
		}, // front
	);

	return {
		vertices: verts,
		edges,
		faces,
	};
}

export function getPart2DFootprint(part: BasePart): Vector2[] {
	const geometry = convertPartToGeometry(part);

	// Find the bottom face (Y-normal pointing up)
	const bottomFace = geometry.faces.find((face) => face.surface === "BottomSurface");
	if (!bottomFace) {
		warn("Could not find bottom face for part footprint");
		return [];
	}

	// Convert 3D points to 2D (X, Z coordinates)
	return bottomFace.points.map((point) => new Vector2(point.X, point.Z));
}

export function createCylinderBasePart(
	name: string,
	size: Vector3,
	position: Vector3,
	rotation: Vector3,
	color: Color3,
	transparency: number,
): Part {
	const part = new Instance("Part");
	part.Name = name;
	part.Size = size;
	part.Position = position;
	part.Rotation = rotation;
	part.Color = color;
	part.Material = Enum.Material.Neon;
	part.Transparency = transparency;
	part.Anchored = true;
	part.CanCollide = false;
	part.CastShadow = false;
	part.Parent = Workspace;

	part.Shape = Enum.PartType.Cylinder;
	return part;
}

export function createPointLight(color: Color3, brightness: number, range: number, parent: Part): PointLight {
	const pointLight = new Instance("PointLight");
	pointLight.Color = color;
	pointLight.Brightness = brightness;
	pointLight.Range = range;
	pointLight.Parent = parent;
	return pointLight;
}

export function createAnimatedParticle(
	name: string,
	size: Vector3,
	position: Vector3,
	color: Color3,
	transparency: number,
	endPosition: Vector3,
	duration: number,
): Part {
	const particle = new Instance("Part");
	particle.Name = name;
	particle.Size = size;
	particle.Position = position;
	particle.Color = color;
	particle.Material = Enum.Material.Neon;
	particle.Transparency = transparency;
	particle.Anchored = true;
	particle.CanCollide = false;
	particle.CastShadow = false;
	particle.Parent = Workspace;

	// Animate particle
	const tween = TweenService.Create(
		particle,
		new TweenInfo(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{ Position: endPosition, Transparency: 1 },
	);
	tween.Play();

	return particle;
}

export function createCarpetBombExplosion(center: Vector2, length: number, width: number, angle: number): Part[] {
	const effects: Part[] = [];

	print(`[DEBUG] createCarpetBombExplosion: center=${center}, length=${length}, width=${width}, angle=${angle}`);

	// Create main explosion part using CFrame for proper orientation
	const cframe = new CFrame(center.X, 0.5, center.Y).mul(CFrame.Angles(0, angle, 0));
	const explosion = new Instance("Part");
	explosion.Name = "CarpetBombExplosion";
	explosion.Size = new Vector3(length, 1, width);
	explosion.CFrame = cframe;
	explosion.Color = palette.red;
	explosion.Material = Enum.Material.Neon;
	explosion.Transparency = 0.1;
	explosion.Anchored = true;
	explosion.CanCollide = false;
	explosion.CastShadow = false;
	explosion.Parent = Workspace;

	print(
		`[DEBUG] Created explosion part: ${explosion.Name} at ${explosion.Position} with size ${explosion.Size} and CFrame ${explosion.CFrame}`,
	);

	// Add glow effect
	createPointLight(palette.red, 3, math.max(length, width), explosion);
	effects.push(explosion);

	// Create shockwave particles along the rectangle edges
	const halfLength = length / 2;
	const halfWidth = width / 2;
	const cos = math.cos(angle);
	const sin = math.sin(angle);

	// Create particles along the long edges (forward direction)
	for (let i = 0; i < 12; i++) {
		const t = (i / 11) * 2 - 1; // -1 to 1
		const localX = t * halfLength;
		const localZ = halfWidth;

		// Rotate and translate
		const worldX = center.X + localX * cos - localZ * sin;
		const worldZ = center.Y + localX * sin + localZ * cos;

		// Animate particle outward
		const outwardDirection = new Vector3(cos, 0, sin).mul(math.sign(t));
		const endPosition = new Vector3(worldX, 0.1, worldZ).add(outwardDirection.mul(10));

		const particle = createAnimatedParticle(
			"ShockwaveParticle",
			new Vector3(1, 0.2, 1),
			new Vector3(worldX, 0.1, worldZ),
			palette.peach,
			0.3,
			endPosition,
			EXPLOSION_DURATION,
		);

		effects.push(particle);
	}

	// Create particles along the short edges (side direction)
	for (let i = 0; i < 6; i++) {
		const t = (i / 5) * 2 - 1; // -1 to 1
		const localX = halfLength;
		const localZ = t * halfWidth;

		// Rotate and translate
		const worldX = center.X + localX * cos - localZ * sin;
		const worldZ = center.Y + localX * sin + localZ * cos;

		// Animate particle outward
		const outwardDirection = new Vector3(-sin, 0, cos).mul(math.sign(t));
		const endPosition = new Vector3(worldX, 0.1, worldZ).add(outwardDirection.mul(5));

		const particle = createAnimatedParticle(
			"ShockwaveParticle",
			new Vector3(1, 0.2, 1),
			new Vector3(worldX, 0.1, worldZ),
			palette.peach,
			0.3,
			endPosition,
			EXPLOSION_DURATION,
		);

		effects.push(particle);
	}

	return effects;
}

const VISUAL_HEIGHT = 5;

function createRectangleBasePart(name: string, size: Vector3, cframe: CFrame): Part {
	const explosion = new Instance("Part");
	explosion.Name = name;
	explosion.Size = size;
	explosion.CFrame = cframe;
	explosion.Color = palette.red;
	explosion.Material = Enum.Material.Neon;
	explosion.Transparency = 0.1;
	explosion.Anchored = true;
	explosion.CanCollide = false;
	explosion.CastShadow = false;
	explosion.Parent = Workspace;

	return explosion;
}

export function createCarpetBombExplosionWithCFrame(center: Vector2, size: Vector3, cframe: CFrame): Part[] {
	const effects: Part[] = [];

	print(`[DEBUG] createCarpetBombExplosionWithCFrame: center=${center}, size=${size}, cframe=${cframe}`);

	// Create main explosion part using the provided CFrame
	// Map width to X (RightVector), length to Z (LookVector) to align with forward axis
	const explosion = createRectangleBasePart("CarpetBombExplosion", size, cframe);

	print(
		`[DEBUG] Created explosion part: ${explosion.Name} at ${explosion.Position} with size ${explosion.Size} and CFrame ${explosion.CFrame}`,
	);

	effects.push(explosion);

	return effects;
}

export function createNuclearExplosion(center: Vector2, size: Vector3): Part[] {
	const effects: Part[] = [];

	const center3 = new Vector3(center.X, 0.1, center.Y);
	// Cylinder shape: local X = thickness (axis), local Y/Z = diameters. We rotate 90deg Z to align axis up.
	const maxDiameter = math.max(size.Y, size.Z);
	const ringThickness = math.max(0.2, size.X * 0.6);

	// Core flash (persistent root for audio/fade)
	const coreInitialSize = new Vector3(size.X, math.max(2, size.Y * 0.25), math.max(2, size.Z * 0.25));
	const core = createCylinderBasePart(
		"NuclearCore",
		coreInitialSize,
		center3,
		new Vector3(0, 0, 90),
		palette.yellow,
		0,
	);
	const coreLightRange = math.max(30, maxDiameter * 1.3);
	const coreLight = createPointLight(palette.white, 20, coreLightRange, core);
	const coreLightTween = TweenService.Create(
		coreLight,
		new TweenInfo(0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{ Brightness: 0 },
	);
	coreLightTween.Play();

	const coreTween = TweenService.Create(core, new TweenInfo(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Size: new Vector3(size.X, size.Y, size.Z),
		Transparency: 0.6,
	});
	coreTween.Play();
	effects.push(core);

	// Shockwave ring 1 (fast, bright)
	const ring1Initial = new Vector3(ringThickness, math.max(2, size.Y * 0.15), math.max(2, size.Z * 0.15));
	const ring1 = createCylinderBasePart(
		"NuclearShockwave1",
		ring1Initial,
		new Vector3(center.X, 0.12, center.Y),
		new Vector3(0, 0, 90),
		palette.white,
		0.05,
	);
	const ring1Tween = TweenService.Create(
		ring1,
		new TweenInfo(EXPLOSION_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{
			Size: new Vector3(ringThickness, size.Y, size.Z),
			Transparency: 1,
		},
	);
	ring1Tween.Play();
	effects.push(ring1);

	// Shockwave ring 2 (slightly delayed, warmer)
	const ring2Initial = new Vector3(ringThickness * 0.8, math.max(2, size.Y * 0.1), math.max(2, size.Z * 0.1));
	const ring2 = createCylinderBasePart(
		"NuclearShockwave2",
		ring2Initial,
		new Vector3(center.X, 0.14, center.Y),
		new Vector3(0, 0, 90),
		palette.peach,
		0.1,
	);
	const ring2Tween = TweenService.Create(
		ring2,
		new TweenInfo(EXPLOSION_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0.08),
		{
			Size: new Vector3(ringThickness * 0.8, size.Y * 1.2, size.Z * 1.2),
			Transparency: 1,
		},
	);
	ring2Tween.Play();
	effects.push(ring2);

	// Outward streaks
	const numStreaks = 28;
	const streakDistance = maxDiameter * 0.9;
	for (let i = 0; i < numStreaks; i++) {
		const t = i / numStreaks;
		const angle = t * math.pi * 2 + (math.random() - 0.5) * 0.1;
		const dir = new Vector3(math.cos(angle), 0, math.sin(angle));
		const startPos = new Vector3(center.X, 0.08, center.Y);
		const endPos = startPos.add(dir.mul(streakDistance));
		const particle = createAnimatedParticle(
			"NuclearStreak",
			new Vector3(0.8, 0.2, 0.8),
			startPos,
			palette.yellow,
			0.2,
			endPos,
			EXPLOSION_DURATION,
		);
		effects.push(particle);
	}

	return effects;
}

export function cleanupEffects(effects: Part[], duration: number) {
	task.delay(duration, () => {
		effects.forEach((effect) => {
			if (effect && effect.IsDescendantOf(game)) {
				effect.Destroy();
			}
		});
	});
}
