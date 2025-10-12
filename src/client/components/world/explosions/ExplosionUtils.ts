import { TweenService, Workspace } from "@rbxts/services";
import { palette } from "shared/constants/palette";

const EXPLOSION_DURATION = 2;

export function createBasePart(
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

	// Create main explosion part
	const explosion = createBasePart(
		"CarpetBombExplosion",
		new Vector3(length, 0.2, width),
		new Vector3(center.X, 0.1, center.Y),
		new Vector3(0, math.deg(angle), 0),
		palette.red,
		0.2,
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

export function createNuclearExplosion(center: Vector2, radius: number): Part[] {
	const effects: Part[] = [];

	// Create main explosion part
	const explosion = createBasePart(
		"NuclearExplosion",
		new Vector3(0.2, radius * 2, radius * 2),
		new Vector3(center.X, 0.1, center.Y),
		new Vector3(0, 0, 90),
		palette.yellow,
		0.1,
	);

	// Add glow effect
	createPointLight(palette.yellow, 4, radius * 2, explosion);
	effects.push(explosion);

	// Create expanding ring effect
	const ring = createBasePart(
		"NuclearRing",
		new Vector3(radius * 2, 0.1, radius * 2),
		new Vector3(center.X, 0.15, center.Y),
		new Vector3(0, 0, 90),
		palette.white,
		0.05,
	);

	// Animate ring expansion
	const ringTween = TweenService.Create(
		ring,
		new TweenInfo(EXPLOSION_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{
			Size: new Vector3(radius * 3, 0.1, radius * 3),
			Transparency: 1,
		},
	);
	ringTween.Play();

	effects.push(ring);

	// Create particles around the circle edge
	for (let i = 0; i < 16; i++) {
		const angle = (i / 16) * 2 * math.pi;
		const x = center.X + radius * math.cos(angle);
		const z = center.Y + radius * math.sin(angle);

		// Animate particle outward
		const direction = new Vector3(math.cos(angle), 0, math.sin(angle));
		const endPosition = new Vector3(x, 0.1, z).add(direction.mul(radius * 0.5));

		const particle = createAnimatedParticle(
			"NuclearParticle",
			new Vector3(1, 0.2, 1),
			new Vector3(x, 0.1, z),
			palette.white,
			0.2,
			endPosition,
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
