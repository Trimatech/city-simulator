// ── Bit flags (upper 6 bits of 16-bit tile value) ───────────────────
export const BULLBIT = 0x0400; // bit 10 — bulldozable
export const BURNBIT = 0x0800; // bit 11 — can burn
export const CONDBIT = 0x1000; // bit 12 — conducts power
export const POWERBIT = 0x2000; // bit 13 — currently powered
export const ANIMBIT = 0x4000; // bit 14 — animated
export const ZONEBIT = 0x8000; // bit 15 — zone center

export const LOMASK = 0x03ff; // bits 0-9: tile type (0-1023)
export const ALLBITS = BULLBIT | BURNBIT | CONDBIT | POWERBIT | ANIMBIT | ZONEBIT;
export const BLBNCNBIT = BULLBIT | BURNBIT | CONDBIT;

// ── Tile type indices (low 10 bits) ─────────────────────────────────
export const DIRT = 0;
export const RIVER = 2;
export const REDGE = 3;
export const CHANNEL = 4;
export const FIRSTRIVEDGE = 5;
export const LASTRIVEDGE = 20;
export const TREEBASE = 21;
export const LASTTREE = 39;
export const WOODS = 37;
export const WOODS2 = 38;
export const WOODS3 = LASTTREE;
export const WOODS4 = 40;
export const WOODS5 = 41;
export const RUBBLE = 44;
export const LASTRUBBLE = 47;
export const FLOOD = 48;
export const LASTFLOOD = 51;
export const RADTILE = 52;
export const FIRE = 56;
export const FIREBASE = 56;
export const LASTFIRE = 63;
export const ROADBASE = 64;
export const HBRIDGE = 64;
export const VBRIDGE = 65;
export const ROADS = 66;
export const ROADS2 = 67;
export const ROADS3 = 68;
export const ROADS4 = 69;
export const ROADS5 = 70;
export const ROADS6 = 71;
export const ROADS7 = 72;
export const ROADS8 = 73;
export const ROADS9 = 74;
export const ROADS10 = 75;
export const INTERSECTION = 76;
export const HROADPOWER = 77;
export const VROADPOWER = 78;
export const BRWH = 79;
export const LTRFBASE = 80;
export const BRWV = 95;
export const BRWXXX1 = 111;
export const BRWXXX2 = 127;
export const BRWXXX3 = 143;
export const HTRFBASE = 144;
export const BRWXXX4 = 159;
export const BRWXXX5 = 175;
export const BRWXXX6 = 191;
export const LASTROAD = 206;
export const BRWXXX7 = 207;
export const POWERBASE = 208;
export const HPOWER = 208;
export const VPOWER = 209;
export const LHPOWER = 210;
export const LVPOWER = 211;
export const LVPOWER2 = 212;
export const LVPOWER3 = 213;
export const LVPOWER4 = 214;
export const LVPOWER5 = 215;
export const LVPOWER6 = 216;
export const LVPOWER7 = 217;
export const LVPOWER8 = 218;
export const LVPOWER9 = 219;
export const LVPOWER10 = 220;
export const RAILHPOWERV = 221;
export const RAILVPOWERH = 222;
export const LASTPOWER = 222;
export const UNUSED_TRASH1 = 223;
export const RAILBASE = 224;
export const HRAIL = 224;
export const VRAIL = 225;
export const LHRAIL = 226;
export const LVRAIL = 227;
export const LVRAIL2 = 228;
export const LVRAIL3 = 229;
export const LVRAIL4 = 230;
export const LVRAIL5 = 231;
export const LVRAIL6 = 232;
export const LVRAIL7 = 233;
export const LVRAIL8 = 234;
export const LVRAIL9 = 235;
export const LVRAIL10 = 236;
export const HRAILROAD = 237;
export const VRAILROAD = 238;
export const LASTRAIL = 238;
export const UNUSED_TRASH2 = 239;
export const RESBASE = 240;
export const FREEZ = 244;
export const HOUSE = 249;
export const LHTHR = 249;
export const HHTHR = 260;
export const RZB = 265;
export const HOSPITAL = 409;
export const CHURCH = 418;
export const COMBASE = 423;
export const COMCLR = 427;
export const CZB = 436;
export const INDBASE = 612;
export const INDCLR = 616;
export const LASTIND = 620;
export const IZB = 625;
export const PORTBASE = 693;
export const PORT = 698;
export const LASTPORT = 708;
export const AIRPORTBASE = 709;
export const RADAR = 711;
export const AIRPORT = 716;
export const COALBASE = 745;
export const POWERPLANT = 750;
export const LASTPOWERPLANT = 760;
export const FIRESTBASE = 761;
export const FIRESTATION = 765;
export const POLICESTBASE = 770;
export const POLICESTATION = 774;
export const STADIUMBASE = 779;
export const STADIUM = 784;
export const FULLSTADIUM = 800;
export const NUCLEARBASE = 811;
export const NUCLEAR = 816;
export const LASTZONE = 826;
export const LIGHTNINGBOLT = 827;
export const HBRDG0 = 828;
export const HBRDG1 = 829;
export const HBRDG2 = 830;
export const HBRDG3 = 831;
export const VBRDG0 = 832;
export const VBRDG1 = 833;
export const VBRDG2 = 834;
export const VBRDG3 = 835;
export const UNUSED_TRASH4 = 836;
export const UNUSED_TRASH5 = 837;
export const TINYEXP = 860;
export const SOMETINYEXP = 864;
export const LASTTINYEXP = 867;
export const COALSMOKE1 = 916;
export const COALSMOKE2 = 920;
export const COALSMOKE3 = 924;
export const COALSMOKE4 = 928;
export const FOOTBALLGAME1 = 932;
export const FOOTBALLGAME2 = 940;
export const VBRDG4 = 948;
export const VBRDG5 = 949;
export const VBRDG6 = 950;
export const VBRDG7 = 951;
export const TILE_COUNT = 960;

