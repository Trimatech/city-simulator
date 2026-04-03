import { TILE_SIZE } from "shared/constants/core";
import {
	AIRPORTBASE,
	COALBASE,
	COMBASE,
	CZB,
	FIREBASE,
	FIRESTBASE,
	FLOOD,
	HOUSE,
	HPOWER,
	HRAIL,
	INDBASE,
	IZB,
	LASTFIRE,
	LASTFLOOD,
	LASTPOWER,
	LASTRAIL,
	LASTRIVEDGE,
	LASTROAD,
	LASTTREE,
	LOMASK,
	NUCLEARBASE,
	POLICESTBASE,
	PORTBASE,
	RESBASE,
	RIVER,
	ROADBASE,
	RUBBLE,
	RZB,
	STADIUMBASE,
	TREEBASE,
	ZONEBIT,
} from "shared/simulation/tile-values";

export interface TileMeshProps {
	readonly color: Color3;
	readonly height: number;
	readonly material: Enum.Material;
	readonly transparency: number;
	/** If set, this tile is a building placeholder and should show a label. */
	readonly buildingLabel?: string;
	/** If true, this tile is a zone center (used for label positioning). */
	readonly isZoneCenter?: boolean;
}

const GROUND_HEIGHT = 0.2;

const DEFAULT_PROPS: TileMeshProps = {
	color: Color3.fromRGB(139, 119, 101), // brown dirt
	height: GROUND_HEIGHT,
	material: Enum.Material.Sand,
	transparency: 0,
};

/**
 * Maps a tile type (low 10 bits) to visual properties for Part rendering.
 * This is the single lookup table that Phase 11 replaces with real models.
 */
