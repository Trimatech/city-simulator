export const RAGDOLL_DURATION_SEC = 10;

// --- Joint definitions based on rbxts-falldown ---

interface BallSocketDef {
	type: "BallSocket";
	part0: string;
	part1: string;
	att0CF: CFrame;
	att1CF: CFrame;
	upperAngle: number;
	twistUpper: number;
	twistLower: number;
}

interface HingeDef {
	type: "Hinge";
	part0: string;
	part1: string;
	att0CF: CFrame;
	att1CF: CFrame;
	upperAngle: number;
	lowerAngle: number;
}

interface WeldDef {
	type: "Weld";
	part0: string;
	part1: string;
}

type JointDef = BallSocketDef | HingeDef | WeldDef;

const CF = (x: number, y: number, z: number, rx: number, ry: number, rz: number) =>
	new CFrame(x, y, z).mul(CFrame.Angles(math.rad(rx), math.rad(ry), math.rad(rz)));

const R6_JOINTS: JointDef[] = [
	{
		type: "BallSocket",
		part0: "Torso",
		part1: "Right Arm",
		att0CF: CF(1, 0.5, 0, 0, 0, 0),
		att1CF: CF(-0.5, 0.5, 0, 0, 0, 0),
		upperAngle: 90,
		twistUpper: 45,
		twistLower: -45,
	},
	{
		type: "BallSocket",
		part0: "Torso",
		part1: "Left Arm",
		att0CF: CF(-1, 0.5, 0, 0, 0, 0),
		att1CF: CF(0.5, 0.5, 0, 0, 0, 0),
		upperAngle: 90,
		twistUpper: 45,
		twistLower: -45,
	},
	{
		type: "BallSocket",
		part0: "Torso",
		part1: "Right Leg",
		att0CF: CF(0.5, -1, 0, 0, 0, 0),
		att1CF: CF(0, 1, 0, 0, 0, 0),
		upperAngle: 90,
		twistUpper: 45,
		twistLower: -45,
	},
	{
		type: "BallSocket",
		part0: "Torso",
		part1: "Left Leg",
		att0CF: CF(-0.5, -1, 0, 0, 0, 0),
		att1CF: CF(0, 1, 0, 0, 0, 0),
		upperAngle: 90,
		twistUpper: 45,
		twistLower: -45,
	},
	{
		type: "BallSocket",
		part0: "Torso",
		part1: "Head",
		att0CF: CF(0, 1, 0, 0, 0, 0),
		att1CF: CF(0, -0.5, 0, 0, 0, 0),
		upperAngle: 45,
		twistUpper: 45,
		twistLower: -45,
	},
	{ type: "Weld", part0: "HumanoidRootPart", part1: "Torso" },
];

