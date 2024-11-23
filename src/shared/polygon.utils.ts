/**
 * Determines if polygon points are in clockwise order
 * @param points Polygon points
 * @returns true if clockwise, false if counterclockwise
 */
function isClockwise(points: Vector2[]): boolean {
	let sum = 0;
	for (let i = 0; i < points.size(); i++) {
		const current = points[i];
		const following = points[i === points.size() - 1 ? 0 : i + 1];
		sum += (following.X - current.X) * (following.Y + current.Y);
	}
	return sum > 0;
}

/**
 * Calculates intersection point of two lines
 */
function findIntersection(
	line1Start: Vector2,
	line1End: Vector2,
	line2Start: Vector2,
	line2End: Vector2,
): Vector2 | undefined {
	const denominator =
		(line2End.Y - line2Start.Y) * (line1End.X - line1Start.X) -
		(line2End.X - line2Start.X) * (line1End.Y - line1Start.Y);

	if (math.abs(denominator) < 1e-6) return undefined;

	const ua =
		((line2End.X - line2Start.X) * (line1Start.Y - line2Start.Y) -
			(line2End.Y - line2Start.Y) * (line1Start.X - line2Start.X)) /
		denominator;

	return new Vector2(
		line1Start.X + ua * (line1End.X - line1Start.X),
		line1Start.Y + ua * (line1End.Y - line1Start.Y),
	);
}

/**
 * Creates parallel lines offset by a fixed distance with proper corner handling
 * @param points Original polygon points
 * @param offset Distance to offset the parallel lines
 * @returns Offset polygon points with proper corners
 */
export function createParallelPolygon(points: Vector2[], offset: number): Vector2[] {
	if (points.size() < 3) return points;

	const clockwise = isClockwise(points);
	const adjustedOffset = clockwise ? -offset : offset;
	const result: Vector2[] = [];
	const offsetLines: Array<{ start: Vector2; end: Vector2 }> = [];

	// First pass: calculate offset lines
	for (let i = 0; i < points.size(); i++) {
		const current = points[i];
		const following = points[i === points.size() - 1 ? 0 : i + 1];

		// Calculate direction vector
		const direction = following.sub(current).Unit;
		const perpendicular = new Vector2(-direction.Y, direction.X);

		// Calculate offset points for this line segment
		const offsetStart = current.add(perpendicular.mul(adjustedOffset));
		const offsetEnd = following.add(perpendicular.mul(adjustedOffset));

		offsetLines.push({ start: offsetStart, end: offsetEnd });
	}

	// Second pass: find intersections and create final points
	for (let i = 0; i < offsetLines.size(); i++) {
		const currentLine = offsetLines[i];
		const nextLine = offsetLines[i === offsetLines.size() - 1 ? 0 : i + 1];

		const intersection = findIntersection(currentLine.start, currentLine.end, nextLine.start, nextLine.end);

		if (intersection) {
			// Calculate angle at original vertex
			const current = points[i];
			const following = points[i === points.size() - 1 ? 0 : i + 1];
			const previous = points[i === 0 ? points.size() - 1 : i - 1];

			const toPrevious = previous.sub(current).Unit;
			const toFollowing = following.sub(current).Unit;
			const angle = math.acos(math.clamp(toPrevious.Dot(toFollowing), -1, 1));

			// For very sharp angles, use the original offset point instead of intersection
			if (angle < math.rad(30)) {
				const perpCurrent = new Vector2(-toFollowing.Y, toFollowing.X);
				const offsetPoint = current.add(perpCurrent.mul(adjustedOffset));
				result.push(offsetPoint);
			} else {
				result.push(intersection);
			}
		} else {
			// If no intersection found, use the end point of current line
			result.push(currentLine.end);
		}
	}

	return result;
}
