import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { RootProvider } from "client/providers/root-provider";
import { MainButton, ShopButtonText } from "client/ui/MainButton";
import { palette } from "shared/constants/palette";

import { ImpactOverlay, ImpactOverlayTrigger } from "./ImpactOverlay";

const TRIGGER_BUTTONS: ReadonlyArray<{
	readonly kind: ImpactOverlayTrigger;
	readonly label: string;
}> = [
	{ kind: "death", label: "Trigger Death" },
	{ kind: "carpet", label: "Trigger Carpet" },
	{ kind: "nuke", label: "Trigger Nuke" },
];

function ImpactOverlayStoryContent() {
	const [previewTrigger, setPreviewTrigger] = React.useState<{
		readonly id: number;
		readonly kind: ImpactOverlayTrigger;
	}>();

	const triggerImpact = (kind: ImpactOverlayTrigger) => {
		setPreviewTrigger((current) => ({
			id: (current?.id ?? 0) + 1,
			kind,
		}));
	};

	return (
		<RootProvider>
			<frame BackgroundColor3={Color3.fromRGB(17, 22, 34)} Size={new UDim2(1, 0, 1, 0)}>
				<uigradient
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(33, 42, 64)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(12, 15, 24)),
						])
					}
					Rotation={90}
				/>

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Position={new UDim2(0.5, 0, 0.5, 0)}
					Size={new UDim2(0, 600, 0, 220)}
					ZIndex={100}
				>
					<uilistlayout
						FillDirection={Enum.FillDirection.Vertical}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						VerticalAlignment={Enum.VerticalAlignment.Center}
						Padding={new UDim(0, 16)}
					/>

					<textlabel
						BackgroundTransparency={1}
						Font={Enum.Font.GothamBold}
						Size={new UDim2(1, 0, 0, 40)}
						Text="Impact Overlay Preview"
						TextColor3={palette.white}
						TextScaled={true}
						ZIndex={100}
					/>

					<textlabel
						BackgroundTransparency={1}
						Font={Enum.Font.Gotham}
						Size={new UDim2(1, 0, 0, 28)}
						Text="Trigger every overlay flash from one place."
						TextColor3={Color3.fromRGB(208, 219, 255)}
						TextScaled={true}
						ZIndex={100}
					/>

					<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 72)} ZIndex={100}>
						<uilistlayout
							FillDirection={Enum.FillDirection.Horizontal}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							VerticalAlignment={Enum.VerticalAlignment.Center}
							Padding={new UDim(0, 12)}
						/>

						{TRIGGER_BUTTONS.map(({ kind, label }) => (
							<MainButton key={kind} fitContent onClick={() => triggerImpact(kind)}>
								<ShopButtonText text={label} />
							</MainButton>
						))}
					</frame>
				</frame>

				<ImpactOverlay previewTrigger={previewTrigger} />
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => <ImpactOverlayStoryContent />,
};

export = story;
