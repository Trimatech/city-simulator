import React from "@rbxts/react";
import { InputCapture } from "client/components/ui/input-capture";

interface MouseProps {
	readonly setBoost: (boost: boolean) => void;
}

const KEY_CODES = new ReadonlySet<Enum.UserInputType | Enum.KeyCode>([
	Enum.UserInputType.MouseButton1,
	Enum.KeyCode.Space,
	Enum.KeyCode.LeftShift,
]);

export function Mouse({ setBoost }: MouseProps) {
	return (
		<InputCapture
			onInputBegan={(_, input) => {
				if (KEY_CODES.has(input.KeyCode) || KEY_CODES.has(input.UserInputType)) {
					setBoost(true);
				}
			}}
			onInputEnded={(_, input) => {
				if (KEY_CODES.has(input.KeyCode) || KEY_CODES.has(input.UserInputType)) {
					setBoost(false);
				}
			}}
		/>
	);
}
