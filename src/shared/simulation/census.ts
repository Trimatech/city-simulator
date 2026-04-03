/**
 * Census — tracks population and zone counts during map scanning.
 * Port of micropolisJS census.js for roblox-ts.
 */

const HISTORY_LENGTH_10 = 120; // 10-year history (120 entries)
const HISTORY_LENGTH_120 = 120; // 120-year history (120 entries)

export interface CensusData {
	// Zone power tracking
	poweredZoneCount: number;
	unpoweredZoneCount: number;

	// Raw population values (accumulated during scan)
	resPop: number;
	comPop: number;
	indPop: number;

	// Zone population (number of developed zones)
	resZonePop: number;
	comZonePop: number;
	indZonePop: number;

	// Special building counts
	hospitalPop: number;
	policeStationPop: number;
	fireStationPop: number;
	stadiumPop: number;
	coalPowerPop: number;
	nuclearPowerPop: number;
	seaportPop: number;
	airportPop: number;

	// Infrastructure totals
	roadTotal: number;
	railTotal: number;

	// Fire coverage count
	firePop: number;

	// Derived totals
	totalPop: number;

	// Average overlay values (computed after scan)
	crimeAverage: number;
	pollutionAverage: number;
	landValueAverage: number;

	// Hospital need indicator (-1, 0, or 1)
	needHospital: number;

	// RCI history arrays for graphs
	resHist10: number[];
	comHist10: number[];
	indHist10: number[];
	resHist120: number[];
	comHist120: number[];
	indHist120: number[];

	// Smoothed ramp values for crime/pollution indicators
	crimeRamp: number;
	pollutionRamp: number;
}

function makeHistoryArray(len: number): number[] {
	const arr: number[] = [];
	for (let i = 0; i < len; i++) {
		arr[i] = 0;
	}
	return arr;
}

/** Create a fresh census with all values zeroed. */
export function createCensus(): CensusData {
	return {
		poweredZoneCount: 0,
		unpoweredZoneCount: 0,
		resPop: 0,
		comPop: 0,
		indPop: 0,
		resZonePop: 0,
		comZonePop: 0,
		indZonePop: 0,
		hospitalPop: 0,
		policeStationPop: 0,
		fireStationPop: 0,
		stadiumPop: 0,
		coalPowerPop: 0,
		nuclearPowerPop: 0,
		seaportPop: 0,
		airportPop: 0,
		roadTotal: 0,
		railTotal: 0,
		firePop: 0,
		totalPop: 0,
		crimeAverage: 0,
		pollutionAverage: 0,
		landValueAverage: 0,
		needHospital: 0,
		resHist10: makeHistoryArray(HISTORY_LENGTH_10),
		comHist10: makeHistoryArray(HISTORY_LENGTH_10),
		indHist10: makeHistoryArray(HISTORY_LENGTH_10),
		resHist120: makeHistoryArray(HISTORY_LENGTH_120),
		comHist120: makeHistoryArray(HISTORY_LENGTH_120),
		indHist120: makeHistoryArray(HISTORY_LENGTH_120),
		crimeRamp: 0,
		pollutionRamp: 0,
	};
}

/**
 * Clear per-scan counters to zero before a new map scan.
 * History arrays and ramp values are preserved.
 */
export function clearCensus(census: CensusData): void {
	census.poweredZoneCount = 0;
	census.unpoweredZoneCount = 0;
	census.resPop = 0;
	census.comPop = 0;
	census.indPop = 0;
	census.resZonePop = 0;
	census.comZonePop = 0;
	census.indZonePop = 0;
	census.hospitalPop = 0;
	census.policeStationPop = 0;
	census.fireStationPop = 0;
	census.stadiumPop = 0;
	census.coalPowerPop = 0;
	census.nuclearPowerPop = 0;
	census.seaportPop = 0;
	census.airportPop = 0;
	census.roadTotal = 0;
	census.railTotal = 0;
	census.firePop = 0;
	census.totalPop = 0;
	census.crimeAverage = 0;
	census.pollutionAverage = 0;
	census.landValueAverage = 0;
}

/**
 * Take a 10-year census snapshot. Called every ~10 simulation years.
 * Shifts history arrays and records current populations.
 * Also updates needHospital, crimeRamp, pollutionRamp.
 */
export function take10Census(census: CensusData, cashFlow: number): void {
	// Shift 10-year history arrays right (newest at index 0)
	for (let i = HISTORY_LENGTH_10 - 1; i > 0; i--) {
		census.resHist10[i] = census.resHist10[i - 1];
		census.comHist10[i] = census.comHist10[i - 1];
		census.indHist10[i] = census.indHist10[i - 1];
	}

	census.resHist10[0] = census.resPop;
	census.comHist10[0] = census.comPop;
	census.indHist10[0] = census.indPop;

	// Compute hospital need: compare hospital capacity vs residential pop
	// In Micropolis, each hospital serves ~256 residents
	const hospitalCapacity = census.hospitalPop * 256;
	if (census.resPop > hospitalCapacity) {
		census.needHospital = 1;
	} else if (census.resPop < hospitalCapacity - 256) {
		census.needHospital = -1;
	} else {
		census.needHospital = 0;
	}

	// Smooth crime ramp towards crime average
	if (census.crimeAverage > census.crimeRamp) {
		census.crimeRamp = math.min(census.crimeRamp + 1, census.crimeAverage);
	} else if (census.crimeAverage < census.crimeRamp) {
		census.crimeRamp = math.max(census.crimeRamp - 1, census.crimeAverage);
	}

	// Smooth pollution ramp towards pollution average
	if (census.pollutionAverage > census.pollutionRamp) {
		census.pollutionRamp = math.min(census.pollutionRamp + 1, census.pollutionAverage);
	} else if (census.pollutionAverage < census.pollutionRamp) {
		census.pollutionRamp = math.max(census.pollutionRamp - 1, census.pollutionAverage);
	}
}

/**
 * Take a 120-year census snapshot. Called every ~120 simulation years.
 * Shifts 120-year history arrays and records current populations.
 */
export function take120Census(census: CensusData): void {
	for (let i = HISTORY_LENGTH_120 - 1; i > 0; i--) {
		census.resHist120[i] = census.resHist120[i - 1];
		census.comHist120[i] = census.comHist120[i - 1];
		census.indHist120[i] = census.indHist120[i - 1];
	}

	census.resHist120[0] = census.resPop;
	census.comHist120[0] = census.comPop;
	census.indHist120[0] = census.indPop;
}
