import { createProducer } from "@rbxts/reflex";

export interface SimulationState {
	readonly population: number;
	readonly resDemand: number;
	readonly comDemand: number;
	readonly indDemand: number;
	readonly cityScore: number;
	readonly simSpeed: SimSpeed;
	readonly simYear: number;
	readonly simMonth: number;
	readonly isPaused: boolean;
	readonly cityClass: CityClass;
	readonly crimeRate: number;
	readonly pollutionRate: number;
	readonly landValueAvg: number;
}

const initialState: SimulationState = {
	population: 0,
	resDemand: 0,
	comDemand: 0,
	indDemand: 0,
	cityScore: 500,
	simSpeed: 1,
	simYear: 1900,
	simMonth: 0,
	isPaused: false,
	cityClass: "Village",
	crimeRate: 0,
	pollutionRate: 0,
	landValueAvg: 0,
};

export const simulationSlice = createProducer(initialState, {
	setPopulation: (state, population: number) => ({ ...state, population }),
	setDemand: (state, resDemand: number, comDemand: number, indDemand: number) => ({
		...state,
		resDemand,
		comDemand,
		indDemand,
	}),
	setCityScore: (state, cityScore: number) => ({ ...state, cityScore }),
	setSimSpeed: (state, simSpeed: SimSpeed) => ({ ...state, simSpeed, isPaused: simSpeed === 0 }),
	advanceDate: (state) => {
		const nextMonth = state.simMonth + 1;
		if (nextMonth >= 12) {
			return { ...state, simMonth: 0, simYear: state.simYear + 1 };
		}
		return { ...state, simMonth: nextMonth };
	},
	setCityClass: (state, cityClass: CityClass) => ({ ...state, cityClass }),
	setCrimeRate: (state, crimeRate: number) => ({ ...state, crimeRate }),
	setPollutionRate: (state, pollutionRate: number) => ({ ...state, pollutionRate }),
	setLandValueAvg: (state, landValueAvg: number) => ({ ...state, landValueAvg }),
	resetSimulation: () => initialState,
});
