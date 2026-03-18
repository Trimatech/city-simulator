import React from "@rbxts/react";
import { ReflexProvider } from "@rbxts/react-reflex";
import type { RemProviderProps } from "@rbxts-ui/rem";
import { store } from "client/store";
import { RemProvider } from "client/ui/rem/RemProvider";

export function RootProvider({ baseRem, children }: RemProviderProps) {
	return (
		<ReflexProvider producer={store}>
			<RemProvider baseRem={baseRem}>{children}</RemProvider>
		</ReflexProvider>
	);
}
