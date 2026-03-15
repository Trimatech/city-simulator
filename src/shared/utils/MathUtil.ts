export function randomInt(min: number, max: number) {
	// min and max included
	return math.floor(math.random() * (max - min + 1) + min);
}

export function pickRandomElementFromArray<T>(arr: T[]): T {
	return arr[math.random(0, arr.size() - 1)];
}

export function sum(arr: number[]) {
	return arr.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
}
