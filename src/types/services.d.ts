interface WallSkinModels {
	CosmicShiftGradientWall: Part;
	MidNightCityGradientWall: Part;
	BradyFunGradientWall: Part;
	RastafariGradientWall: Part;
	SweetMorningGradientWall: Part;
	JoyShineGradientWall: Part;
	SupermanGradientWall: Part;
	StarsWall: Part;
	SpiderwebWall: Part;
	FamousWall: Part;
	WoodWall: Part;
	StoneWall: Part;
	IcyWall: Part;
}

type WallSkinModelName = keyof WallSkinModels;

interface ReplicatedStorage extends Instance {
	Models: Folder & {
		Walls: Folder & WallSkinModels;
	};
}
