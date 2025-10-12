/// <reference types="@rbxts/testez/globals" />

import { HttpService } from "@rbxts/services";
import { clampToCircle } from "shared/utils/world-bounds";

export = () => {
	describe("clampToCircle", () => {
		it("returns same position when inside circle", () => {
			const position = new Vector2(10, 20);
			const result = clampToCircle({ position, radius: 100 });
			expect(HttpService.JSONEncode(result)).to.equal(HttpService.JSONEncode(position));
		});

		it("clamps to radius when outside circle", () => {
			const position = new Vector2(200, 0);
			const result = clampToCircle({ position, radius: 100 });
			expect(math.floor(result.Magnitude)).to.equal(100);
			expect(math.sign(result.X)).to.equal(1);
			expect(result.Y).to.equal(0);
		});

		it("handles diagonal clamping correctly", () => {
			const position = new Vector2(200, 200);
			const result = clampToCircle({ position, radius: 100 });
			// magnitude should be very close to radius
			expect(math.round(result.Magnitude)).to.equal(100);
		});

		it("returns zero when radius is non-positive", () => {
			const position = new Vector2(10, 10);
			const resultZero = clampToCircle({ position, radius: 0 });
			expect(resultZero.Magnitude).to.equal(0);

			const resultNegative = clampToCircle({ position, radius: -5 });
			expect(resultNegative.Magnitude).to.equal(0);
		});
	});
};
