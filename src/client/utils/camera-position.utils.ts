import { Players, Workspace } from "@rbxts/services";

export function getCameraGroundFocusXZ(camera: Camera) {
	const cframe = camera.CFrame;
	const eye = cframe.Position;
	const look = cframe.LookVector;
	const denom = look.Y;
	if (denom !== 0) {
		const t = -eye.Y / denom;
		const focus = eye.add(look.mul(t));
		return new Vector2(focus.X, focus.Z);
	}
	return new Vector2(eye.X, eye.Z);
}

export function getObserverPosition2D(options?: { preferCamera?: boolean }) {
	const preferCamera = options?.preferCamera === true;

	if (!preferCamera) {
		const character = Players.LocalPlayer?.Character;
		if (character) {
			const pivot = character.GetPivot();
			return new Vector2(pivot.Position.X, pivot.Position.Z);
		}
	}

	const camera = Workspace.CurrentCamera;
	if (!camera) {
		return undefined;
	}
	const result = getCameraGroundFocusXZ(camera);

	return result;
}
