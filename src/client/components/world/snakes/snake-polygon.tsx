import React, { memo } from "@rbxts/react";
import { PolygonShape } from "client/components/polygon-clipper/PolygonShape";
import { useRem } from "client/hooks";
import { Polygon } from "shared/polybool/polybool";

interface SnakePolygonProps extends React.PropsWithChildren {
	readonly points: Vector2[];
	readonly scale: number;
}

function SnakePolygonTemp({ points, scale }: SnakePolygonProps) {
	const rem = useRem();
	// const style = useTracerStyle(line, effects, 0, skin.headColor || tracerSkin.tint);

	print("Render polygon");

	const polygon: Polygon = {
		regions: [points.map((point) => [rem(point.X * scale), rem(point.Y * scale)])],
		inverted: false,
	};

	return (
		<PolygonShape polygon={polygon} color={Color3.fromRGB(255, 0, 0)} transparency={0.5} thickness={4 * scale} />
	);
}

export const SnakePolygon = memo(SnakePolygonTemp);
