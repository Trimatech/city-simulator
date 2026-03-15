import assets from "shared/assets";

import { ParticleEmitter2DConfig } from "./Particles.interfaces";

const texture = assets.ui.crystals.crystals_1;

export const downwardsConfig: ParticleEmitter2DConfig = {
	rate: 2,
	lifetime: new NumberRange(1),
	speed: new NumberRange(100, 100),
	size: new NumberSequence(50, 100),
	texture,
	acceleration: new NumberRange(100),
	spreadAngle: new NumberRange(180, 180),
	rotation: new NumberRange(0, 0),
	rotSpeed: new NumberRange(0, 0),
	transparency: new NumberSequence(0, 0),
	color: new ColorSequence(new Color3(1, 1, 1)),
	zOffset: 0,
	sound: undefined,
};

export const spreadConfig: ParticleEmitter2DConfig = {
	rate: 10,
	lifetime: new NumberRange(0.5, 5),
	speed: new NumberRange(50, 100),
	size: new NumberSequence([
		new NumberSequenceKeypoint(0, 10),
		new NumberSequenceKeypoint(0.5, 30),
		new NumberSequenceKeypoint(1, 10),
	]),
	texture,
	acceleration: new NumberRange(100),
	spreadAngle: new NumberRange(-180, 180),
	rotation: new NumberRange(0, 360),
	rotSpeed: new NumberRange(-180, 180),
	transparency: new NumberSequence([
		new NumberSequenceKeypoint(0, 0.2),
		new NumberSequenceKeypoint(0.5, 0),
		new NumberSequenceKeypoint(1, 0.2),
	]),
	color: new ColorSequence([
		new ColorSequenceKeypoint(0, new Color3(1, 1, 0.8)),
		new ColorSequenceKeypoint(0.5, new Color3(1, 1, 1)),
		new ColorSequenceKeypoint(1, new Color3(1, 1, 0.8)),
	]),
	zOffset: 0,
	sound: undefined,
};

export const rainfallConfig: ParticleEmitter2DConfig = {
	rate: 50,
	lifetime: new NumberRange(1, 2),
	speed: new NumberRange(200, 300),
	size: new NumberSequence(5, 10),
	texture,
	acceleration: new NumberRange(500),
	spreadAngle: new NumberRange(175, 185),
	rotation: new NumberRange(0, 0),
	rotSpeed: new NumberRange(0, 0),
	transparency: new NumberSequence(0.1, 0.4),
	color: new ColorSequence(new Color3(0.5, 0.5, 1)),
	zOffset: 0,
	sound: undefined,
};

export const fireworksConfig: ParticleEmitter2DConfig = {
	rate: 100,
	lifetime: new NumberRange(2, 3),
	speed: new NumberRange(400, 500),
	size: new NumberSequence(10, 20),
	texture,
	acceleration: new NumberRange(-150),
	spreadAngle: new NumberRange(-180, 180),
	rotation: new NumberRange(0, 360),
	rotSpeed: new NumberRange(-90, 90),
	transparency: new NumberSequence(0, 1),
	color: new ColorSequence([
		new ColorSequenceKeypoint(0, new Color3(1, 0, 0)),
		new ColorSequenceKeypoint(0.5, new Color3(1, 1, 0)),
		new ColorSequenceKeypoint(1, new Color3(0, 1, 0)),
	]),
	zOffset: 0,
	sound: undefined,
};

export const snowfallConfig: ParticleEmitter2DConfig = {
	rate: 10,
	lifetime: new NumberRange(0.5, 5),
	speed: new NumberRange(100),
	size: new NumberSequence([
		new NumberSequenceKeypoint(0, 10),
		new NumberSequenceKeypoint(0.5, 30),
		new NumberSequenceKeypoint(1, 10),
	]),
	texture,
	acceleration: new NumberRange(0),
	spreadAngle: new NumberRange(170, 190),
	rotation: new NumberRange(0, 360),
	rotSpeed: new NumberRange(-180, 180),
	transparency: new NumberSequence([
		new NumberSequenceKeypoint(0, 0.2),
		new NumberSequenceKeypoint(0.5, 0),
		new NumberSequenceKeypoint(1, 0.2),
	]),
	color: new ColorSequence([
		new ColorSequenceKeypoint(0, new Color3(1, 1, 0.8)),
		new ColorSequenceKeypoint(0.5, new Color3(1, 1, 1)),
		new ColorSequenceKeypoint(1, new Color3(1, 1, 0.8)),
	]),
	zOffset: 0,
	sound: undefined,
};

export const smokePuffConfig: ParticleEmitter2DConfig = {
	rate: 15,
	lifetime: new NumberRange(3, 5),
	speed: new NumberRange(10, 30),
	size: new NumberSequence(20, 50),
	texture,
	acceleration: new NumberRange(-20),
	spreadAngle: new NumberRange(-45, 45),
	rotation: new NumberRange(0, 360),
	rotSpeed: new NumberRange(-20, 20),
	transparency: new NumberSequence(0.5, 1),
	color: new ColorSequence(new Color3(0.5, 0.5, 0.5)),
	zOffset: 0,
	sound: undefined,
};

