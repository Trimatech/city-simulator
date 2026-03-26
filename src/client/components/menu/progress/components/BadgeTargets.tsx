import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { formatInteger } from "client/utils/format-integer";
import { USER_NAME } from "shared/constants/core";

import { BadgeTarget, BADGE_TARGETS } from "../constants";
import { ProgressCardItem } from "./ProgressCardItem";
import { SectionHeader } from "./SectionHeader";

function BadgeTargetItem({ badge }: { readonly badge: BadgeTarget }) {
	const current = useSelector(badge.select(USER_NAME));
	const clamped = math.min(current, badge.target);
	const ratio = clamped / badge.target;
	const complete = current >= badge.target;

	return (
		<ProgressCardItem
			key={badge.key}
			title={badge.title}
			subtitle={badge.detail}
			accent={badge.accent}
			progress={ratio}
			valueText={complete ? "Done" : `${formatInteger(clamped)}/${formatInteger(badge.target)}`}
			progressLabel={complete ? "100%" : `${math.floor(ratio * 100)}%`}
		/>
	);
}

export function BadgeTargets() {
	return (
		<>
			<SectionHeader text="Badges" />
			{BADGE_TARGETS.map((badge) => (
				<BadgeTargetItem key={badge.key} badge={badge} />
			))}
		</>
	);
}
