// Generates badge icons from docs/badges.md using Google Gemini image generation.
//
// Usage:
//   npx tsx scripts/generate-badges.ts [--badge "Badge Name"] [--category "Category"] [--dry-run]
//
// Requirements:
//   npm install @google/genai mime
//   export GEMINI_API_KEY=your_key
//
// Options:
//   --badge "Name"      Generate only a specific badge (e.g. --badge "Settler")
//   --category "Name"   Generate only a specific category (e.g. --category "Ranking")
//   --dry-run           Print prompts without generating images
//   --delay 5000        Delay between requests in ms (default: 3000, for rate limiting)

import { GoogleGenAI } from "@google/genai";
import mime from "mime";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Badge {
	name: string;
	condition: string;
	subjectPrompt: string;
	category: string;
}

// ---------------------------------------------------------------------------
// Parse badges.md
// ---------------------------------------------------------------------------

function parseBadges(mdPath: string): { stylePrompt: string; badges: Badge[] } {
	const content = readFileSync(mdPath, "utf-8");

	// Extract style prompt (first fenced code block)
	const styleMatch = content.match(
		/## Style Prompt[^\n]*\n\n```\n([\s\S]*?)```/,
	);
	if (!styleMatch) throw new Error("Could not find style prompt in badges.md");
	const stylePrompt = styleMatch[1].trim().replace(/\n/g, " ");

	// Extract badges from markdown tables
	const badges: Badge[] = [];
	let currentCategory = "";

	for (const line of content.split("\n")) {
		// Detect category headers
		const headerMatch = line.match(/^## (.+)/);
		if (headerMatch) {
			const header = headerMatch[1].trim();
			// Skip non-badge sections
			if (
				["Style Prompt", "Summary", "How to Use"].some((s) =>
					header.startsWith(s),
				)
			)
				continue;
			currentCategory = header;
			continue;
		}

		// Parse table rows: | **Name** | Condition | `prompt` |
		const rowMatch = line.match(
			/^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*`(.+?)`\s*\|$/,
		);
		if (rowMatch && currentCategory) {
			badges.push({
				name: rowMatch[1],
				condition: rowMatch[2].trim(),
				subjectPrompt: rowMatch[3],
				category: currentCategory,
			});
		}
	}

	return { stylePrompt, badges };
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
	const args = process.argv.slice(2);
	const opts = {
		badge: undefined as string | undefined,
		category: undefined as string | undefined,
		dryRun: false,
		delay: 3000,
	};

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--badge":
				opts.badge = args[++i];
				break;
			case "--category":
				opts.category = args[++i];
				break;
			case "--dry-run":
				opts.dryRun = true;
				break;
			case "--delay":
				opts.delay = parseInt(args[++i], 10);
				break;
		}
	}

	return opts;
}

// ---------------------------------------------------------------------------
// Image generation
// ---------------------------------------------------------------------------

async function generateBadgeImage(
	ai: GoogleGenAI,
	fullPrompt: string,
	outputPath: string,
): Promise<boolean> {
	const response = await ai.models.generateContentStream({
		model: "gemini-2.5-flash-image",
		config: {
			responseModalities: ["IMAGE"],
			imageConfig: {
				aspectRatio: "1:1",
			},
		},
		contents: [
			{
				role: "user",
				parts: [{ text: fullPrompt }],
			},
		],
	});

	for await (const chunk of response) {
		if (!chunk.candidates?.[0]?.content?.parts) continue;

		const inlineData = chunk.candidates[0].content.parts[0]?.inlineData;
		if (inlineData) {
			const ext = mime.getExtension(inlineData.mimeType || "") || "png";
			const filePath = `${outputPath}.${ext}`;
			const buffer = Buffer.from(inlineData.data || "", "base64");
			writeFileSync(filePath, buffer);
			console.log(`  -> Saved: ${filePath}`);
			return true;
		}
	}

	return false;
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(str: string): string {
	return str
		.toLowerCase()
		.replace(/[']/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	const opts = parseArgs();
	const mdPath = path.resolve(__dirname, "../docs/badges.md");
	const outputDir = path.resolve(__dirname, "../assets/badges");

	const { stylePrompt, badges } = parseBadges(mdPath);

	// Filter badges
	let filtered = badges;
	if (opts.badge) {
		filtered = filtered.filter(
			(b) => b.name.toLowerCase() === opts.badge!.toLowerCase(),
		);
	}
	if (opts.category) {
		filtered = filtered.filter(
			(b) => b.category.toLowerCase() === opts.category!.toLowerCase(),
		);
	}

	if (filtered.length === 0) {
		console.error("No badges matched the filter.");
		process.exit(1);
	}

	console.log(`Found ${filtered.length} badge(s) to generate.\n`);

	if (opts.dryRun) {
		for (const badge of filtered) {
			const fullPrompt = `${stylePrompt}, ${badge.subjectPrompt}`;
			console.log(`[${badge.category}] ${badge.name}`);
			console.log(`  Prompt: ${fullPrompt}\n`);
		}
		return;
	}

	// Validate API key
	if (!process.env["GEMINI_API_KEY"]) {
		console.error("GEMINI_API_KEY environment variable is not set.");
		process.exit(1);
	}

	const ai = new GoogleGenAI({ apiKey: process.env["GEMINI_API_KEY"] });

	// Create output directory
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	let succeeded = 0;
	let failed = 0;

	for (let i = 0; i < filtered.length; i++) {
		const badge = filtered[i];
		const categorySlug = slugify(badge.category);
		const slug = slugify(badge.name);
		const categoryDir = path.join(outputDir, categorySlug);
		if (!existsSync(categoryDir)) {
			mkdirSync(categoryDir, { recursive: true });
		}
		const outputPath = path.join(categoryDir, slug);
		const fullPrompt = `${stylePrompt}, ${badge.subjectPrompt}`;

		console.log(
			`[${i + 1}/${filtered.length}] ${badge.category} > ${badge.name}`,
		);

		// Skip if already exists
		if (
			existsSync(`${outputPath}.png`) ||
			existsSync(`${outputPath}.jpg`) ||
			existsSync(`${outputPath}.jpeg`) ||
			existsSync(`${outputPath}.webp`)
		) {
			console.log("  -> Already exists, skipping (delete to regenerate)");
			succeeded++;
			continue;
		}

		try {
			const ok = await generateBadgeImage(ai, fullPrompt, outputPath);
			if (ok) {
				succeeded++;
			} else {
				console.log("  -> No image returned");
				failed++;
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			console.error(`  -> Error: ${msg}`);
			failed++;
		}

		// Rate limit delay between requests
		if (i < filtered.length - 1) {
			await sleep(opts.delay);
		}
	}

	console.log(
		`\nDone. ${succeeded} succeeded, ${failed} failed out of ${filtered.length}.`,
	);
}

main();
