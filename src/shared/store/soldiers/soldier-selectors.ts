import Object from "@rbxts/object-utils";
import { createSelector, shallowEqual } from "@rbxts/reflex";
import { WORLD_BOUNDS } from "shared/constants/core";
import { USER_NAME } from "shared/constants/core";
import { SharedState } from "shared/store";
import { mapProperties } from "shared/utils/object-utils";
import { getPlayerByName } from "shared/utils/player-utils";

import { SoldierEntity, SoldiersState } from "./soldier-slice";

const WORLD_AREA = math.pi * math.pow(WORLD_BOUNDS, 2);

export interface CompetitionEntry {
	readonly id: string;
	readonly name: string;
	readonly area: number;
	readonly share: number;
	readonly eliminations: number;
	readonly rank: number;
	readonly isLocal: boolean;
}

export const identifySoldier = (soldier: SoldierEntity) => {
	return soldier.id;
};

export const cycleNextSoldier = (currentId: string) => (state: SharedState) => {
	const soldiers = selectSoldiersSorted((a, b) => a.polygonAreaSize > b.polygonAreaSize)(state);
	const index = soldiers.findIndex((soldier) => soldier.id === currentId);

	if (index !== -1) {
		return soldiers[(index + 1) % soldiers.size()]?.id;
	} else {
		return soldiers[0]?.id;
	}
};

export const selectSoldiersById = (state: SharedState) => {
	return state.soldiers;
};

export const selectSoldierCount = createSelector(selectSoldiersById, (soldiersById) => {
	let count = 0;

	for (const [,] of pairs(soldiersById)) {
		count++;
	}

	return count;
});

export const selectDeadSoldiersById = createSelector(selectSoldiersById, (soldiersById) => {
	return mapProperties(soldiersById, (soldier) => (soldier.dead ? soldier : undefined));
});

export const selectAliveSoldiersById = createSelector(selectSoldiersById, (soldiersById) => {
	return mapProperties(soldiersById, (soldier) => (!soldier.dead ? soldier : undefined));
});

export const selectIsInsideBySoldierById = createSelector(selectSoldiersById, (soldiersById) => {
	return mapProperties(soldiersById, (soldier) => (soldier.isInside ? soldier : undefined));
});

export const selectPlayerSoldiersById = createSelector(selectSoldiersById, (soldiersById) => {
	return mapProperties(soldiersById, (soldier) => (getPlayerByName(soldier.id) ? soldier : undefined));
});

export const selectPlayerCountIsAbove = (count: number) => {
	return createSelector(selectPlayerSoldiersById, (soldiersById) => {
		let playerCount = 0;

		for (const [,] of pairs(soldiersById)) {
			playerCount++;

			if (playerCount >= count) {
				return true;
			}
		}

		return false;
	});
};

export const selectLocalSoldier = (state: SharedState) => {
	return state.soldiers[USER_NAME];
};
export const selectSoldierTracers = (id: string) => {
	return (state: SharedState) => state.soldiers[id]?.tracers;
};

export const selectSoldierLastTracerPoint = (id: string) => {
	return (state: SharedState) => {
		const soldier = state.soldiers[id];
		if (!soldier) return undefined;
		return soldier.lastTracerPoint;
	};
};

export const selectLocalLastTracerPoint = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.lastTracerPoint;
};

export const selectLocalSoldierId = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.id;
};

export const selectLocalIsSpawned = (state: SharedState) => {
	const soldier = state.soldiers[USER_NAME];
	return soldier !== undefined && !soldier.dead;
};

export const selectLocalOrbs = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.orbs;
};

export const selectLocalEliminations = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.eliminations;
};

export const selectLocalHealth = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.health;
};

export const selectLocalMaxHealth = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.maxHealth;
};

export const selectLocalPolygonAreaSize = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.polygonAreaSize;
};

export const selectSoldierAreaShare = (id: string) => {
	return (state: SharedState) => {
		const area = state.soldiers[id]?.polygonAreaSize;
		return area !== undefined ? area / WORLD_AREA : undefined;
	};
};

export const selectLocalAreaShare = (state: SharedState) => {
	const area = state.soldiers[USER_NAME]?.polygonAreaSize;
	return area !== undefined ? area / WORLD_AREA : undefined;
};

export const selectLocalDeathChoiceDeadline = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.deathChoiceDeadline;
};

export const selectHasLocalSoldier = (state: SharedState) => {
	return USER_NAME in state.soldiers;
};

export const selectSoldiers = createSelector(selectSoldiersById, (soldiersById) => {
	return Object.values(soldiersById);
});

/**
 * Highest polygon area among alive soldiers. Skips removed slots (`undefined`) and dead soldiers.
 * (Dead entries can remain in the table with large area; they must not win "leader".)
 */
export function resolveTopSoldierEntity(soldiersById: SoldiersState): SoldierEntity | undefined {
	let topSoldier: SoldierEntity | undefined;

	for (const [, soldier] of pairs(soldiersById)) {
		if (soldier === undefined || soldier.dead) {
			continue;
		}

		if (topSoldier === undefined || soldier.polygonAreaSize > topSoldier.polygonAreaSize) {
			topSoldier = soldier;
		}
	}

	return topSoldier;
}

/** Plain selector — use with `store.getState(selectLeaderId)` (reliable with combined producers). */
export const selectLeaderId = (state: SharedState): string | undefined => {
	return resolveTopSoldierEntity(state.soldiers)?.id;
};

