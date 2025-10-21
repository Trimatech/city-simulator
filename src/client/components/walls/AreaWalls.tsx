import React, { memo, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { WALL_HEIGHT } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { createParallelPolygon } from "shared/polygon.utils";
import { getEdgeId } from "shared/utils/edge-id";

import { Wall } from "./Wall";
import { FADE_DURATION } from "./Walls.utils";

interface Props {
	skinId?: string;
	points: Vector2[];
	color?: Color3;
	transparency?: number;
	thickness?: number;
	height?: number;
	position?: Vector3;
	isCrumbling?: boolean;
	offset?: number;
}

function AreaWallsComponent({
	skinId,
	points,
	color = palette.white,
	transparency = 0,
	isCrumbling = false,
	offset = 1,
}: Props) {
	if (!points || points.size() === 0) {
		warn("No points found in polygon");
		return undefined;
	}

	// Build outer edges and stable ids
	const outerEdges = useMemo(() => {
		const edges = new Array<{ id: string; a: Vector2; b: Vector2 }>();
		for (let i = 0; i < points.size(); i++) {
			const a = points[i];
			const b = points[i + 1] || points[0];
			edges.push({ id: getEdgeId({ a, b }), a, b });
		}
		return edges;
	}, [points]);

	// Track previous ids to compute local diff
	const prevIdsRef = useRef<Map<string, { a: Vector2; b: Vector2 }>>(new Map());
	const [removing, setRemoving] = useState(new Map<string, { a: Vector2; b: Vector2 }>());
	const [visibleIds, setVisibleIds] = useState(new Map<string, true>());

	function cloneStringMap<T>(m: Map<string, T>): Map<string, T> {
		const cloned = new Map<string, T>();
		m.forEach((v, k) => cloned.set(k, v));
		return cloned;
	}

	// initialize visibleIds for first render
	useEffect(() => {
		if (visibleIds.size() > 0) return;
		const map = new Map<string, true>();
		outerEdges.forEach((e) => map.set(e.id, true));
		setVisibleIds(map);
		const prev = new Map<string, { a: Vector2; b: Vector2 }>();
		outerEdges.forEach((e) => prev.set(e.id, { a: e.a, b: e.b }));
		prevIdsRef.current = prev;
	}, []);

	useEffect(() => {
		debug.profilebegin("AreaWalls spam");
		// build maps for current edges
		const currentIds = new Map<string, { a: Vector2; b: Vector2 }>();
		outerEdges.forEach((e) => currentIds.set(e.id, { a: e.a, b: e.b }));

		// removals: in prev but not in current
		const removed = new Array<{ id: string; a: Vector2; b: Vector2 }>();
		prevIdsRef.current.forEach((edge, id) => {
			if (!currentIds.has(id)) removed.push({ id, a: edge.a, b: edge.b });
		});

		if (removed.size() > 0) {
			setRemoving((prev) => {
				const updated = cloneStringMap(prev);
				removed.forEach(({ id, a, b }) => updated.set(id, { a, b }));
				return updated;
			});
			// stop rendering normal wall immediately
			setVisibleIds((prev) => {
				const updated = cloneStringMap(prev);
				removed.forEach(({ id }) => updated.delete(id));
				return updated;
			});
			// drop after crumble fade
			task.delay(FADE_DURATION + 0.15, () => {
				setRemoving((prev) => {
					const updated = cloneStringMap(prev);
					removed.forEach(({ id }) => updated.delete(id));
					return updated;
				});
			});
		}

		// additions: in current but not in prev
		const added = new Array<{ id: string; a: Vector2; b: Vector2 }>();
		currentIds.forEach((edge, id) => {
			if (!prevIdsRef.current.has(id)) added.push({ id, a: edge.a, b: edge.b });
		});

		// stagger reveal of added edges
		const STEP = 0.05; // seconds between spawns
		added.forEach((e, i) => {
			task.delay(i * STEP, () => {
				setVisibleIds((prev) => {
					if (prev.has(e.id)) return prev;
					const updated = cloneStringMap(prev);
					updated.set(e.id, true);
					return updated;
				});
			});
		});

		// persist current as previous for next diff
		prevIdsRef.current = currentIds;

		debug.profileend();
	}, [outerEdges]);

	const innerPoints = createParallelPolygon(points, offset);

	// Build array view of removing map without relying on entries()
	const removingList = useMemo(() => {
		const arr = new Array<{ id: string; a: Vector2; b: Vector2 }>();
		removing.forEach((edge, id) => arr.push({ id, a: edge.a, b: edge.b }));
		return arr;
	}, [removing]);

	return (
		<>
			{/* Outer walls (only visible edges; others will be staged in) */}
			{outerEdges
				.filter((e) => visibleIds.has(e.id))
				.map((edge) => (
					<Wall
						key={edge.id}
						folderName={`outerWall`}
						startPoint={edge.a}
						endPoint={edge.b}
						color={color}
						transparency={transparency}
						height={WALL_HEIGHT}
						isCrumbling={isCrumbling}
						skinId={skinId}
					/>
				))}

			{/* Render removing edges temporarily with crumble */}
			{removingList.map(({ id, a, b }) => (
				<Wall
					key={`${id}-removing`}
					folderName={`outerWall`}
					startPoint={a}
					endPoint={b}
					color={color}
					transparency={transparency}
					height={WALL_HEIGHT}
					isCrumbling={true}
					skinId={skinId}
				/>
			))}

			{/* Inner walls */}
			{innerPoints.map((point, index) => {
				const nextPoint = innerPoints[index + 1] || innerPoints[0];
				return (
					<Wall
						key={`inner-wall-${index}`}
						folderName={`innerWall`}
						startPoint={point}
						endPoint={nextPoint}
						color={color}
						transparency={transparency}
						height={5.5}
						isCrumbling={isCrumbling}
						skinId={skinId}
					/>
				);
			})}
		</>
	);
}

export const AreaWalls = memo(AreaWallsComponent);
