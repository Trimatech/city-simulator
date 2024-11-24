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
 * Checks if a point is "behind" the offset direction
 * @param originalPoint Original point
 * @param offsetPoint Offset point
 * @param direction Direction vector
 * @param offset Offset distance
 * @returns true if the point is behind the offset direction, false otherwise
 */
function isPointBehindOffset(
	originalPoint: Vector2,
	offsetPoint: Vector2,
	direction: Vector2,
	offset: number,
): boolean {
	const actualOffset = offsetPoint.sub(originalPoint);
	const projectedDistance = actualOffset.Dot(direction);
	return projectedDistance < -offset * 2; // Use 2x offset as threshold
}

/**
 * Calculates intersection point of two lines
 * @param line1Start Start point of the first line
 * @param line1End End point of the first line
 * @param line2Start Start point of the second line
 * @param line2End End point of the second line
 * @returns Intersection point of the two lines, or undefined if no intersection
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

	const intersection = new Vector2(
		line1Start.X + ua * (line1End.X - line1Start.X),
		line1Start.Y + ua * (line1End.Y - line1Start.Y),
	);

	return intersection;
}

/**
 * Checks if a point is inside a polygon
 */
function isPointInsidePolygon(point: Vector2, polygon: Vector2[]): boolean {
	let inside = false;
	for (let i = 0, j = polygon.size() - 1; i < polygon.size(); j = i++) {
		const xi = polygon[i].X,
			yi = polygon[i].Y;
		const xj = polygon[j].X,
			yj = polygon[j].Y;

		const intersect = yi > point.Y !== yj > point.Y && point.X < ((xj - xi) * (point.Y - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}
	return inside;
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

		const direction = following.sub(current).Unit;
		const perpendicular = new Vector2(-direction.Y, direction.X);

		const offsetStart = current.add(perpendicular.mul(adjustedOffset));
		const offsetEnd = following.add(perpendicular.mul(adjustedOffset));

		offsetLines.push({ start: offsetStart, end: offsetEnd });
	}

	// Second pass: find intersections and handle special cases
	for (let i = 0; i < offsetLines.size(); i++) {
		const currentLine = offsetLines[i];
		const nextLine = offsetLines[i === offsetLines.size() - 1 ? 0 : i + 1];
		const current = points[i];
		const following = points[i === points.size() - 1 ? 0 : i + 1];
		const previous = points[i === 0 ? points.size() - 1 : i - 1];

		const intersection = findIntersection(currentLine.start, currentLine.end, nextLine.start, nextLine.end);

		if (intersection) {
			const direction = following.sub(current).Unit;
			const prevDirection = current.sub(previous).Unit;

			// Check if intersection point is too far "behind" either line
			const isBehindCurrent = isPointBehindOffset(current, intersection, direction, math.abs(adjustedOffset));
			const isBehindPrev = isPointBehindOffset(previous, intersection, prevDirection, math.abs(adjustedOffset));

			// Check if intersection point is inside the original polygon
			const isInside = isPointInsidePolygon(intersection, points);

			if (!isInside || isBehindCurrent || isBehindPrev) {
				// If point would be outside or behind, find the nearest valid point
				const toPrevious = previous.sub(current).Unit;
				const toFollowing = following.sub(current).Unit;
				const angle = math.acos(math.clamp(toPrevious.Dot(toFollowing), -1, 1));

				if (angle < math.rad(60)) {
					// For sharp angles, merge to a single point
					const bisector = toPrevious.add(toFollowing).Unit;
					const mergedPoint = current.add(bisector.mul(adjustedOffset));

					// Only add if we haven't just added a similar point
					const lastPoint = result[result.size() - 1];
					if (!lastPoint || lastPoint.sub(mergedPoint).Magnitude > offset * 0.1) {
						result.push(mergedPoint);
					}
				} else {
					// Recalculate perpendicular vector
					const direction = following.sub(current).Unit;
					const perpendicular = new Vector2(-direction.Y, direction.X);

					// Use the original offset point but ensure it's inside
					const offsetPoint = current.add(perpendicular.mul(adjustedOffset));
					if (isPointInsidePolygon(offsetPoint, points)) {
						result.push(offsetPoint);
					}
				}
			} else {
				// Point is valid, use the intersection
				result.push(intersection);
			}
		} else {
			// If no intersection found, ensure the point is inside
			const offsetPoint = currentLine.end;
			if (isPointInsidePolygon(offsetPoint, points)) {
				result.push(offsetPoint);
			}
		}
	}

	// Final pass: remove any remaining points that are too close together
	const cleanedResult: Vector2[] = [];
	for (let i = 0; i < result.size(); i++) {
		const point = result[i];
		const nextPoint = result[i === result.size() - 1 ? 0 : i + 1];

		if (point.sub(nextPoint).Magnitude > offset * 0.1) {
			cleanedResult.push(point);
		}
	}

	return cleanedResult;
}
