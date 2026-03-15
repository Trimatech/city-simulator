import { usePrevious } from "@rbxts/pretty-react-hooks";
import React, { memo, MutableRefObject, useEffect, useRef, useState } from "@rbxts/react";
import { Players, Workspace } from "@rbxts/services";
import { Frame } from "@rbxts-ui/primitives";
import { fillArray } from "shared/utils/object-utils";

import { FlyTo } from "./FlyTo";

const getRandomStartPosition = (flyToRef: MutableRefObject<Frame | ImageLabel | undefined>) => {
	const screenSize = Workspace.CurrentCamera?.ViewportSize ?? new Vector2(800, 600);
	const framePos = flyToRef.current?.AbsolutePosition ?? new Vector2();
	return new UDim2(
		0,
		math.round(math.random() * screenSize.X) - framePos.X,
		0,
		math.round(math.random() * screenSize.Y) - framePos.Y,
	);
};

const getCharacterStartPosition = (flyToRef: MutableRefObject<Frame | ImageLabel | undefined>) => {
	const camera = Workspace.CurrentCamera;
	const head = Players.LocalPlayer?.Character?.FindFirstChild("Head") as BasePart | undefined;
	if (camera && head) {
		const [screenPos, onScreen] = camera.WorldToScreenPoint(head.Position);
		if (onScreen) {
			const framePos = flyToRef.current?.AbsolutePosition ?? new Vector2();
			return new UDim2(0, screenPos.X - framePos.X, 0, screenPos.Y - framePos.Y);
		}
	}
	return getRandomStartPosition(flyToRef);
};

interface FlyToComponentsProps {
	readonly amount: number;
	readonly statsImageRef: MutableRefObject<Frame | ImageLabel | undefined>;
	readonly image: string;
	readonly sound?: string;
	readonly startFromCharacter?: boolean;
	readonly imageTransparency?: number;
	readonly startScale?: number;
}

const ROUND_AMOUNT = 10;

const MAX_ITEMS = 50;

interface FlyToBatch {
	readonly batchKey: number;
	readonly instances: Array<{ id: string; from: UDim2; curveHeight: number }>;
}

const FlyToComponentsTemp = ({
	amount,
	statsImageRef: goldCardRef,
	image,
	sound,
	startFromCharacter,
	imageTransparency,
	startScale,
}: FlyToComponentsProps) => {
	const lastAmount = usePrevious(amount);
	const flyToRef = useRef<Frame>();
	const batchCounter = useRef(0);
	const [batches, setBatches] = useState<Array<FlyToBatch>>([]);

	const getStartPosition = startFromCharacter ? getCharacterStartPosition : getRandomStartPosition;

	useEffect(() => {
		// Skip first render to avoid spawning for already-existing values
		if (lastAmount === undefined || amount - lastAmount <= 0) return;

		const diff = amount - lastAmount;
		const newAmountChange = math.min(MAX_ITEMS, math.ceil(diff / ROUND_AMOUNT));

		const instances = fillArray(newAmountChange, (index) => ({
			id: `${index}`,
			from: getStartPosition(flyToRef),
			curveHeight: math.random(2, 200),
		}));

		batchCounter.current += 1;
		const batchKey = batchCounter.current;

		setBatches((prev) => [...prev, { batchKey, instances }]);

		const delayDuration = 2;
		const delay = math.min(0.1, delayDuration / instances.size());
		const duration = 0.5;
		const totalLifetime = instances.size() * delay + duration + 0.5;

		task.delay(totalLifetime, () => {
			setBatches((prev) => prev.filter((b) => b.batchKey !== batchKey));
		});
	}, [amount]);

	const duration = 0.5;
	const delayDuration = 2;

	const flatElements: React.Element[] = [];
	for (const batch of batches) {
		const batchDelay = math.min(0.1, delayDuration / batch.instances.size());
		for (const [index, { id, from, curveHeight }] of ipairs(batch.instances)) {
			flatElements.push(
				<FlyTo
					key={`flyto-${batch.batchKey}-${id}`}
					delay={(index - 1) * batchDelay}
					image={image}
					from={from}
					flyToRef={flyToRef}
					toRef={goldCardRef}
					duration={duration}
					curveHeight={curveHeight}
					sound={sound}
					imageTransparency={imageTransparency}
					startScale={startScale}
				/>,
			);
		}
	}

	return (
		<Frame size={new UDim2(1, 0, 1, 0)} ref={flyToRef} backgroundTransparency={1}>
			{flatElements}
		</Frame>
	);
};

export const FlyToComponents = memo(FlyToComponentsTemp, (prevProps, nextProps) => {
	return prevProps.amount === nextProps.amount;
});
