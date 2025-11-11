/**
 * Utility functions for PartViewer component
 */

/**
 * Recursively removes scripts and potentially problematic instances from a cloned instance
 * This prevents script injection permission errors when cloning parts
 */
export function removeScriptsFromClone(instance: Instance): void {
	for (const child of instance.GetChildren()) {
		if (child.IsA("Script") || child.IsA("LocalScript") || child.IsA("ModuleScript")) {
			child.Destroy();
		} else {
			removeScriptsFromClone(child);
		}
	}
}

/**
 * Safely clones an instance with script removal and error handling
 * @param instance The instance to clone
 * @param targetParent The parent to attach the clone to
 * @returns The cloned instance or undefined if cloning failed
 */
export function safeCloneInstance(instance: Instance, targetParent: Instance): Instance | undefined {
	try {
		const clone = instance.Clone();
		removeScriptsFromClone(clone);
		clone.Parent = targetParent;
		return clone;
	} catch (error) {
		warn(`Failed to clone part ${instance.Name}: ${error}`);
		return undefined;
	}
}

/**
 * Safely clones multiple instances with script removal and error handling
 * @param instances Array of instances to clone
 * @param targetParent The parent to attach the clones to
 * @returns Array of successfully cloned instances
 */
export function safeCloneInstances(instances: Instance[], targetParent: Instance): Instance[] {
	const clones: Instance[] = [];

	for (const instance of instances) {
		const clone = safeCloneInstance(instance, targetParent);
		if (clone) {
			clones.push(clone);
		}
	}

	return clones;
}

/**
 * Filters parts to only include valid, archivable instances that can be safely cloned
 * @param parts Array of potential parts to filter
 * @returns Filtered array of valid parts
 */
export function filterValidParts(parts: Instance[]): Instance[] {
	return parts.filter(
		(part) =>
			(part.IsA("Model") || part.IsA("Folder") || part.IsA("BasePart")) &&
			!part.IsA("Terrain") &&
			!part.IsA("Workspace") &&
			part.Archivable,
	);
}
