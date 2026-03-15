export interface ParticleEmitter2DConfig {
	rate: number; // Particles per second
	lifetime: NumberRange; // Range for particle lifetime
	speed: NumberRange; // Range for particle speed
	size: NumberSequence; // Size over lifetime
	color: ColorSequence; // Color over lifetime
	transparency: NumberSequence; // Transparency over lifetime
	rotation: NumberRange; // Initial rotation range
	rotSpeed: NumberRange; // Rotation speed range
	spreadAngle: NumberRange; // Spread angle for emission
	texture: string; // Image texture for particles
	zOffset: number; // Z offset for rendering order
	sound?: string; // Optional sound to play on emission
	gravityStrength?: number; // New property to control gravity strength
	dragForce?: number; // New property to control drag force
	acceleration: NumberRange; // Acceleration applied to particles as a range
	emit?: number; // Initial amount of particles to generate
}
