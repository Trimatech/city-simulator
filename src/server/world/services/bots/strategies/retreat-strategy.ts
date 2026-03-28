import { buildBlobCut } from "../bot-cuts";

/**
 * Retreat: a small, quick blob cut to get safely back inside the polygon.
 * The cut is tiny (small span + depth) so the bot returns to safety fast.
 */
export function buildRetreatPath(botId: string, botPosition: Vector2): Vector2[] {
	return buildBlobCut(botId, botPosition, {
		span: 15,
		depth: 6,
	});
}
