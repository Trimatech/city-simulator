/** Tool types available for city building */
type CityTool =
	| "residential"
	| "commercial"
	| "industrial"
	| "road"
	| "rail"
	| "powerline"
	| "bulldoze"
	| "fire_station"
	| "police_station"
	| "coal_power"
	| "nuclear_power"
	| "airport"
	| "seaport"
	| "stadium"
	| "park";

/** Simulation speed settings */
type SimSpeed = 0 | 1 | 2 | 3; // paused, slow, medium, fast

/** City classification based on population */
type CityClass = "Village" | "Town" | "City" | "Capital" | "Metropolis" | "Megalopolis";
