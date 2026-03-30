import { usePrevious } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Frame } from "@rbxts-ui/primitives";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { selectWorldSubjectDead } from "client/store/world";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";

interface FlashState {
	readonly color: Color3;
	readonly transparency: number;
}

export const impactOverlayTriggers = {
	death: {
		color: palette.red1,
		transparency: 0.65,
	},
	carpet: {
		color: palette.yellow,
		transparency: 0.82,
	},
	nuke: {
		color: palette.claimYellow,
		transparency: 0.7,
	},
} as const;

export type ImpactOverlayTrigger = keyof typeof impactOverlayTriggers;

interface ImpactOverlayProps {
	readonly previewTrigger?: {
		readonly id: number;
		readonly kind: ImpactOverlayTrigger;
	};
}

const HIDDEN_FLASH: FlashState = {
	color: palette.white,
	transparency: 1,
};

export function ImpactOverlay({ previewTrigger }: ImpactOverlayProps) {
	const dead = useSelector(selectWorldSubjectDead);
	const wasDead = usePrevious(dead);
	const [flashState, setFlashState] = useState<FlashState>(HIDDEN_FLASH);
	const [transparency, transparencyMotion] = useMotion(1);

	const triggerFlash = (color: Color3, startTransparency: number) => {
		setFlashState({ color, transparency: startTransparency });
		transparencyMotion.set(startTransparency);
		transparencyMotion.spring(1, {
			...springs.responsive,
			friction: 18,
			tension: 160,
		});
	};

	const triggerImpact = (kind: ImpactOverlayTrigger) => {
		const impact = impactOverlayTriggers[kind];
		triggerFlash(impact.color, impact.transparency);
	};

	useEffect(() => {
		if (dead && wasDead !== true) {
			triggerImpact("death");
		}
	}, [dead, wasDead]);

	useEffect(() => {
		const cleanupCarpet = remotes.client.powerupCarpet.connect(() => {
			triggerImpact("carpet");
		});

		const cleanupNuke = remotes.client.powerupNuke.connect(() => {
			triggerImpact("nuke");
		});

		return () => {
			cleanupCarpet();
			cleanupNuke();
		};
	}, []);

	useEffect(() => {
		if (!previewTrigger) return;
		triggerImpact(previewTrigger.kind);
	}, [previewTrigger]);

	return (
		<Frame
			name="ImpactOverlay"
			size={new UDim2(1, 0, 1, 0)}
			backgroundColor={flashState.color}
			backgroundTransparency={transparency}
			zIndex={20}
		/>
	);
}
