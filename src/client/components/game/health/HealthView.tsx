import React, { useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { HStack } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { ROBLOX_TOOLBAR_HEIGHT, ROBLOX_TOOLBAR_WIDTH } from "client/constants/roblox.constants";
import { Particles } from "client/ui/Particles/Particles";
import { ParticleEmitter2DConfig } from "client/ui/Particles/Particles.interfaces";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { selectLocalHealth } from "shared/store/soldiers";

import { HealthBar } from "./HealthBar";

const BURST_LIFETIME_MAX = 2;
const BURST_EMIT_DURATION = 0.3;

function getHeartBurstConfig(iconSize: number): ParticleEmitter2DConfig {
	return {
		rate: 60,
		lifetime: new NumberRange(1, BURST_LIFETIME_MAX),
		speed: new NumberRange(0, 20),
		size: new NumberSequence([
			new NumberSequenceKeypoint(0, iconSize),
			new NumberSequenceKeypoint(0.4, iconSize * 0.6),
			new NumberSequenceKeypoint(1, iconSize * 0.2),
		]),
		texture: assets.ui.heart,
		acceleration: new NumberRange(0),
		spreadAngle: new NumberRange(-40, 40),
		rotation: new NumberRange(-15, 15),
		rotSpeed: new NumberRange(-30, 30),
		transparency: new NumberSequence([
			new NumberSequenceKeypoint(0, 0),
			new NumberSequenceKeypoint(0.5, 0.2),
			new NumberSequenceKeypoint(1, 1),
		]),
		color: new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromRGB(255, 50, 50)),
			new ColorSequenceKeypoint(1, Color3.fromRGB(180, 0, 0)),
		]),
		zOffset: 10,
		gravityStrength: 400,
	};
}

export function HealthView() {
	const rem = useRem();

	const iconSize = rem(3.5);

	const health = useSelector(selectLocalHealth) ?? 0;
	const prevHealthRef = useRef(health);
	const [bursts, setBursts] = useState<Array<{ key: number }>>([]);
	const burstCounter = useRef(0);

	const heartBurstConfig = useMemo(() => getHeartBurstConfig(iconSize), [iconSize]);

	useEffect(() => {
		const prevHealth = prevHealthRef.current;
		prevHealthRef.current = health;

		if (health < prevHealth && prevHealth > 0) {
			burstCounter.current += 1;
			const key = burstCounter.current;
			setBursts((prev) => [...prev, { key }]);
			task.delay(BURST_EMIT_DURATION + BURST_LIFETIME_MAX + 0.5, () =>
				setBursts((prev) => prev.filter((b) => b.key !== key)),
			);
		}
	}, [health]);

	return (
		<HStack
			name="HealthView"
			size={new UDim2(0, rem(35), 0, ROBLOX_TOOLBAR_HEIGHT)}
			position={new UDim2(0, ROBLOX_TOOLBAR_WIDTH, 0, 0)}
			spacing={rem(0.5)}
			padding={30}
		>
			<frame BackgroundTransparency={1} Size={new UDim2(0, iconSize, 0, iconSize)} ClipsDescendants={false}>
				<imagelabel
					Image={assets.ui.heart}
					BackgroundTransparency={1}
					Size={new UDim2(1, 0, 1, 0)}
					ScaleType={Enum.ScaleType.Fit}
					ZIndex={1}
				/>
				{bursts.map((burst) => (
					<Frame
						key={`heart-burst-${burst.key}`}
						position={new UDim2(0.5, 0, 0.5, 0)}
						anchorPoint={new Vector2(0.5, 0.5)}
						size={new UDim2(0, 1, 0, 1)}
						backgroundTransparency={1}
						zIndex={10}
					>
						<Particles
							config={heartBurstConfig}
							size={new UDim2(0, 1, 0, 1)}
							emitDuration={BURST_EMIT_DURATION}
						/>
					</Frame>
				))}
			</frame>
			<frame BackgroundTransparency={1} Size={new UDim2(1, -iconSize - rem(0.5), 0, rem(2))}>
				<HealthBar />
			</frame>
		</HStack>
	);
}
