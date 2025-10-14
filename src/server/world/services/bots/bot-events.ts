import { Signal } from "@rbxts/beacon";

export const botMove = new Signal<[id: string, waypoints: Vector2[]]>();
export const botStopped = new Signal<[id: string]>();
