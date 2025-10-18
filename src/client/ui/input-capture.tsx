import { useEventListener } from "@rbxts/pretty-react-hooks";
import React, { useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import { IS_EDITOR } from "shared/constants/core";

import { Group } from "./layout/group";

interface InputCaptureProps {
	readonly onInputBegan?: (rbx: Frame, input: InputObject) => void;
	readonly onInputChanged?: (rbx: Frame, input: InputObject) => void;
	readonly onInputEnded?: (rbx: Frame, input: InputObject) => void;
	readonly size?: UDim2;
	readonly position?: UDim2;
	readonly anchorPoint?: Vector2;
}

export function InputCapture({
	onInputBegan,
	onInputChanged,
	onInputEnded,
	size,
	position,
	anchorPoint,
}: InputCaptureProps) {
	const [frame, frameRef] = useState<Frame>();

	useEventListener(UserInputService.InputBegan, (input, gameProcessed) => {
		if (frame && !IS_EDITOR && !gameProcessed) {
			onInputBegan?.(frame, input);
		}
	});

	useEventListener(UserInputService.InputEnded, (input) => {
		if (frame && !IS_EDITOR) {
			onInputEnded?.(frame, input);
		}
	});

	useEventListener(UserInputService.InputChanged, (input) => {
		if (frame && !IS_EDITOR) {
			onInputChanged?.(frame, input);
		}
	});

	return (
		<Group
			ref={frameRef}
			size={size}
			position={position}
			anchorPoint={anchorPoint}
			event={{
				InputBegan: IS_EDITOR ? onInputBegan : undefined,
				InputChanged: IS_EDITOR ? onInputChanged : undefined,
				InputEnded: IS_EDITOR ? onInputEnded : undefined,
			}}
		/>
	);
}
