import { WORLD_BOUNDS } from "shared/constants/core";

import { scoreDirection } from "../bot-awareness";
import { buildBlobCut, buildRectCut } from "../bot-cuts";

const NUM_SAMPLE_DIRECTIONS = 8;
const SAMPLE_DISTANCE = 60;

/**
 * Discover: a normal-sized cut biased toward open space, with randomness
 * to prevent getting stuck cutting the same direction repeatedly.
 */
export function buildDiscoverPath(botId: string, botPosition: Vector2): Vector2[] {
	const random = new Random();

	// Score directions but pick from top candidates randomly (not always the best)
	const candidates: { dir: Vector2; score: number }[] = [];

	// Random phase offset so bots don't all sample the same 8 angles
	const phaseOffset = random.NextNumber() * math.pi * 2;

	for (let i = 0; i < NUM_SAMPLE_DIRECTIONS; i++) {
		const angle = phaseOffset + (i / NUM_SAMPLE_DIRECTIONS) * math.pi * 2;
		const dir = new Vector2(math.cos(angle), math.sin(angle));
		const candidateTarget = botPosition.add(dir.mul(SAMPLE_DISTANCE));

		if (math.abs(candidateTarget.X) > WORLD_BOUNDS - 20 || math.abs(candidateTarget.Y) > WORLD_BOUNDS - 20) {
			continue;
		}

		const s = scoreDirection(botId, botPosition, dir, SAMPLE_DISTANCE);
		// Add random noise to scores to break ties and prevent repetition
		candidates.push({ dir, score: s + random.NextNumber() * 200 });
	}

	// Sort by score descending, then pick randomly from top 3
	candidates.sort((a, b) => a.score > b.score);
	const pickIndex = math.min(math.floor(random.NextNumber() * 3), candidates.size() - 1);
	const bestDirection =
		candidates.size() > 0
			? candidates[pickIndex].dir
			: new Vector2(random.NextNumber() - 0.5, random.NextNumber() - 0.5).Unit;

	if (random.NextNumber() > 0.5) {
		return buildRectCut(botId, botPosition, { direction: bestDirection });
	}
	return buildBlobCut(botId, botPosition, { direction: bestDirection });
}
