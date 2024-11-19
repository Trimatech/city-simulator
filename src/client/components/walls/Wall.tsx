import { useEffect, useRef } from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { Point } from "shared/polybool/polybool";

interface Props {
	line: [Point, Point];
	color?: Color3;
	transparency?: number;
	height?: number;
	thickness?: number;
	position?: Vector3;
}

export function Wall({
	line,
	color = new Color3(1, 1, 1),
	transparency = 0,
	height = 5,
	thickness = 1,
	position = new Vector3(),
}: Props) {
	const partRef = useRef<Part>();

	useEffect(() => {
		let part = partRef.current;

		if (!part) {
			part = new Instance("Part");
			part.Name = `wall_${line[0][0]}_${line[0][1]}_${line[1][0]}_${line[1][1]}`;
			part.Anchored = true;
			part.CanCollide = false;
			part.Material = Enum.Material.SmoothPlastic;
			part.TopSurface = Enum.SurfaceType.Smooth;
			part.BottomSurface = Enum.SurfaceType.Smooth;
			part.Parent = Workspace;
			partRef.current = part;
		}

		const startP = line[0];
		const endP = line[1];

		// Calculate wall properties
		const startPoint = new Vector3(startP[0], 0, startP[1]);
		const endPoint = new Vector3(endP[0], 0, endP[1]);
		const direction = endPoint.sub(startPoint);
		const width = direction.Magnitude;
		const center = startPoint.add(direction.mul(0.5)).add(position);
		const wallPosition = new Vector3(center.X, height / 2, center.Z);

		// Calculate rotation with 90-degree Y-axis adjustment
		const lookAt = new CFrame(wallPosition)
			.mul(CFrame.lookAt(new Vector3(), new Vector3(direction.X, 0, direction.Z)))
			.mul(CFrame.fromEulerAnglesXYZ(0, math.rad(90), 0));

		// Update part properties
		part.Size = new Vector3(width, height, thickness);
		part.CFrame = lookAt;
		part.Color = color;
		part.Transparency = transparency;

		return () => {
			if (partRef.current) {
				partRef.current.Destroy();
				partRef.current = undefined;
			}
		};
	}, [line, color, transparency, height, thickness, position]);

	return undefined;
}
