import { ReplicatedStorage } from "@rbxts/services";
import { waitForChild } from "@rbxts/wait-for";

export async function findSharedInstanceByPath<T extends Instance>(path: string): Promise<T> {
	const pathParts = path.split("/");
	const firstPart = pathParts[0];
	let currentInstance: Instance;
	if (firstPart === "ServerStorage") {
		error("ServerStorage is not accessible. Use ReplicatedStorage instead.");
	} else if (firstPart === "ReplicatedStorage") {
		currentInstance = ReplicatedStorage;
	} else {
		error(`Invalid path: ${path}. Path must start with 'ReplicatedStorage' or 'ServerStorage'`);
	}

	pathParts.shift();

	for (const part of pathParts) {
		// logger.debug(`Finding ${part} in ${currentInstance.GetFullName()}`);
		currentInstance = await waitForChild(currentInstance, part);
	}

	if (!currentInstance) {
		error(`No instance found at path: ${path}`);
	}

	return currentInstance as T;
}
