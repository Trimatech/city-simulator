import { store } from "server/store";
import { getCandy, onPlayerDeath } from "server/world/world.utils";
import { SOLDIER_MIN_AREA } from "shared/constants/core";
import {
	aabbIntersects,
	calculatePolygonBoundingBox,
	calculatePolygonOperation,
	isPointInPolygon,
	pointsToVectors,
	selectLargestRegionByArea,
	vector2ToPoint,
	vectorsToPoints,
} from "shared/polybool/poly-utils";
import { Point, pointsToPolygon, Polygon } from "shared/polybool/polybool";
import { calculatePolygonArea } from "shared/polygon-extra.utils";
import { selectSoldiersById } from "shared/store/soldiers";

import { candyGrid, eatCandies } from "../candy/candy-utils";
import { invalidateIsInsideCache } from "../collision/collision-cache";
import { updateAreaGridForPolygon } from "./soldier-grid";

export function cutOthersByNewArea(ownerId: string, newCutPolygon: Polygon) {
	const state = store.getState();
	const soldiersById = selectSoldiersById(state);

	const newCutPoints = newCutPolygon.regions[0] as Point[];
	const newCutBounds = calculatePolygonBoundingBox(newCutPoints);

	for (const [, soldier] of pairs(soldiersById)) {
		const otherId = soldier.id;
		if (otherId === ownerId || !soldier.polygon || soldier.polygon.size() < 3) continue;

		const otherBounds = soldier.polygonBounds;
		if (!aabbIntersects(otherBounds, newCutBounds)) continue;

		const otherSoldierPolygon = pointsToPolygon(vectorsToPoints(soldier.polygon));
		const differenceResult = calculatePolygonOperation(otherSoldierPolygon, newCutPolygon, "Difference");

		if (differenceResult.regions.size() > 0) {
			const bestRegion = selectLargestRegionByArea(differenceResult.regions);
			if (bestRegion !== undefined) {
				const updatedPolygon = pointsToVectors(bestRegion);
				const updatedArea = calculatePolygonArea(updatedPolygon);
				store.setSoldierPolygon(otherId, updatedPolygon, updatedArea);
				store.setSoldierPolygonAreaSize(otherId, updatedArea);
				invalidateIsInsideCache(otherId);

				updateAreaGridForPolygon({
					ownerId: otherId,
					polygon: updatedPolygon,
					dropTracers: false,
				});

				// We are checking if player is in its area and surrounded by other player trail and then he claimed it.
				const isStillInside =
					!soldier.isInside || isPointInPolygon(vector2ToPoint(soldier.position), bestRegion);
				if (updatedArea < SOLDIER_MIN_AREA || !isStillInside) {
					onPlayerDeath(otherId, ownerId, "trailing-wall-cut");
					store.incrementSoldierEliminations(ownerId);
				}
			}
		} else {
			updateAreaGridForPolygon({ ownerId: otherId, polygon: [] as Vector2[], dropTracers: false });
			invalidateIsInsideCache(otherId);
			store.setSoldierPolygon(otherId, [], 0, true);
			store.setSoldierPolygonAreaSize(otherId, 0);
			onPlayerDeath(otherId, ownerId, "trailing-wall-cut");
			store.incrementSoldierEliminations(ownerId);
		}
	}
}

export function processNewAreaClaim(ownerId: string, newCutPolygon: Polygon) {
	const state = store.getState();
	const soldiersById = selectSoldiersById(state);
	const owner = soldiersById[ownerId];

	if (!owner || owner.dead) return;

	const currentOwnerPolygon = owner.polygon as Vector2[] | undefined;
	if (!currentOwnerPolygon) return;

	const resultPolygon = pointsToPolygon(vectorsToPoints(currentOwnerPolygon));
	const result = calculatePolygonOperation(resultPolygon, newCutPolygon, "Union");
	if (result.regions.size() <= 0) return;

	const bestRegion = selectLargestRegionByArea(result.regions);
	if (bestRegion === undefined) return;

	const updatedOwnerPolygon = pointsToVectors(bestRegion);
	const polygonAreaSize = calculatePolygonArea(updatedOwnerPolygon);

	store.setSoldierPolygon(ownerId, updatedOwnerPolygon, polygonAreaSize, true);
	store.setSoldierPolygonAreaSize(ownerId, polygonAreaSize);
	updateAreaGridForPolygon({ ownerId, polygon: updatedOwnerPolygon as Vector2[] });

	const newCutPoints = newCutPolygon.regions[0] as Point[];
	const boundingBox = calculatePolygonBoundingBox(newCutPoints);
	const candiesInNewArea = candyGrid.queryBox(boundingBox.min, boundingBox.size, (point) => {
		const candy = getCandy(point.metadata.id);
		if (!candy || candy.eatenAt) return false;
		return isPointInPolygon(vector2ToPoint(point.position), newCutPoints);
	});
	eatCandies(candiesInNewArea, ownerId);

	cutOthersByNewArea(ownerId, newCutPolygon);
}

export function applyInitialPolygonClaim(ownerId: string) {
	const state = store.getState();
	const soldiersById = selectSoldiersById(state);
	const owner = soldiersById[ownerId];

	if (!owner || owner.dead) return;

	const ownerPolygon = owner.polygon as Vector2[] | undefined;
	if (!ownerPolygon || ownerPolygon.size() === 0) return;

	// Reflect owner's initial polygon on the area grid
	updateAreaGridForPolygon({ ownerId, polygon: ownerPolygon });

	// Treat the owner's initial polygon as the newly claimed area to cut from others
	const newCutPolygon = pointsToPolygon(vectorsToPoints(ownerPolygon));
	cutOthersByNewArea(ownerId, newCutPolygon);
}
