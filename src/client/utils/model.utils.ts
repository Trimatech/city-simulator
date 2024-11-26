export function destroyWelds(model: Model) {
	model.GetDescendants().forEach((descendant) => {
		if (descendant.IsA("Weld") || descendant.IsA("WeldConstraint")) {
			descendant.Destroy();
		}
	});
}
