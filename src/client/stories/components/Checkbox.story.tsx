import { hoarcekat } from "@rbxts/pretty-react-hooks";
import React, { useState } from "@rbxts/react";
import { Checkbox } from "client/components/ui/Checkbox";

export = hoarcekat(() => {
	const [checked1, setChecked1] = useState(false);
	const [checked2, setChecked2] = useState(true);
	const [checked3, setChecked3] = useState(false);

	return (
		<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
			<uilistlayout
				Padding={new UDim(0, 16)}
				FillDirection="Vertical"
				HorizontalAlignment="Center"
				VerticalAlignment="Center"
			/>

			<Checkbox checked={checked1} onChecked={setChecked1} text="Interactive Checkbox" />

			<Checkbox checked={checked2} onChecked={setChecked2} text="Large Checkbox" variant="large" />

			<Checkbox checked={checked3} onChecked={setChecked3} text="Disabled Checkbox" disabled={true} />
		</frame>
	);
});
