export function splitUtf8(input: string) {
	const result = new Array<string>();
	let index = 1;
	let nextP = utf8.offset(input, 2, index);
	while (nextP !== undefined) {
		result.push(string.sub(input, index, nextP - 1));
		index = nextP;
		nextP = utf8.offset(input, 2, index);
	}
	result.push(string.sub(input, index, -1));
	return result;
}
