import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useStore } from "client/hooks";
import { selectCurrentPage } from "client/store/menu";
import { selectHasLocalSoldier } from "shared/store/soldiers";

import { Home } from "./home";
import { MenuContainer } from "./menu-container";
import { MenuVignette } from "./menu-vignette";
import { Skins } from "./skins";
import { Support } from "./support";

const HOME_PAGE = "home";
const SUPPORT_PAGE = "support";
const SKINS_PAGE = "skins";

export function Menu() {
	const store = useStore();

	const spawned = useSelector(selectHasLocalSoldier);

	const currentPage = useSelector(selectCurrentPage);

	const showVignette = currentPage !== HOME_PAGE;

	useEffect(() => {
		store.setMenuOpen(!spawned);
	}, [spawned]);

	return (
		<>
			{showVignette && <MenuVignette />}

			{/* <MenuContainer>
				<Navigation />
			</MenuContainer> */}

			<MenuContainer page={HOME_PAGE}>
				<Home />
			</MenuContainer>

			<MenuContainer page={SUPPORT_PAGE}>
				<Support />
			</MenuContainer>

			<MenuContainer page={SKINS_PAGE}>
				<Skins />
			</MenuContainer>
		</>
	);
}
