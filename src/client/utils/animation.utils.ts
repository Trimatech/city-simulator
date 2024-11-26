import { TweenService } from "@rbxts/services";

export function fadeModelOut(model: Model) {
	model.GetDescendants().forEach((descendant) => {
		if (descendant.IsA("BasePart")) {
			descendant.CanCollide = true;
			descendant.Anchored = false;

			// Fade away in 2 seconds
			const fadeTween = TweenService.Create(
				descendant,
				new TweenInfo(5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
				{ Transparency: 1 },
			);
			fadeTween.Play();
			fadeTween.Completed.Connect(() => {
				model?.Destroy();
			});
		}
	});
}
