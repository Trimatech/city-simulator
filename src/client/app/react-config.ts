import { RunService } from "@rbxts/services";

declare const _G: {
	__DEV__: boolean;
	__REACT_MICROPROFILER_LEVEL: number;
};

if (RunService.IsStudio()) {
	_G.__DEV__ = true;
	// Lowered from 10 to 0 to avoid "No active profile annotation" warnings
	// The level 10 was too aggressive and caused imbalanced profiling calls during render cycles
	_G.__REACT_MICROPROFILER_LEVEL = 0;
}
