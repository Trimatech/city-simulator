import React, { useBinding, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Workspace } from "@rbxts/services";
import { setInterval } from "@rbxts/set-timeout";
import { SpikeLine } from "client/ui/SpikeLine";
import { selectLocalTurboActiveUntil } from "shared/store/soldiers";

const GROUP_COUNT = 4;
const SPIKES_PER_GROUP = 16;
const FRAME_INTERVAL = 0.085;
const MIN_FRAME_SIZE_PX = 1;

interface SpikeData {
	readonly angleDeg: number;
	readonly lengthFactor: number;
	readonly thicknessFactor: number;
}

const LENGTH_POOL = [0.22, 0.32, 0.18, 0.28, 0.25, 0.35, 0.2, 0.3];
const THICKNESS_POOL = [0.012, 0.035, 0.01, 0.03, 0.014, 0.04, 0.011, 0.032];

function generateGroup(groupIndex: number): SpikeData[] {
	const angleStep = 360 / SPIKES_PER_GROUP;
	const spikes: SpikeData[] = [];

	for (let i = 0; i < SPIKES_PER_GROUP; i++) {
		const pool = (i + groupIndex * 3) % LENGTH_POOL.size();
		const jitter = groupIndex * 7 + i * 1.3;
		spikes.push({
			angleDeg: i * angleStep + (i % 2 === 0 ? 0 : angleStep * 0.35) + math.sin(jitter) * 4,
			lengthFactor: LENGTH_POOL[pool] * (0.85 + math.sin(jitter * 0.7) * 0.3),
			thicknessFactor: THICKNESS_POOL[pool],
		});
	}

	return spikes;
}

const GROUPS = new Array<SpikeData[]>();
for (let g = 0; g < GROUP_COUNT; g++) {
	GROUPS.push(generateGroup(g));
}

interface SpikeRender {
	readonly edgeX: number;
	readonly edgeY: number;
	readonly tipX: number;
	readonly tipY: number;
	readonly thickness: number;
}

function computeGroupPositions(spikes: SpikeData[], width: number, height: number): SpikeRender[] {
	const centerX = width / 2;
	const centerY = height / 2;
	const minDim = math.min(width, height);

	return spikes.map((spike) => {
		const rad = math.rad(spike.angleDeg);
		const dirX = math.sin(rad);
		const dirY = -math.cos(rad);

		const tx = dirX !== 0 ? centerX / math.abs(dirX) : math.huge;
		const ty = dirY !== 0 ? centerY / math.abs(dirY) : math.huge;
		const edgeDist = math.min(tx, ty);

		const overshoot = 20;
		const edgeX = centerX + (edgeDist + overshoot) * dirX;
		const edgeY = centerY + (edgeDist + overshoot) * dirY;

		const spikeLength = math.max(minDim * spike.lengthFactor, 24);
		const thickness = math.max(minDim * spike.thicknessFactor, 5);

		return {
			edgeX,
			edgeY,
			tipX: edgeX - dirX * spikeLength,
			tipY: edgeY - dirY * spikeLength,
			thickness,
		};
	});
}

interface Props {
	readonly paused?: boolean;
}

export function SpeedEffect({ paused = false }: Props) {
	const frameRef = useRef<Frame>();
	const turboActiveUntil = useSelector(selectLocalTurboActiveUntil);
	const [currentTime, setCurrentTime] = useBinding(Workspace.GetServerTimeNow());
	const [frameSize, setFrameSize] = useState(new Vector2(0, 0));

	const groupTransparencies: [React.Binding<number>, (val: number) => void][] = [];
	for (let i = 0; i < GROUP_COUNT; i++) {
		// GROUP_COUNT is a constant so hook count is stable
		groupTransparencies.push(useBinding(i === 0 ? 0 : 1));
	}

	const activeGroupRef = useRef(0);

	// Track frame size via AbsoluteSize
	useEffect(() => {
		let connection: RBXScriptConnection | undefined;

		const updateFrameSize = () => {
			const rbx = frameRef.current;
			if (!rbx) return;
			const absoluteSize = rbx.AbsoluteSize;
			setFrameSize(new Vector2(absoluteSize.X, absoluteSize.Y));
			if (connection === undefined) {
				connection = rbx.GetPropertyChangedSignal("AbsoluteSize").Connect(updateFrameSize);
			}
		};

		const deferredId = task.defer(updateFrameSize);

		return () => {
			task.cancel(deferredId);
			connection?.Disconnect();
		};
	}, []);

	// Reset time when turbo changes
	useEffect(() => {
		setCurrentTime(Workspace.GetServerTimeNow());
	}, [turboActiveUntil]);

	// Flipbook animation: cycle active group
	useEffect(() => {
		const now = Workspace.GetServerTimeNow();
		setCurrentTime(now);

		if (turboActiveUntil <= now) {
			return;
		}

		const clearInterval = setInterval(() => {
			const latestTime = Workspace.GetServerTimeNow();
			setCurrentTime(latestTime);

			if (latestTime >= turboActiveUntil || paused) {
				return;
			}

			const prev = activeGroupRef.current;
			const nexta = (prev + 1) % GROUP_COUNT;
			activeGroupRef.current = nexta;

			for (let i = 0; i < GROUP_COUNT; i++) {
				groupTransparencies[i][1](i === nexta ? 0 : 1);
			}
		}, FRAME_INTERVAL);

		return clearInterval;
	}, [paused, turboActiveUntil]);

	// Pre-compute all spike positions per group (only changes on resize)
	const groupPositions = useMemo(() => {
		if (frameSize.X < MIN_FRAME_SIZE_PX || frameSize.Y < MIN_FRAME_SIZE_PX) {
			return undefined;
		}
		return GROUPS.map((spikes) => computeGroupPositions(spikes, frameSize.X, frameSize.Y));
	}, [frameSize]);

	const isActive = currentTime.map((t) => turboActiveUntil > t);

	return (
		<frame
			ref={frameRef}
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
			Active={false}
			Visible={isActive}
			ZIndex={5}
			ClipsDescendants={false}
		>
			{groupPositions !== undefined &&
				groupPositions.map((positions, groupIdx) => (
					<canvasgroup
						key={`group-${groupIdx}`}
						Size={new UDim2(1, 0, 1, 0)}
						BackgroundTransparency={1}
						GroupTransparency={groupTransparencies[groupIdx][0]}
						ZIndex={5}
					>
						{positions.map((spike, spikeIdx) => (
							<SpikeLine
								key={`spike-${spikeIdx}`}
								startX={spike.edgeX}
								startY={spike.edgeY}
								endX={spike.tipX}
								endY={spike.tipY}
								thickness={spike.thickness}
								transparency={0.45}
								zIndex={5}
							/>
						))}
					</canvasgroup>
				))}
		</frame>
	);
}
