import { GuiService } from "@rbxts/services";

interface PickCoordSpaceParams {
	readonly frame: Frame;
	readonly mouseX: number;
	readonly mouseY: number;
}

export interface MapMouseToGradientResult {
	readonly offset: Vector2;
	readonly rotation?: number;
	readonly isInside: boolean;
}

function isPointInsideFrame(frame: Frame, x: number, y: number) {
	const absPos = frame.AbsolutePosition;
	const absSize = frame.AbsoluteSize;
	return x >= absPos.X && y >= absPos.Y && x < absPos.X + absSize.X && y < absPos.Y + absSize.Y;
}

function pickMouseCoordSpaceForFrame({ frame, mouseX, mouseY }: PickCoordSpaceParams) {
	const [insetTopLeft] = GuiService.GetGuiInset();
	const candidates = [
		new Vector2(mouseX, mouseY),
		new Vector2(mouseX - insetTopLeft.X, mouseY - insetTopLeft.Y),
		new Vector2(mouseX + insetTopLeft.X, mouseY + insetTopLeft.Y),
	];

	for (const candidate of candidates) {
		if (isPointInsideFrame(frame, candidate.X, candidate.Y)) return candidate;
	}

	return candidates[0];
}

export function mapMouseToUiGradient({ frame, mouseX, mouseY }: PickCoordSpaceParams): MapMouseToGradientResult {
	const point = pickMouseCoordSpaceForFrame({ frame, mouseX, mouseY });
	const absPos = frame.AbsolutePosition;
	const absSize = frame.AbsoluteSize;

	const relX01 = math.clamp((point.X - absPos.X) / math.max(1, absSize.X), 0, 1);
	const relY01 = math.clamp((point.Y - absPos.Y) / math.max(1, absSize.Y), 0, 1);

	const offset = new Vector2(relX01 * 2 - 1, relY01 * 2 - 1);

	const vx = 0.5 - relX01;
	const vy = 0.5 - relY01;
	const tooSmall = math.abs(vx) <= 1e-4 && math.abs(vy) <= 1e-4;
	const rotation = tooSmall ? undefined : math.deg(math.atan2(vy, vx)) + 180;

	return { offset, rotation, isInside: isPointInsideFrame(frame, point.X, point.Y) };
}
