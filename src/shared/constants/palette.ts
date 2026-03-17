import Object from "@rbxts/object-utils";

/**
 * Catppuccin Mocha Accents
 * @see https://github.com/catppuccin/catppuccin
 */
export const accents = {
	rosewater: Color3.fromRGB(245, 224, 220),
	flamingo: Color3.fromRGB(242, 205, 205),
	pink: Color3.fromRGB(245, 194, 231),
	mauve: Color3.fromRGB(203, 166, 247),
	red: Color3.fromRGB(243, 139, 168),
	maroon: Color3.fromRGB(235, 160, 172),
	peach: Color3.fromRGB(250, 179, 135),
	yellow: Color3.fromRGB(249, 226, 175),
	green: Color3.fromRGB(166, 227, 161),
	teal: Color3.fromRGB(148, 226, 213),
	sky: Color3.fromRGB(137, 220, 235),
	sapphire: Color3.fromRGB(116, 199, 236),
	blue: Color3.fromRGB(137, 180, 250),
	lavender: Color3.fromRGB(180, 190, 254),
} as const;

/**
 * Catppuccin Latte Accents (prefixed)
 */
export const accentsLatte = {
	latte_rosewater: Color3.fromRGB(220, 138, 120),
	latte_flamingo: Color3.fromRGB(221, 120, 120),
	latte_pink: Color3.fromRGB(234, 118, 203),
	latte_mauve: Color3.fromRGB(136, 57, 239),
	latte_red: Color3.fromRGB(210, 15, 57),
	latte_maroon: Color3.fromRGB(230, 69, 83),
	latte_peach: Color3.fromRGB(254, 100, 11),
	latte_yellow: Color3.fromRGB(223, 142, 29),
	latte_green: Color3.fromRGB(64, 160, 43),
	latte_teal: Color3.fromRGB(23, 146, 153),
	latte_sky: Color3.fromRGB(4, 165, 229),
	latte_sapphire: Color3.fromRGB(32, 159, 181),
	latte_blue: Color3.fromRGB(30, 102, 245),
	latte_lavender: Color3.fromRGB(114, 135, 253),
} as const;

/**
 * Catppuccin Mocha Neutrals
 * @see https://github.com/catppuccin/catppuccin
 */
export const neutrals = {
	text: Color3.fromRGB(205, 214, 244),
	subtext1: Color3.fromRGB(186, 194, 222),
	subtext0: Color3.fromRGB(166, 173, 200),
	overlay2: Color3.fromRGB(147, 153, 178),
	overlay1: Color3.fromRGB(127, 132, 156),
	overlay0: Color3.fromRGB(108, 112, 134),
	surface2: Color3.fromRGB(88, 91, 112),
	surface1: Color3.fromRGB(69, 71, 90),
	surface0: Color3.fromRGB(49, 50, 68),
	base: Color3.fromRGB(30, 30, 46),
	mantle: Color3.fromRGB(24, 24, 37),
	crust: Color3.fromRGB(17, 17, 27),
} as const;

const base = {
	white: Color3.fromRGB(255, 255, 255),
	offwhite: Color3.fromRGB(234, 238, 253),
	black: Color3.fromRGB(0, 0, 0),
	dark: Color3.fromRGB(17, 17, 27),
};

const otherColors = {
	blue1: Color3.fromRGB(19, 52, 92),
	blue2: Color3.fromRGB(42, 101, 160),
	subtitleStrokeFrom: Color3.fromHex("#005794"),
	subtitleStrokeTo: Color3.fromHex("#000000"),
	red1: Color3.fromRGB(244, 0, 27),
	textStrokeFrom: Color3.fromRGB(10, 60, 130),
	textStrokeTo: Color3.fromRGB(5, 40, 100),
	claimYellow: Color3.fromHex("#F9CB4E"),
} as const;

/**
 * Catppuccin Mocha Palette
 * @see https://github.com/catppuccin/catppuccin
 */
export const palette = {
	...accents,
	...neutrals,
	...base,
	...otherColors,
} as const;

/**
 * Bot-only accents (prefixed variants)
 */
export const botAccents = {
	...accentsLatte,
} as const;

export function getRandomAccent(): Color3 {
	// For candy generation, we use the base accents
	const values = Object.values(accents);
	return values[math.random(0, values.size() - 1)];
}

export const textStrokeGradient = new ColorSequence(palette.textStrokeFrom, palette.textStrokeTo);
