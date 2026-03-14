import React from "@rbxts/react";
import { ReflexProvider } from "@rbxts/react-reflex";
import type { RemProviderProps } from "@rbxts-ui/rem";
import { RemProvider } from "@rbxts-ui/rem";
import { store } from "client/store";

export function RootProvider({ baseRem, remOverride, children }: RemProviderProps) {
	return (
		<ReflexProvider producer={store}>
			<RemProvider baseRem={baseRem} remOverride={remOverride}>
				{children}
			</RemProvider>
		</ReflexProvider>
	);
}
