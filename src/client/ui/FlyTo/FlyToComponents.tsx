import { usePrevious } from "@rbxts/pretty-react-hooks";
import React, { memo, MutableRefObject, useRef } from "@rbxts/react";
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
	const rootPart = Players.LocalPlayer?.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
	if (camera && rootPart) {
		const [screenPos, onScreen] = camera.WorldToViewportPoint(rootPart.Position);
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
}

const ROUND_AMOUNT = 10;

const MAX_ITEMS = 50;

const FlyToComponentsTemp = ({
	amount,
	statsImageRef: goldCardRef,
	image,
	sound,
	startFromCharacter,
	imageTransparency,
}: FlyToComponentsProps) => {
	const lastAmount = usePrevious(amount);

	const flyToRef = useRef<Frame>();

	// Skip first render to avoid spawning for already-existing values
	if (lastAmount === undefined || amount - lastAmount <= 0) {
		return <Frame size={new UDim2(1, 0, 1, 0)} ref={flyToRef} backgroundTransparency={1} />;
	}

	const diff = amount - lastAmount;

	const newAmountChange = math.min(MAX_ITEMS, math.ceil(diff / ROUND_AMOUNT));

	const getStartPosition = startFromCharacter ? getCharacterStartPosition : getRandomStartPosition;

	const flyToInstances = fillArray(newAmountChange, (index) => ({
		id: `${index}`,
		from: getStartPosition(flyToRef),
		curveHeight: math.random(2, 200),
	}));

	const duration = 0.5;
	const delayDuration = 2;
	const size = flyToInstances.size();
	const delay = math.min(0.1, delayDuration / size);

	return (
		<Frame size={new UDim2(1, 0, 1, 0)} ref={flyToRef} backgroundTransparency={1}>
			{flyToInstances.map(({ id, from, curveHeight }, index) => (
				<FlyTo
					key={`flyto-${id}-${math.random()}`}
					delay={index * delay}
					image={image}
					from={from}
					flyToRef={flyToRef}
					toRef={goldCardRef}
					duration={duration}
					curveHeight={curveHeight}
					sound={sound}
					imageTransparency={imageTransparency}
				/>
			))}
		</Frame>
	);
};

export const FlyToComponents = memo(FlyToComponentsTemp, (prevProps, nextProps) => {
	return prevProps.amount === nextProps.amount;
});
