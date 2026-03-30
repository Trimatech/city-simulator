import { composeBindings, lerpBinding } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Group, Image, Text } from "@rbxts-ui/primitives";
import { useMotion } from "client/hooks";
import { selectWorldSubjectPosition } from "client/store/world";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";

import { getScreenDirection, useLeaderPosition } from "./WinnerDirection.utils";

export function WinnerDirection() {
	const rem = useRem();
	// useViewport(); // force re-render on viewport change
	const leaderPosition = useLeaderPosition();
	const subjectPosition = useSelector(selectWorldSubjectPosition);

	const [positionX, positionXMotion] = useMotion(0.5);
	const [positionY, positionYMotion] = useMotion(0.5);
	const [rotation, rotationMotion] = useMotion(0);
	const [visible, visibleMotion] = useMotion(0);

	useEffect(() => {
		// warn(
		// 	`[COMPASS_DEBUG] subjectPos: ${subjectPosition ?? "none"}, leaderPos: ${leaderPosition ?? "none"}, refEqual: ${subjectPosition === leaderPosition}`,
		// );

		if (subjectPosition && leaderPosition && subjectPosition !== leaderPosition) {
			const dir = getScreenDirection(leaderPosition);
			if (dir) {
				positionXMotion.spring(dir.screenX);
				positionYMotion.spring(dir.screenY);
				rotationMotion.spring(dir.angle);
				visibleMotion.spring(1);
				return;
			}
		}

		visibleMotion.spring(0);
	}, [subjectPosition, leaderPosition]);

	return (
		<Group name="Compass">
			<uipadding
				PaddingTop={new UDim(0, rem(6))}
				PaddingBottom={new UDim(0, rem(6))}
				PaddingLeft={new UDim(0, rem(6))}
				PaddingRight={new UDim(0, rem(6))}
			/>

			<Group
				anchorPoint={new Vector2(0.5, 0.5)}
				size={new UDim2(0, rem(6), 0, rem(6))}
				position={composeBindings(positionX, positionY, (x, y) => UDim2.fromScale(x, y))}
			>
				<Group rotation={rotation}>
					<Image
						image={assets.ui.leader_pointer}
						imageTransparency={lerpBinding(visible, 1, 0)}
						anchorPoint={new Vector2(0.5, 0.5)}
						size={new UDim2(0, rem(1.5), 0, rem(1.5))}
						position={new UDim2(0.5, 0, 0, 0)}
					/>
				</Group>

				<Text
					text="👑"
					textSize={rem(3)}
					textTransparency={lerpBinding(visible, 1, 0)}
					size={new UDim2(1, 0, 1, 0)}
				/>
			</Group>
		</Group>
	);
}
