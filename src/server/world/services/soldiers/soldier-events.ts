import { Signal } from "@rbxts/beacon";

export const soldierIsInsideChanged = new Signal<[id: string, isInside: boolean]>();
