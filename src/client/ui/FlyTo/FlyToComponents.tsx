import { usePrevious } from "@rbxts/pretty-react-hooks";
import React, { memo, MutableRefObject, useRef } from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { Frame } from "@rbxts-ui/primitives";
import { fillArray } from "shared/utils/object-utils";

import { FlyTo } from "./FlyTo";

const getRandomStartPosition = () => {
	const screenSize = Workspace.CurrentCamera?.ViewportSize ?? new Vector2(800, 600);
	return new UDim2(0, math.round(math.random() * screenSize.X), 0, math.round(math.random() * screenSize.Y));
};

interface FlyToComponentsProps {
	readonly amount: number;
	readonly statsImageRef: MutableRefObject<ImageLabel | undefined>;
	readonly image: string;
	readonly sound?: string;
}

const ROUND_AMOUNT = 10;

const MAX_ITEMS = 50;

const FlyToComponentsTemp = ({ amount, statsImageRef: goldCardRef, image, sound }: FlyToComponentsProps) => {
	const lastAmount = usePrevious(amount);

	const flyToRef = useRef<Frame>();

	const diff = amount - (lastAmount ?? 0);

	if (diff <= 0) {
		return undefined;
	}

	const newAmountChange = math.min(MAX_ITEMS, math.ceil(diff / ROUND_AMOUNT));

	const flyToInstances = fillArray(newAmountChange, (index) => ({
		id: `${index}`,
		from: getRandomStartPosition(),
	}));

	const duration = 0.5;
	const delayDuration = 2;
	const size = flyToInstances.size();
	const delay = math.min(0.1, delayDuration / size);

	return (
		<Frame size={new UDim2(1, 0, 1, 0)} ref={flyToRef}>
			{flyToInstances.map(({ id, from }, index) => (
				<FlyTo
					key={`flyto-${id}-${math.random()}`}
					delay={index * delay}
					image={image}
					from={from}
					flyToRef={flyToRef}
					toRef={goldCardRef}
					duration={duration}
					curveHeight={100}
					sound={sound}
				/>
			))}
		</Frame>
	);
};

export const FlyToComponents = memo(FlyToComponentsTemp, (prevProps, nextProps) => {
	return prevProps.amount === nextProps.amount;
});
