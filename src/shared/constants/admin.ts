import { RunService } from "@rbxts/services";

import { USER_ID } from "./core";

export const ADMIN_USER_IDS = new ReadonlySet([
	2290760287, // @MayGoRblx
]);

export const IS_ADMIN = ADMIN_USER_IDS.has(USER_ID) || RunService.IsStudio();