const R15_JOINTS: JointDef[] = [
	{
		type: "BallSocket",
		part0: "UpperTorso",
		part1: "LeftUpperArm",
		att0CF: CF(-1.0012, 0.4854, 0.0095, -0.4917, 0, 0),
		att1CF: CF(0.2029, 0.5625, 0.0095, -0.4917, 0, 0),
		upperAngle: 45,
		twistUpper: 180,
		twistLower: -90,
	},
	{
		type: "BallSocket",
		part0: "UpperTorso",
		part1: "RightUpperArm",
		att0CF: CF(1.0012, 0.4854, 0.0095, -0.4917, 0, 0),
		att1CF: CF(-0.2029, 0.5625, 0.0095, -0.4917, 0, 0),
		upperAngle: 45,
		twistUpper: 180,
		twistLower: -90,
	},
	{
		type: "BallSocket",
		part0: "LowerTorso",
		part1: "LeftUpperLeg",
		att0CF: CF(-0.501, -0.4625, 0, 0, 0, 0),
		att1CF: CF(-0.001, 0.3562, 0, 0, 0, 0),
		upperAngle: 30,
		twistUpper: 30,
		twistLower: -30,
	},
	{
		type: "BallSocket",
		part0: "LowerTorso",
		part1: "RightUpperLeg",
		att0CF: CF(0.501, -0.4625, 0, 0, 0, 0),
		att1CF: CF(0.001, 0.3562, 0, 0, 0, 0),
		upperAngle: 30,
		twistUpper: 30,
		twistLower: -30,
	},
	{
		type: "BallSocket",
		part0: "UpperTorso",
		part1: "Head",
		att0CF: CF(0, 1.2368, 0.0394, 0, 0, 0),
		att1CF: CF(0, -0.6, 0, 0, 0, 0),
		upperAngle: 30,
		twistUpper: 45,
		twistLower: -45,
	},
	{
		type: "BallSocket",
		part0: "LeftLowerArm",
		part1: "LeftHand",
		att0CF: CF(-0.0004, -0.3464, 0, 0, 0, 0),
		att1CF: CF(-0.0004, 0.1227, 0, 0, 0, 0),
		upperAngle: 15,
		twistUpper: 1,
		twistLower: -1,
	},
	{
		type: "BallSocket",
		part0: "RightLowerArm",
		part1: "RightHand",
		att0CF: CF(0.0004, -0.3464, 0, 0, 0, 0),
		att1CF: CF(0.0004, 0.1227, 0, 0, 0, 0),
		upperAngle: 45,
		twistUpper: 1,
		twistLower: -1,
	},
	{
		type: "BallSocket",
		part0: "LeftLowerLeg",
		part1: "LeftFoot",
		att0CF: CF(0, -0.4438, 0, 0, 0, 0),
		att1CF: CF(0, 0.0563, 0, 0, 0, 0),
		upperAngle: 15,
		twistUpper: 5,
		twistLower: -5,
	},
	{
		type: "BallSocket",
		part0: "RightLowerLeg",
		part1: "RightFoot",
		att0CF: CF(0, -0.4438, 0, 0, 0, 0),
		att1CF: CF(0, 0.0563, 0, 0, 0, 0),
		upperAngle: 5,
		twistUpper: 5,
		twistLower: -5,
	},
	{
		type: "Hinge",
		part0: "LeftUpperArm",
		part1: "LeftLowerArm",
		att0CF: CF(-0.0016, -0.4901, 0.0156, 0, 0, 0),
		att1CF: CF(-0.0016, 0.2466, 0.0156, 0, 0, 0),
		upperAngle: 0,
		lowerAngle: -120,
	},
	{
		type: "Hinge",
		part0: "RightUpperArm",
		part1: "RightLowerArm",
		att0CF: CF(0.0016, -0.4901, 0.0156, 0, 0, 0),
		att1CF: CF(0.0016, 0.2466, 0.0156, 0, 0, 0),
		upperAngle: 0,
		lowerAngle: -120,
	},
	{
		type: "Hinge",
		part0: "LeftUpperLeg",
		part1: "LeftLowerLeg",
		att0CF: CF(-0.005, -0.4625, -0.0055, 0, 0, 0),
		att1CF: CF(-0.005, 0.3562, -0.0055, 0, 0, 0),
		upperAngle: 120,
		lowerAngle: 0,
	},
	{
		type: "Hinge",
		part0: "RightUpperLeg",
		part1: "RightLowerLeg",
		att0CF: CF(0.005, -0.4625, -0.0055, 0, 0, 0),
		att1CF: CF(0.005, 0.3562, -0.0055, 0, 0, 0),
		upperAngle: 120,
		lowerAngle: 0,
	},
	{
		type: "Hinge",
		part0: "LowerTorso",
		part1: "UpperTorso",
		att0CF: CF(0, 0.5362, 0, 0, 0, 0),
		att1CF: CF(0, -0.4784, 0, 0, 0, 0),
		upperAngle: 15,
		lowerAngle: -60,
	},
	{ type: "Weld", part0: "HumanoidRootPart", part1: "LowerTorso" },
];

function isR15(character: Model): boolean {
	return character.FindFirstChild("UpperTorso") !== undefined;
}

/**
 * Applies ragdoll physics to a character model using joint-specific constraints.
 * Based on rbxts-falldown but without collision groups (avoids the 32-group limit).
 * Returns a cleanup function that destroys the character.
 */
