import React, { useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { PartViewer } from "client/components/partViewer/PartViewer";
import { useMotion, useRem } from "client/hooks";
import { CanvasGroup } from "client/ui/canvas-group";
import { Outline } from "client/ui/outline";
import { WallSkin } from "shared/constants/skins";
import { loadSharedCloneByPath } from "shared/SharedModelManager";
import { brighten } from "shared/utils/color-utils";

interface SkinThumbnailProps {
	readonly skin: WallSkin;
	readonly active: boolean;
	readonly transparency: React.Binding<number>;
}

export function SkinThumbnail({ skin, active, transparency }: SkinThumbnailProps) {
	const rem = useRem();
	const [offset, offsetMotion] = useMotion(new UDim());
	const [selectedParts, setSelectedParts] = useState<Instance[]>();
	const createdPartRef = useRef<Instance>();
	const loadIdRef = useRef(0);

	useEffect(() => {
		offsetMotion.spring(active ? new UDim(0, rem(-0.5)) : new UDim(0, rem(2)));
	}, [active, rem]);

	useEffect(() => {
		// cancel previous load
		loadIdRef.current += 1;
		const myLoadId = loadIdRef.current;

		// cleanup previously created transient part
		if (createdPartRef.current && createdPartRef.current.Parent === undefined) {
			createdPartRef.current.Destroy();
			createdPartRef.current = undefined;
		}

		// reset while loading
		setSelectedParts(undefined);

		(async () => {
			if (skin.type === "tint") {
				const part = new Instance("Part");
				part.Name = "SkinPreview_Part";
				part.Size = new Vector3(6, 12.1, 1);
				part.Color = skin.tint;
				part.Material = Enum.Material.SmoothPlastic;
				part.TopSurface = Enum.SurfaceType.Smooth;
				part.BottomSurface = Enum.SurfaceType.Smooth;
				createdPartRef.current = part;

				// guard if superseded
				if (myLoadId !== loadIdRef.current) {
					part.Destroy();
					return;
				}
				setSelectedParts([part]);
				return;
			}

			// part skin
			const modelOrPart = await loadSharedCloneByPath<Instance>(skin.modelPath);
			// guard if superseded
			if (myLoadId !== loadIdRef.current) {
				modelOrPart.Destroy();
				return;
			}
			setSelectedParts([modelOrPart]);
		})();

		return () => {
			// destroy transient created part on unmount/change
			if (createdPartRef.current && createdPartRef.current.Parent === undefined) {
				createdPartRef.current.Destroy();
				createdPartRef.current = undefined;
			}
		};
	}, [skin]);

	const viewerSize = useMemo(() => new UDim2(1, 0, 1, 0), []);

	const cornerRadius = useMemo(() => new UDim(0, rem(2.5)), [rem]);

	return (
		<CanvasGroup
			backgroundTransparency={0.2}
			cornerRadius={cornerRadius}
			groupTransparency={transparency}
			size={new UDim2(1, 0, 1, 0)}
			backgroundColor={brighten(skin.tint, 2)}
		>
			<Outline
				cornerRadius={cornerRadius}
				innerTransparency={0}
				innerThickness={rem(1)}
				innerColor={skin.tint}
				outerTransparency={1}
			/>
			<PartViewer
				selectedParts={selectedParts}
				size={viewerSize}
				noBorder
				showGround={false}
				orbitEnabled
				orbitYawDeg={30}
				orbitPitchDeg={20}
				orbitDistanceMultiplier={1.1}
				isLoading={selectedParts === undefined}
			/>
		</CanvasGroup>
	);
}
