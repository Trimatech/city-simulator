import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useStore } from "client/hooks";
import { selectHasLocalSoldier } from "shared/store/soldiers";

import { Home } from "./home";
import { MenuContainer } from "./menu-container";
import { MenuVignette } from "./menu-vignette";
import { Navigation } from "./navigation";
import { Skins } from "./skins";
import { Support } from "./support";

export function Menu() {
	const store = useStore();
	const spawned = useSelector(selectHasLocalSoldier);

	useEffect(() => {
		store.setMenuOpen(!spawned);
	}, [spawned]);

	return (
		<>
			<MenuContainer>
				<Navigation />
			</MenuContainer>

			<MenuContainer page="home">
				<Home />
			</MenuContainer>

			<MenuContainer page="support">
				<MenuVignette />
				<Support />
			</MenuContainer>

			<MenuContainer page="skins">
				<MenuVignette />
				<Skins />
			</MenuContainer>
		</>
	);
}
