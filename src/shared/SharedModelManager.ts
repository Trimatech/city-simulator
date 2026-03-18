import { ReplicatedStorage } from "@rbxts/services";
import { waitForChild } from "@rbxts/wait-for";

export function findSharedModel(folder: string, modelName: string) {
	const models = ReplicatedStorage.WaitForChild("Models");
	const modelFolder = models.WaitForChild(folder);
	if (!modelFolder) {
		error(`No model folder found with name: ${folder}`);
	}
	const model = modelFolder.WaitForChild(modelName);
	if (!model) {
		error(`No model found with name: ${modelName}`);
	}
	return model as Model;
}

export function findSharedInstance<T extends Instance>(folder: string, modelName: string) {
	const models = ReplicatedStorage.WaitForChild("Models");
	const modelFolder = models.WaitForChild(folder);
	if (!modelFolder) {
		error(`No model folder found with name: ${folder}`);
	}
	const model = modelFolder.WaitForChild(modelName);
	if (!model) {
		error(`No instance found with name: ${modelName}`);
	}
	return model as T;
}

export function cloneSharedInstance<T extends Instance>(folder: string, modelName: string) {
	const source = findSharedInstance<T>(folder, modelName);
	const prev = source.Archivable;
	source.Archivable = true;
	const clone = source.Clone() as T;
	source.Archivable = prev;
	return clone;
}

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
		currentInstance = await waitForChild(currentInstance, part);
	}

	if (!currentInstance) {
		error(`No instance found at path: ${path}`);
	}

	return currentInstance as T;
}

export async function loadSharedCloneByPath<T extends Instance>(path: string): Promise<T> {
	const source = await findSharedInstanceByPath<T>(path);
	const prev = source.Archivable;
	source.Archivable = true;
	const clone = source.Clone() as T;
	source.Archivable = prev;
	return clone;
}
