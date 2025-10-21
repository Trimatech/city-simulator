import { useCamera, useEventListener, useInterval } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { RunService } from "@rbxts/services";
import { selectSoldierFromWorldSubject } from "client/store/world";

import { toRealSpace } from "./utils";

export function VoiceCamera() {
	const camera = useCamera();
	const soldier = useSelector(selectSoldierFromWorldSubject);

	warn("VoiceCamera rendering", soldier);

	const getCameraCFrame = (position: Vector2) => {
		const origin = toRealSpace(position).Position;
		return CFrame.lookAt(origin, origin.add(new Vector3(0, -1, 0)), new Vector3(0, 0, -1));
	};

	useEventListener(RunService.RenderStepped, () => {
		if (soldier) {
			//camera.CFrame = getCameraCFrame(soldier.head);
		}
	});

	useInterval(() => {
		//camera.CameraType = Enum.CameraType.Scriptable;
	}, 1);

	return <></>;
}