export function getTileMeshProps(tileValue: number): TileMeshProps {
	const t = tileValue & LOMASK;
	const isCenter = (tileValue & ZONEBIT) !== 0;

	// Water
	if (t >= RIVER && t <= LASTRIVEDGE) {
		return {
			color: Color3.fromRGB(64, 128, 200),
			height: 0.1,
			material: Enum.Material.SmoothPlastic,
			transparency: 0.3,
		};
	}

	// Trees
	if (t >= TREEBASE && t <= LASTTREE) {
		return {
			color: Color3.fromRGB(34, 139, 34),
			height: 1.5,
			material: Enum.Material.Grass,
			transparency: 0,
		};
	}

	// Rubble
	if (t >= RUBBLE && t <= RUBBLE + 3) {
		return {
			color: Color3.fromRGB(128, 128, 128),
			height: 0.5,
			material: Enum.Material.Slate,
			transparency: 0,
		};
	}

	// Fire
	if (t >= FIREBASE && t <= LASTFIRE) {
		return {
			color: Color3.fromRGB(255, 69, 0),
			height: 2,
			material: Enum.Material.Neon,
			transparency: 0,
		};
	}

	// Flood
	if (t >= FLOOD && t <= LASTFLOOD) {
		return {
			color: Color3.fromRGB(70, 130, 180),
			height: 0.3,
			material: Enum.Material.SmoothPlastic,
			transparency: 0.2,
		};
	}

	// Roads
	if (t >= ROADBASE && t <= LASTROAD) {
		return {
			color: Color3.fromRGB(80, 80, 80),
			height: 0.3,
			material: Enum.Material.Asphalt,
			transparency: 0,
		};
	}

	// Power lines
	if (t >= HPOWER && t <= LASTPOWER) {
		return {
			color: Color3.fromRGB(255, 235, 59),
			height: 1.5,
			material: Enum.Material.Metal,
			transparency: 0,
		};
	}

	// Rail
	if (t >= HRAIL && t <= LASTRAIL) {
		return {
			color: Color3.fromRGB(121, 85, 72),
			height: 0.4,
			material: Enum.Material.Metal,
			transparency: 0,
		};
	}

	// Residential zones — height based on development level
	if (t >= RESBASE && t < COMBASE) {
		const level = t >= RZB ? math.min(math.floor((t - RZB) / 9), 8) : t >= HOUSE ? 1 : 0;
		const levelLabel = level === 0 ? "Residential" : `Residential Lv.${level}`;
		return {
			color: Color3.fromRGB(76, 175, 80),
			height: math.max(1, level * TILE_SIZE),
			material: Enum.Material.SmoothPlastic,
			transparency: 0,
			buildingLabel: isCenter ? levelLabel : undefined,
			isZoneCenter: isCenter,
		};
	}

	// Commercial zones — height based on development level
	if (t >= COMBASE && t < INDBASE) {
		const level = t >= CZB ? math.min(math.floor((t - CZB) / 9), 8) : 0;
		const levelLabel = level === 0 ? "Commercial" : `Commercial Lv.${level}`;
		return {
			color: Color3.fromRGB(33, 150, 243),
			height: math.max(1, level * TILE_SIZE),
			material: Enum.Material.SmoothPlastic,
			transparency: 0,
			buildingLabel: isCenter ? levelLabel : undefined,
			isZoneCenter: isCenter,
		};
	}

	// Industrial zones — height based on development level
	if (t >= INDBASE && t < PORTBASE) {
		const level = t >= IZB ? math.min(math.floor((t - IZB) / 9), 8) : 0;
		const levelLabel = level === 0 ? "Industrial" : `Industrial Lv.${level}`;
		return {
			color: Color3.fromRGB(255, 193, 7),
			height: math.max(1, level * TILE_SIZE),
			material: Enum.Material.SmoothPlastic,
			transparency: 0,
			buildingLabel: isCenter ? levelLabel : undefined,
			isZoneCenter: isCenter,
		};
	}

	// Seaport
	if (t >= PORTBASE && t < AIRPORTBASE) {
		return {
			color: Color3.fromRGB(0, 150, 136),
			height: 3,
			material: Enum.Material.SmoothPlastic,
			transparency: 0,
			buildingLabel: isCenter ? "Seaport" : undefined,
			isZoneCenter: isCenter,
		};
	}

	// Airport
	if (t >= AIRPORTBASE && t < COALBASE) {
		return {
			color: Color3.fromRGB(158, 158, 158),
			height: 2,
			material: Enum.Material.Concrete,
			transparency: 0,
			buildingLabel: isCenter ? "Airport" : undefined,
			isZoneCenter: isCenter,
		};
	}

	// Coal power plant
	if (t >= COALBASE && t < FIRESTBASE) {
		return {
			color: Color3.fromRGB(66, 66, 66),
			height: 6,
			material: Enum.Material.Metal,
			transparency: 0,
			buildingLabel: isCenter ? "Coal Power" : undefined,
			isZoneCenter: isCenter,
		};
	}

	// Fire station
	if (t >= FIRESTBASE && t < POLICESTBASE) {
		return {
			color: Color3.fromRGB(244, 67, 54),
			height: 3,
			material: Enum.Material.SmoothPlastic,
			transparency: 0,
			buildingLabel: isCenter ? "Fire Dept" : undefined,
			isZoneCenter: isCenter,
		};
	}

	// Police station
	if (t >= POLICESTBASE && t < STADIUMBASE) {
		return {
			color: Color3.fromRGB(63, 81, 181),
			height: 3,
			material: Enum.Material.SmoothPlastic,
			transparency: 0,
			buildingLabel: isCenter ? "Police Dept" : undefined,
			isZoneCenter: isCenter,
		};
	}

	// Stadium
	if (t >= STADIUMBASE && t < NUCLEARBASE) {
		return {
			color: Color3.fromRGB(156, 39, 176),
			height: 5,
			material: Enum.Material.SmoothPlastic,
			transparency: 0,
			buildingLabel: isCenter ? "Stadium" : undefined,
			isZoneCenter: isCenter,
		};
	}

	// Nuclear power
	if (t >= NUCLEARBASE) {
		return {
			color: Color3.fromRGB(255, 235, 59),
			height: 8,
			material: Enum.Material.Neon,
			transparency: 0,
			buildingLabel: isCenter ? "Nuclear Power" : undefined,
			isZoneCenter: isCenter,
		};
	}

	// Default: dirt
	return DEFAULT_PROPS;
}
