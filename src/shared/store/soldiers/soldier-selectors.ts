import Object from "@rbxts/object-utils";
import { createSelector, shallowEqual } from "@rbxts/reflex";
import { USER_NAME } from "shared/constants/core";
import { SharedState } from "shared/store";
import { mapProperties } from "shared/utils/object-utils";
import { getPlayerByName } from "shared/utils/player-utils";

import { SoldierEntity } from "./soldier-slice";
import { soldierIsBoosting } from "./soldier-utils";

export const identifySoldier = (soldier: SoldierEntity) => {
	return soldier.id;
};

export const cycleNextSoldier = (currentId: string) => (state: SharedState) => {
	const soldiers = selectSoldiersSorted((a, b) => a.orbs > b.orbs)(state);
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

export const selectLocalOrbs = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.orbs;
};

export const selectLocalEliminations = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.eliminations;
};

export const selectLocalPolygonAreaSize = (state: SharedState) => {
	return state.soldiers[USER_NAME]?.polygonAreaSize;
};

export const selectHasLocalSoldier = (state: SharedState) => {
	return USER_NAME in state.soldiers;
};

export const selectSoldiers = createSelector(selectSoldiersById, (soldiersById) => {
	return Object.values(soldiersById);
});

export const selectTopSoldier = createSelector(selectSoldiersById, (soldiersById) => {
	let topSoldier: SoldierEntity | undefined;

	for (const [, soldier] of pairs(soldiersById)) {
		if (topSoldier === undefined || soldier.orbs > topSoldier.orbs) {
			topSoldier = soldier;
		}
	}

	return topSoldier;
});

export const selectSoldiersSorted = (comparator: (current: SoldierEntity, existing: SoldierEntity) => boolean) => {
	return createSelector(selectSoldiersById, (soldiersById) => {
		const topSoldiers: SoldierEntity[] = [];

		for (const [, soldier] of pairs(soldiersById)) {
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
		return Object.keys(soldiersById) as readonly string[];
	},
	shallowEqual,
);

export const selectSoldierById = (id: string) => {
	return (state: SharedState) => state.soldiers[id];
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

export const selectSoldierIsBoosting = (id: string) => {
	return (state: SharedState) => {
		const soldier = state.soldiers[id];
		return soldier ? soldierIsBoosting(soldier) : false;
	};
};

export const selectSoldierRanking = (id: string) => {
	const comparator = (current: SoldierEntity, existing: SoldierEntity) => {
		return current.orbs > existing.orbs;
	};

	return createSelector(selectSoldiersSorted(comparator), (soldiers) => {
		const index = soldiers.findIndex((soldier) => soldier.id === id);

		return index === -1 ? undefined : index + 1;
	});
};

export const selectLocalSoldierRanking = selectSoldierRanking(USER_NAME);

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
