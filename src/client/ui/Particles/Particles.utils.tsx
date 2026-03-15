import { Workspace } from "@rbxts/services";

export const getRandomStartPosition = () => {
	const screenSize = Workspace.CurrentCamera?.ViewportSize ?? new Vector2(800, 600);
	return new UDim2(0, math.round(math.random() * screenSize.X), 0, math.round(math.random() * screenSize.Y));
};

export const getCenterPosition = (frame: Frame) => {
	const absPos = frame.AbsolutePosition;
	const absSize = frame.AbsoluteSize;
	const centerX = absPos.X + absSize.X / 2;
	const centerY = absPos.Y + absSize.Y / 2;
	return new Vector2(centerX, centerY);
};

export function evaluateNumberSequence(sequence: NumberSequence, alpha: number): number {
	const keypoints = sequence.Keypoints;
	if (alpha <= 0) return keypoints[0].Value;
	if (alpha >= 1) return keypoints[keypoints.size() - 1].Value;

	for (let i = 0; i < keypoints.size() - 1; i++) {
		const current = keypoints[i];
		const nextKeypoint = keypoints[i + 1];
		if (alpha >= current.Time && alpha <= nextKeypoint.Time) {
			const t = (alpha - current.Time) / (nextKeypoint.Time - current.Time);
			return current.Value + t * (nextKeypoint.Value - current.Value);
		}
	}
	return keypoints[keypoints.size() - 1].Value;
}

export function evaluateColorSequence(sequence: ColorSequence, alpha: number): Color3 {
	const keypoints = sequence.Keypoints;
	if (alpha <= 0) return keypoints[0].Value;
	if (alpha >= 1) return keypoints[keypoints.size() - 1].Value;

	for (let i = 0; i < keypoints.size() - 1; i++) {
		const current = keypoints[i];
		const nextKeypoint = keypoints[i + 1];
		if (alpha >= current.Time && alpha <= nextKeypoint.Time) {
			const t = (alpha - current.Time) / (nextKeypoint.Time - current.Time);
			return new Color3(
				current.Value.R + t * (nextKeypoint.Value.R - current.Value.R),
				current.Value.G + t * (nextKeypoint.Value.G - current.Value.G),
				current.Value.B + t * (nextKeypoint.Value.B - current.Value.B),
			);
		}
	}
	return keypoints[keypoints.size() - 1].Value;
}

export function evaluateNumberRange(range: NumberRange): number {
	return math.random() * (range.Max - range.Min) + range.Min;
}

export function rotateVector(vector: Vector2, angle: number): Vector2 {
	const rad = math.rad(angle);
	const cos = math.cos(rad);
	const sin = math.sin(rad);
	return new Vector2(vector.X * cos - vector.Y * sin, vector.X * sin + vector.Y * cos);
}
