import React, { memo, useEffect, useRef, useState } from "@rbxts/react";
import { HttpService } from "@rbxts/services";
import { setInterval } from "@rbxts/set-timeout";
import { Frame } from "@rbxts-ui/primitives";
import { fillArray } from "shared/utils/object-utils";

import { Particle } from "./Particle";
import { ParticleEmitter2DConfig } from "./Particles.interfaces";

interface Props {
	readonly config: ParticleEmitter2DConfig;
	readonly emitDuration?: number;
	readonly size?: UDim2;
}

const ParticlesTemp = ({ config, emitDuration, size }: Props) => {
	const frameRef = useRef<Frame>();
	const [particles, setParticles] = useState<{ id: string; birthTime: number; position: Vector2 }[]>([]);
	const startTimeRef = useRef(tick());
	const [frameSize, setFrameSize] = useState<Vector2>(new Vector2(0, 0));

	const { rate, lifetime, emit } = config;
	const delay = 1 / rate;

	// Add effect to track frame size
	useEffect(() => {
		if (frameRef.current) {
			const updateSize = () => {
				const absoluteSize = frameRef.current?.AbsoluteSize;
				if (absoluteSize) {
					setFrameSize(new Vector2(absoluteSize.X, absoluteSize.Y));
				}
			};

			updateSize();
			const connection = frameRef.current.GetPropertyChangedSignal("AbsoluteSize").Connect(updateSize);
			return () => connection.Disconnect();
		}
	}, []);

	// Modify initial particles creation
	useEffect(() => {
		if (emit && emit > 0) {
			const currentTime = tick();
			const initialParticles = fillArray(emit, () => ({
				id: `${HttpService.GenerateGUID(false)}`,
				birthTime: currentTime,
				position: new Vector2(math.random() * frameSize.X, math.random() * frameSize.Y),
			}));
			setParticles((prevParticles) => [...prevParticles, ...initialParticles]);
		}
	}, [emit, frameSize]);

	useEffect(() => {
		const clearInterval = setInterval(() => {
			const currentTime = tick();
			const timeSinceStart = currentTime - startTimeRef.current;
			const shouldEmit = !emitDuration || timeSinceStart < emitDuration;

			setParticles((prevParticles) => {
				const filteredParticles = prevParticles.filter(
					(particle) => currentTime - particle.birthTime < lifetime.Max,
				);

				if (shouldEmit) {
					return [
						...filteredParticles,
						{
							id: `${HttpService.GenerateGUID(false)}`,
							birthTime: currentTime,
							position: new Vector2(math.random() * frameSize.X, math.random() * frameSize.Y),
						},
					];
				}

				// If no particles left and past emitDuration, clear the interval
				if (filteredParticles.size() === 0 && !shouldEmit) {
					clearInterval();
				}

				return filteredParticles;
			});
		}, delay);

		return () => clearInterval();
	}, [rate, lifetime, emitDuration, frameSize]);

	return (
		<Frame size={size ?? new UDim2(0, 1, 0, 1)} ref={frameRef}>
			{particles.map(({ id, position }) => (
				<Particle key={`particle-${id}}`} config={config} initialPosition={position} />
			))}
		</Frame>
	);
};

export const Particles = memo(ParticlesTemp, (prevProps, nextProps) => {
	return prevProps.config === nextProps.config;
});
