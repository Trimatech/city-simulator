import { useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";

export function useTooltip(text?: string) {
	const [visible, setVisible] = useState(false);
	const [position, setPosition] = useState<Vector2 | undefined>(undefined);

	const showTooltip = () => {
		if (!text) return;

		// Get mouse position
		const mouseLocation = UserInputService.GetMouseLocation();
		setPosition(new Vector2(mouseLocation.X, mouseLocation.Y));
		setVisible(true);
	};

	const hideTooltip = () => {
		setVisible(false);
	};

	return {
		tooltipProps: {
			text: text ?? "",
			visible,
			position,
		},
		tooltipEvents: {
			onMouseEnter: showTooltip,
			onMouseLeave: hideTooltip,
		},
	};
}