export const bubbleRiseConfig: ParticleEmitter2DConfig = {
	rate: 25,
	lifetime: new NumberRange(2, 4),
	speed: new NumberRange(50, 100),
	size: new NumberSequence(10, 20),
	texture,
	acceleration: new NumberRange(-50),
	spreadAngle: new NumberRange(-5, 5),
	rotation: new NumberRange(0, 0),
	rotSpeed: new NumberRange(0, 0),
	transparency: new NumberSequence(0.2, 0.8),
	color: new ColorSequence(new Color3(0.8, 0.8, 1)),
	zOffset: 0,
	sound: undefined,
};

export const leafFallConfig: ParticleEmitter2DConfig = {
	rate: 10,
	lifetime: new NumberRange(10, 15),
	spreadAngle: new NumberRange(125, 225),
	speed: new NumberRange(50, 75),
	acceleration: new NumberRange(10, 100),
	size: new NumberSequence(10, 15),
	color: new ColorSequence([
		new ColorSequenceKeypoint(0, new Color3(1, 0.9, 0)),
		new ColorSequenceKeypoint(1, new Color3(0.96, 0.54, 0.02)),
	]),
	transparency: new NumberSequence(0),
	rotation: new NumberRange(0, 360),
	rotSpeed: new NumberRange(-30, 30),
	texture,
	zOffset: 1,
	sound: undefined,
	gravityStrength: 10,
	dragForce: 0.8,
};

export const sparklerConfig: ParticleEmitter2DConfig = {
	rate: 100,
	lifetime: new NumberRange(0.5, 1),
	speed: new NumberRange(100, 200),
	size: new NumberSequence(5, 10),
	texture,
	acceleration: new NumberRange(0, 0),
	spreadAngle: new NumberRange(-180, 180),
	rotation: new NumberRange(0, 360),
	rotSpeed: new NumberRange(-180, 180),
	transparency: new NumberSequence(0, 1),
	color: new ColorSequence(new Color3(1, 1, 0)),
	zOffset: 0,
	sound: undefined,
};

export const waterFountainConfig: ParticleEmitter2DConfig = {
	rate: 100,
	lifetime: new NumberRange(1.5, 2.5),
	speed: new NumberRange(200, 300),
	size: new NumberSequence([
		new NumberSequenceKeypoint(0, 8),
		new NumberSequenceKeypoint(0.5, 12),
		new NumberSequenceKeypoint(1, 6),
	]),
	texture,
	acceleration: new NumberRange(-100),
	spreadAngle: new NumberRange(-25, 25),
	rotation: new NumberRange(0, 360),
	rotSpeed: new NumberRange(-90, 90),
	transparency: new NumberSequence([
		new NumberSequenceKeypoint(0, 0.2),
		new NumberSequenceKeypoint(0.7, 0.5),
		new NumberSequenceKeypoint(1, 1),
	]),
	color: new ColorSequence([
		new ColorSequenceKeypoint(0, new Color3(0.7, 0.8, 1)),
		new ColorSequenceKeypoint(1, new Color3(0.5, 0.6, 1)),
	]),
	zOffset: 0,
	gravityStrength: 100,
	sound: undefined,
};

export const dustStormConfig: ParticleEmitter2DConfig = {
	rate: 60,
	lifetime: new NumberRange(2, 4),
	speed: new NumberRange(50, 100),
	size: new NumberSequence(5, 15),
	texture,
	acceleration: new NumberRange(0, 0),
	spreadAngle: new NumberRange(-180, 180),
	rotation: new NumberRange(0, 360),
	rotSpeed: new NumberRange(-50, 50),
	transparency: new NumberSequence(0.5, 1),
	color: new ColorSequence(new Color3(0.8, 0.7, 0.5)),
	zOffset: 0,
	sound: undefined,
};

export const fireEmbersConfig: ParticleEmitter2DConfig = {
	rate: 30,
	lifetime: new NumberRange(1, 6),
	speed: new NumberRange(30, 60),
	size: new NumberSequence(5, 10),
	texture,
	acceleration: new NumberRange(50),
	spreadAngle: new NumberRange(-45, 45),
	rotation: new NumberRange(0, 360),
	rotSpeed: new NumberRange(-20, 20),
	transparency: new NumberSequence(0, 1),
	color: new ColorSequence(new Color3(1, 0.5, 0)),
	zOffset: 0,
	sound: undefined,
};

export const confettiConfig: ParticleEmitter2DConfig = {
	rate: 100,
	lifetime: new NumberRange(1, 4),
	speed: new NumberRange(300, 600),
	acceleration: new NumberRange(10, 10),
	spreadAngle: new NumberRange(-45, 45),
	size: new NumberSequence([
		new NumberSequenceKeypoint(0, 10),
		new NumberSequenceKeypoint(0.5, 20),
		new NumberSequenceKeypoint(1, 10),
	]),
	texture,
	rotation: new NumberRange(0, 360),
	rotSpeed: new NumberRange(-280, 280),
	transparency: new NumberSequence(0.3, 0.9),
	color: new ColorSequence([
		new ColorSequenceKeypoint(0, new Color3(0.99, 0, 0.45)),
		new ColorSequenceKeypoint(0.5, new Color3(0.41, 0.06, 0.86)),
		new ColorSequenceKeypoint(1, new Color3(0.25, 0, 1)),
	]),
	zOffset: 0,
	sound: undefined,
	gravityStrength: 900,
	dragForce: 0.6,
};
