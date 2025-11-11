export function capitalizeFirst(text: string): string {
	if (text === "") return "";
	const first = string.upper(string.sub(text, 1, 1));
	const rest = string.sub(text, 2);
	return first + rest;
}