export const selectTopSoldier = createSelector(
	[selectSoldiersById],
	(soldiersById) => {
		const topSoldier = resolveTopSoldierEntity(soldiersById);
		return topSoldier ? { id: topSoldier.id, position: topSoldier.position } : undefined;
	},
	(a, b) => {
		if (a === b) return true;
		if (!a || !b) return a === b;
		return a.id === b.id && a.position === b.position;
	},
);

export const selectTopSoldierPosition = createSelector(selectSoldiersById, (soldiersById) => {
	return resolveTopSoldierEntity(soldiersById)?.position;
});

export const selectSoldiersSorted = (comparator: (current: SoldierEntity, existing: SoldierEntity) => boolean) => {
	return createSelector(selectSoldiersById, (soldiersById) => {
		const topSoldiers: SoldierEntity[] = [];

		for (const [, soldier] of pairs(soldiersById)) {
			if (soldier === undefined) {
				continue;
			}

			const index = topSoldiers.findIndex((topSoldier) => comparator(soldier, topSoldier));

			if (index === -1) {
				topSoldiers.push(soldier);
			} else {
				topSoldiers.insert(index, soldier);
			}
		}

		return topSoldiers;
	});
};

export const selectSoldierIds = createSelector(
	[selectSoldiersById],
	(soldiersById) => {
		const ids = Object.keys(soldiersById) as string[];
		ids.sort();
		return ids as readonly string[];
	},
	{ resultEqualityCheck: shallowEqual },
);

export const selectSoldierById = (id: string) => {
	return (state: SharedState) => state.soldiers[id];
};

export const selectSoldierSkin = (id: string) => {
	return (state: SharedState) => state.soldiers[id]?.skin;
};

export const selectSoldierZIndex = (id: string) => {
	return (state: SharedState) => state.soldiers[id]?.zIndex ?? 0;
};

export const selectSoldierShieldActiveUntil = (id: string) => {
	return (state: SharedState) => state.soldiers[id]?.shieldActiveUntil ?? 0;
};

export const selectSoldierTurboActiveUntil = (id: string) => {
	return (state: SharedState) => state.soldiers[id]?.turboActiveUntil ?? 0;
};

export const selectLocalTurboActiveUntil = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.turboActiveUntil ?? 0;
};

export const selectLocalShieldActiveUntil = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.shieldActiveUntil ?? 0;
};

export const selectSoldierOrbs = (id: string) => {
	return (state: SharedState) => state.soldiers[id]?.orbs;
};

export const selectSoldierArea = (id: string) => {
	return (state: SharedState) => state.soldiers[id]?.polygonAreaSize;
};

export const selectSoldierIsDead = (id: string) => {
	return (state: SharedState) => {
		const soldier = state.soldiers[id];
		return soldier ? soldier.dead : true;
	};
};

export const selectSoldierIsInside = (id: string) => {
	return (state: SharedState) => {
		const soldier = state.soldiers[id];
		return soldier ? soldier.isInside : true;
	};
};

export const selectSoldierPosition = (id: string) => {
	return (state: SharedState) => {
		const soldier = state.soldiers[id];
		return soldier ? soldier.position : new Vector2();
	};
};

export const selectSoldierRanking = (id: string) => {
	const comparator = (current: SoldierEntity, existing: SoldierEntity) => {
		return current.polygonAreaSize > existing.polygonAreaSize;
	};

	return createSelector(selectSoldiersSorted(comparator), (soldiers) => {
		const index = soldiers.findIndex((soldier) => soldier.id === id);

		return index === -1 ? undefined : index + 1;
	});
};

export const selectLocalSoldierRanking = selectSoldierRanking(USER_NAME);

export type MusicContext = "lobby" | "inside-area" | "outside-area";

export const selectLocalMusicContext = (state: SharedState): MusicContext => {
	const soldier = state.soldiers[USER_NAME];
	if (!soldier || soldier.dead) {
		return "lobby";
	}
	if (soldier.isInside) {
		return "inside-area";
	}

	return "outside-area";
};

export const selectRankForDisplay = (state: SharedState) => {
	const ranking = selectLocalSoldierRanking(state);

	if (ranking === undefined) {
		return;
	}

	const lastDigit = ranking % 10;
	const lastTwoDigits = ranking % 100;

	if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
		return `${ranking}th`;
	} else if (lastDigit === 1) {
		return `${ranking}st`;
	} else if (lastDigit === 2) {
		return `${ranking}nd`;
	} else if (lastDigit === 3) {
		return `${ranking}rd`;
	} else {
		return `${ranking}th`;
	}
};

export const selectTopCompetitionEntries = (limit = 5) => {
	return createSelector(selectSoldiersById, (soldiersById) => {
		const leaders: CompetitionEntry[] = [];

		for (const [, soldier] of pairs(soldiersById)) {
			if (!soldier || soldier.dead) {
				continue;
			}

			const entry: CompetitionEntry = {
				id: soldier.id,
				name: soldier.name,
				area: soldier.polygonAreaSize,
				share: soldier.polygonAreaSize / WORLD_AREA,
				eliminations: soldier.eliminations,
				rank: 0,
				isLocal: soldier.id === USER_NAME,
			};

			const index = leaders.findIndex((leader) => entry.area > leader.area);

			if (index === -1) {
				leaders.push(entry);
			} else {
				leaders.insert(index, entry);
			}

			if (leaders.size() > limit) {
				leaders.pop();
			}
		}

		return leaders.map((leader, index) => ({
			...leader,
			rank: index + 1,
		}));
	});
};
