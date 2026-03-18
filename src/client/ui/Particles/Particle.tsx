import React, { useBinding, useEffect, useState } from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { Image } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";

import { ParticleEmitter2DConfig } from "./Particles.interfaces";
import { evaluateColorSequence, evaluateNumberRange, evaluateNumberSequence } from "./Particles.utils";

export interface Props {
	config: ParticleEmitter2DConfig;
	initialPosition: Vector2;
}

new Instance("ParticleEmitter") as ParticleEmitter;

export function Particle({ config, initialPosition }: Props) {
	const rem = useRem();
	const [position, setPosition] = useBinding(new UDim2(0, initialPosition.X, 0, initialPosition.Y));
	const ar = config.aspectRatio ?? 1;
	const [size, setSize] = useBinding(
		new UDim2(0, evaluateNumberSequence(config.size, 0) * ar, 0, evaluateNumberSequence(config.size, 0)),
	);
	const [rotation, setRotation] = useBinding(0);
	const [transparency, setTransparency] = useBinding(evaluateNumberSequence(config.transparency, 0));
	const [color, setColor] = useBinding(config.color.Keypoints[0].Value);
	const [isFinished, setIsFinished] = useState(false);

	//const [initialMoveDirection, setInitialMoveDirection] = useState(new Vector2(0, -1));

	useEffect(() => {
		const startTime = tick();
		const initialSpeed = evaluateNumberRange(config.speed);
		const initialRotation = evaluateNumberRange(config.rotation);
		const rotationSpeed = evaluateNumberRange(config.rotSpeed);

		// Calculate initial movement direction
		const spreadAngle = evaluateNumberRange(config.spreadAngle);
		const angleInRadians = math.rad(spreadAngle);
		const moveDirection = new Vector2(math.sin(angleInRadians), -math.cos(angleInRadians)).Unit;

		//setInitialMoveDirection(moveDirection);
		const acceleration = evaluateNumberRange(config.acceleration);

		// Track position and velocities separately
		let currentPosition = initialPosition; // Start from initial position
		let currentSpeed = initialSpeed;
		let gravityVelocity = 0; // Track vertical velocity for gravity

		const connection = RunService.Heartbeat.Connect((deltaTime) => {
			const elapsed = tick() - startTime;
			const alpha = math.min(elapsed / config.lifetime.Max, 1);

			// Apply drag force if defined
			if (config.dragForce !== undefined) {
				currentSpeed *= math.exp(-config.dragForce * deltaTime);
				gravityVelocity *= math.exp(-config.dragForce * deltaTime);
			}

			// Update speed with acceleration
			if (acceleration !== 0) {
				currentSpeed += acceleration * deltaTime;
			}

			// Calculate position change in the move direction
			const offset = moveDirection.mul(currentSpeed * deltaTime);
			currentPosition = currentPosition.add(offset);

			// Apply gravity if defined
			if (config.gravityStrength !== undefined) {
				// Update gravity velocity
				gravityVelocity += config.gravityStrength * deltaTime;
				// Apply gravity velocity to position
				currentPosition = currentPosition.add(new Vector2(0, gravityVelocity * deltaTime));
			}

			// Update UI position (changed to use absolute pixels)
			setPosition(new UDim2(0, currentPosition.X, 0, currentPosition.Y));

			// Update rotation of the image
			const currentRotation = initialRotation + rotationSpeed * elapsed;
			setRotation(currentRotation);

			// Update size
			const currentSize = evaluateNumberSequence(config.size, alpha);
			setSize(new UDim2(0, rem(currentSize * ar, "pixel"), 0, rem(currentSize, "pixel")));

			// Update transparency
			setTransparency(evaluateNumberSequence(config.transparency, alpha));

			setColor(evaluateColorSequence(config.color, alpha));

			if (alpha === 1) {
				connection.Disconnect();
				setIsFinished(true);
			}
		});

		// Play sound if provided
		if (config.sound) {
			const sound = new Instance("Sound");
			sound.SoundId = config.sound;
			sound.Parent = game.GetService("SoundService");
			sound.Play();
		}

		return () => connection.Disconnect();
	}, [config, initialPosition]);

	if (isFinished) {
		return undefined;
	}

	// Calculate the angle for the initial move direction
	//const directionAngle = math.deg(math.atan2(initialMoveDirection.Y, initialMoveDirection.X));

	return (
		<>
			<Image
				image={config.texture}
				position={position}
				size={size}
				backgroundTransparency={1}
				imageTransparency={transparency}
				imageColor3={color}
				anchorPoint={new Vector2(0.5, 0.5)}
				rotation={rotation}
				zIndex={config.zOffset}
			/>
			{/* Draw the initial move direction */}
			{/* <frame
				Size={new UDim2(0, 100, 0, 2)} // Length and thickness of the line
				Position={new UDim2(0.5, 0, 0.5, 0)} // Start at the center
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundColor3={new Color3(1, 0, 0)} // Red color for visibility
				Rotation={directionAngle}
				BackgroundTransparency={0.5}
			/> */}
		</>
	);
}