// ── Helper functions ────────────────────────────────────────────────

/** Extract the low 10-bit tile type, stripping flags */
export function tileType(tile: number): number {
	return tile & LOMASK;
}

/** Check if a tile has the zone-center flag */
export function isZoneCenter(tile: number): boolean {
	return (tile & ZONEBIT) !== 0;
}

/** Check if a tile conducts power */
export function isConductive(tile: number): boolean {
	return (tile & CONDBIT) !== 0;
}

/** Check if a tile is currently powered */
export function isPowered(tile: number): boolean {
	return (tile & POWERBIT) !== 0;
}

/** Check if a tile can burn */
export function isCombustible(tile: number): boolean {
	return (tile & BURNBIT) !== 0;
}

/** Check if a tile can be bulldozed */
export function isBulldozable(tile: number): boolean {
	return (tile & BULLBIT) !== 0;
}

/** Check if a tile is animated */
export function isAnimated(tile: number): boolean {
	return (tile & ANIMBIT) !== 0;
}

/** Check if a tile type is a residential zone center */
export function isResidentialZone(tileVal: number): boolean {
	const t = tileType(tileVal);
	return t >= RESBASE && t <= HOSPITAL - 1;
}

/** Check if a tile type is a commercial zone center */
export function isCommercialZone(tileVal: number): boolean {
	const t = tileType(tileVal);
	return t >= COMBASE && t <= INDBASE - 1;
}

/** Check if a tile type is an industrial zone center */
export function isIndustrialZone(tileVal: number): boolean {
	const t = tileType(tileVal);
	return t >= INDBASE && t <= PORTBASE - 1;
}

/** Check if a tile type is any road tile */
export function isRoad(tileVal: number): boolean {
	const t = tileType(tileVal);
	return t >= ROADBASE && t <= LASTROAD;
}

/** Check if a tile type is any power line tile */
export function isPowerLine(tileVal: number): boolean {
	const t = tileType(tileVal);
	return t >= POWERBASE && t <= LASTPOWER;
}

/** Check if a tile type is any rail tile */
export function isRail(tileVal: number): boolean {
	const t = tileType(tileVal);
	return t >= RAILBASE && t <= LASTRAIL;
}

/** Check if a tile is water */
export function isWater(tileVal: number): boolean {
	const t = tileType(tileVal);
	return t >= RIVER && t <= LASTRIVEDGE;
}

/** Check if a tile is a tree */
export function isTree(tileVal: number): boolean {
	const t = tileType(tileVal);
	return t >= TREEBASE && t <= LASTTREE;
}

/** Check if a tile is fire */
export function isFire(tileVal: number): boolean {
	const t = tileType(tileVal);
	return t >= FIREBASE && t <= LASTFIRE;
}

/** Check if a tile is flood */
export function isFlood(tileVal: number): boolean {
	const t = tileType(tileVal);
	return t >= FLOOD && t <= LASTFLOOD;
}

/** Check if a tile is rubble */
export function isRubble(tileVal: number): boolean {
	const t = tileType(tileVal);
	return t >= RUBBLE && t <= LASTRUBBLE;
}
