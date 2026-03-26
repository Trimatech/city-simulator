import { useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { selectSoldierOrbs } from "shared/store/soldiers";

import { getGlowColor, getGlowOutlineTransparency } from "./glow-utils";

interface SoldierGlowProps {
	readonly id: string;
	readonly model: Model | undefined;
}

const FILL_TRANSPARENCY = 1;

export function SoldierGlow({ id, model }: SoldierGlowProps) {
	const orbs = useSelector(selectSoldierOrbs(id));
	const highlightRef = useRef<Highlight>();

	const glowColor = getGlowColor(orbs);
	const outlineTransparency = getGlowOutlineTransparency(orbs);

	useEffect(() => {
		if (!model) {
			if (highlightRef.current) {
				highlightRef.current.Destroy();
				highlightRef.current = undefined;
			}
			return;
		}

		if (!highlightRef.current || !highlightRef.current.Parent) {
			const highlight = new Instance("Highlight");
			highlight.Name = "PowerupGlow";
			highlight.Adornee = model;
			highlight.FillTransparency = FILL_TRANSPARENCY;
			highlight.Parent = model;
			highlightRef.current = highlight;
		}

		highlightRef.current.FillColor = glowColor;
		highlightRef.current.OutlineColor = glowColor;
		highlightRef.current.OutlineTransparency = outlineTransparency;
	}, [model, glowColor, outlineTransparency]);

	useEffect(() => {
		return () => {
			if (highlightRef.current) {
				highlightRef.current.Destroy();
				highlightRef.current = undefined;
			}
		};
	}, []);

	return undefined;
}
