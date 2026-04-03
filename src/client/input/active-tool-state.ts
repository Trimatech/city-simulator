/** Simple shared mutable state for active tool across components. */

let activeTool: CityTool = "residential";
const listeners: ((tool: CityTool) => void)[] = [];

export function getActiveTool(): CityTool {
	return activeTool;
}

export function setActiveTool(tool: CityTool): void {
	activeTool = tool;
	for (const listener of listeners) {
		listener(tool);
	}
}

export function onActiveToolChanged(callback: (tool: CityTool) => void): () => void {
	listeners.push(callback);
	return () => {
		const idx = listeners.indexOf(callback);
		if (idx !== -1) listeners.remove(idx);
	};
}
