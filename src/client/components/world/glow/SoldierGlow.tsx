import { useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { selectSoldierOrbs } from "shared/store/soldiers";

import { getGlowColor } from "./glow-utils";

interface SoldierGlowProps {
	readonly id: string;
	readonly model: Model | undefined;
}

const FILL_TRANSPARENCY = 0.75;
const OUTLINE_TRANSPARENCY = 0;

export function SoldierGlow({ id, model }: SoldierGlowProps) {
	const orbs = useSelector(selectSoldierOrbs(id));
	const highlightRef = useRef<Highlight>();

	const glowColor = getGlowColor(orbs);

	useEffect(() => {
		if (!model) {
			if (highlightRef.current) {
				highlightRef.current.Destroy();
				highlightRef.current = undefined;
			}
			return;
		}

		if (glowColor) {
			if (!highlightRef.current || !highlightRef.current.Parent) {
				const highlight = new Instance("Highlight");
				highlight.Name = "PowerupGlow";
				highlight.Adornee = model;
				highlight.FillTransparency = FILL_TRANSPARENCY;
				highlight.OutlineTransparency = OUTLINE_TRANSPARENCY;
				highlight.Parent = model;
				highlightRef.current = highlight;
			}

			highlightRef.current.FillColor = glowColor;
			highlightRef.current.OutlineColor = glowColor;
		} else {
			if (highlightRef.current) {
				highlightRef.current.Destroy();
				highlightRef.current = undefined;
			}
		}
	}, [model, glowColor]);

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
