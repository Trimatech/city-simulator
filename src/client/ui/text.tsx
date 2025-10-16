import React from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";

import { FrameProps } from "./layout/frame";

export interface TextProps<T extends Instance = TextLabel> extends FrameProps<T> {
	name?: string;
	font?: Font;
	text?: string | React.Binding<string>;
	textColor?: Color3 | React.Binding<Color3>;
	textSize?: number | React.Binding<number>;
	textTransparency?: number | React.Binding<number>;
	textWrapped?: boolean | React.Binding<boolean>;
	textXAlignment?: React.InferEnumNames<Enum.TextXAlignment>;
	textYAlignment?: React.InferEnumNames<Enum.TextYAlignment>;
	textTruncate?: React.InferEnumNames<Enum.TextTruncate>;
	textScaled?: boolean | React.Binding<boolean>;
	textHeight?: number | React.Binding<number>;
	textAutoResize?: "X" | "Y" | "XY";
	automaticSize?: Enum.AutomaticSize | React.Binding<Enum.AutomaticSize>;
	richText?: boolean | React.Binding<boolean>;
	maxVisibleGraphemes?: number | React.Binding<number>;
	padding?: number;
	selectable?: boolean;
	lineHeight?: number;
}

export function Text(props: TextProps) {
	const rem = useRem();
	const { padding, name } = props;

	const paddingUdim = new UDim(0, rem(padding ?? 0));

	const hasTextConstraint = props.textSize !== undefined && props.textScaled;

	return (
		<textlabel
			key={name || "textlabel"}
			FontFace={props.font || fonts.robotoMono.regular}
			Text={props.text}
			TextColor3={props.textColor}
			TextSize={props.textSize ?? rem(1)}
			TextTransparency={props.textTransparency}
			TextWrapped={props.textWrapped}
			TextXAlignment={props.textXAlignment}
			TextYAlignment={props.textYAlignment}
			TextTruncate={props.textTruncate}
			TextScaled={props.textScaled}
			LineHeight={props.textHeight ?? props.lineHeight}
			RichText={props.richText}
			MaxVisibleGraphemes={props.maxVisibleGraphemes}
			Size={props.size}
			AutomaticSize={props.textAutoResize ?? props.automaticSize}
			Position={props.position}
			AnchorPoint={props.anchorPoint}
			BorderSizePixel={0}
			BackgroundColor3={props.backgroundColor}
			BackgroundTransparency={props.backgroundTransparency ?? 1}
			ClipsDescendants={props.clipsDescendants}
			Visible={props.visible}
			ZIndex={props.zIndex}
			LayoutOrder={props.layoutOrder}
			Change={props.change}
			Selectable={props.selectable}
			Event={props.event}
		>
			{props.children}
			{padding ? (
				<uipadding
					PaddingLeft={paddingUdim}
					PaddingRight={paddingUdim}
					PaddingTop={paddingUdim}
					PaddingBottom={paddingUdim}
				/>
			) : undefined}
			{hasTextConstraint && <uitextsizeconstraint MaxTextSize={props.textSize} />}

			{props.cornerRadius && <uicorner CornerRadius={props.cornerRadius} />}
		</textlabel>
	);
}