export function ragdollCharacter(character: Model, randomVelocity: number): () => void {
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	if (!humanoid) return () => {};

	// Stop and destroy animator + animate script
	const animator = humanoid.FindFirstChildOfClass("Animator");
	if (animator) {
		animator.GetPlayingAnimationTracks().forEach((track) => track.Stop());
		animator.Destroy();
	}
	character.FindFirstChild("Animate")?.Destroy();

	// Fully disable humanoid standing behavior
	humanoid.ChangeState(Enum.HumanoidStateType.Physics);
	humanoid.PlatformStand = true;
	humanoid.AutoRotate = false;
	humanoid.SetStateEnabled(Enum.HumanoidStateType.Jumping, false);
	humanoid.SetStateEnabled(Enum.HumanoidStateType.GettingUp, false);
	humanoid.EvaluateStateMachine = false;

	// Disable all existing Motor6Ds
	character.GetDescendants().forEach((inst) => {
		if (inst.IsA("Motor6D")) {
			inst.Enabled = false;
		}
	});

	// Choose joint map based on rig type
	const joints = isR15(character) ? R15_JOINTS : R6_JOINTS;
	const created: Instance[] = [];

	for (const def of joints) {
		const p0 = character.FindFirstChild(def.part0);
		const p1 = character.FindFirstChild(def.part1);
		if (!p0?.IsA("BasePart") || !p1?.IsA("BasePart")) continue;

		if (def.type === "Weld") {
			const weld = new Instance("WeldConstraint");
			weld.Part0 = p0;
			weld.Part1 = p1;
			weld.Parent = p0;
			created.push(weld);
		} else if (def.type === "BallSocket") {
			const att0 = new Instance("Attachment");
			att0.CFrame = def.att0CF;
			att0.Parent = p0;
			created.push(att0);

			const att1 = new Instance("Attachment");
			att1.CFrame = def.att1CF;
			att1.Parent = p1;
			created.push(att1);

			const socket = new Instance("BallSocketConstraint");
			socket.Attachment0 = att0;
			socket.Attachment1 = att1;
			socket.LimitsEnabled = true;
			socket.TwistLimitsEnabled = true;
			socket.UpperAngle = def.upperAngle;
			socket.TwistUpperAngle = def.twistUpper;
			socket.TwistLowerAngle = def.twistLower;
			socket.MaxFrictionTorque = 50;
			socket.Restitution = 0;
			socket.Parent = p0;
			created.push(socket);
		} else {
			const att0 = new Instance("Attachment");
			att0.CFrame = def.att0CF;
			att0.Parent = p0;
			created.push(att0);

			const att1 = new Instance("Attachment");
			att1.CFrame = def.att1CF;
			att1.Parent = p1;
			created.push(att1);

			const hinge = new Instance("HingeConstraint");
			hinge.Attachment0 = att0;
			hinge.Attachment1 = att1;
			hinge.LimitsEnabled = true;
			hinge.UpperAngle = def.upperAngle;
			hinge.LowerAngle = def.lowerAngle;
			hinge.Restitution = 0;
			hinge.Parent = p0;
			created.push(hinge);
		}
	}

	// Enable collision on all parts, but keep HumanoidRootPart non-collidable
	character.GetDescendants().forEach((inst) => {
		if (inst.IsA("BasePart")) {
			inst.Anchored = false;
			inst.CanCollide = inst.Name !== "HumanoidRootPart";
		}
	});

	// Apply velocity to the root part
	const rootPart = humanoid.RootPart ?? (character.FindFirstChild("HumanoidRootPart") as BasePart | undefined);
	if (rootPart && randomVelocity > 0) {
		const rng = new Random();
		rootPart.AssemblyLinearVelocity = new Vector3(
			rng.NextNumber(-randomVelocity, randomVelocity),
			rng.NextNumber(5, 15),
			rng.NextNumber(-randomVelocity, randomVelocity),
		);
	}

	let destroyed = false;
	return () => {
		if (destroyed) return;
		destroyed = true;
		for (const inst of created) {
			if (inst.Parent) inst.Destroy();
		}
		if (character.Parent) {
			character.Destroy();
		}
	};
}
