import { MutableRefObject } from "@rbxts/react";

export interface AnimationStrategy {
	animate(
		from: UDim2,
		toRef: MutableRefObject<Frame | undefined>,
		flyToRef: MutableRefObject<Frame | undefined>,
		duration: number,
		curveHeight: number,
		setPosition: (position: UDim2) => void,
		setSize: (size: UDim2) => void,
		onFinish: () => void,
	): void;
}
