import { useEventListener } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { UserInputService } from "@rbxts/services";

interface GamepadProps {
	readonly setBoost: (boost: boolean) => void;
}

const BOOST_KEYS = new ReadonlySet<Enum.KeyCode>([Enum.KeyCode.ButtonR2, Enum.KeyCode.ButtonL2, Enum.KeyCode.ButtonA]);

export function Gamepad({ setBoost }: GamepadProps) {
	useEventListener(UserInputService.InputBegan, (input) => {
		if (input.UserInputType === Enum.UserInputType.Gamepad1 && BOOST_KEYS.has(input.KeyCode)) {
			setBoost(true);
		}
	});

	useEventListener(UserInputService.InputEnded, (input) => {
		if (input.UserInputType === Enum.UserInputType.Gamepad1 && BOOST_KEYS.has(input.KeyCode)) {
			setBoost(false);
		}
	});

	return <></>;
}
