import { GeometryService, Workspace } from "@rbxts/services";

export function createWorldWall({
	position = new Vector3(),
	color = new Color3(1, 1, 1),
	size = new Vector3(10, 10, 10),
	transparency = 0,
}: {
	position?: Vector3;
	color?: Color3;
	size?: Vector3;
	transparency?: number;
}) {
	const thickness = 2;
	const outerWall = new Instance("Part");
	outerWall.Size = size;
	outerWall.CFrame = new CFrame(position).mul(CFrame.Angles(0, 0, math.rad(90))); // Rotate 90 degrees
	outerWall.Color = color;
	outerWall.Transparency = transparency;
	outerWall.Material = Enum.Material.SmoothPlastic;
	outerWall.Anchored = true;
	outerWall.CanCollide = true;
	outerWall.Shape = Enum.PartType.Cylinder;

	const innerWall = new Instance("Part");
	innerWall.Size = size.sub(new Vector3(thickness, thickness, thickness)).add(new Vector3(thickness * 10, 0, 0));
	innerWall.CFrame = outerWall.CFrame;
	innerWall.Transparency = 1;
	innerWall.CanCollide = false;
	innerWall.Material = Enum.Material.SmoothPlastic;
	innerWall.Anchored = true;
	innerWall.Shape = Enum.PartType.Cylinder;

	// Use GeometryService to create a tube
	const items = GeometryService.SubtractAsync(outerWall, [innerWall]);

	if (items.size() === 0) {
		error("Failed to create world wall");
	}

	const tube = items[0];

	tube.Parent = Workspace;

	// Clean up temporary parts
	outerWall.Destroy();
	innerWall.Destroy();

	return tube;
}
