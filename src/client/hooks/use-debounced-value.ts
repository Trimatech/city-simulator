import { useDebounceState } from "@rbxts/pretty-react-hooks";
import { useEffect } from "@rbxts/react";

interface UseDebouncedValueOptions {
	wait?: number;
}

export function useDebouncedValue<T>(value: T, options?: UseDebouncedValueOptions): T {
	const [debounced, setDebounced] = useDebounceState<T>(value, { wait: options?.wait });

	useEffect(() => {
		setDebounced(value);
	}, [value]);

	return debounced;
}
