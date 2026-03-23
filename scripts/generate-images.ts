import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, "..", "public");
const ASSETS_DIR = join(__dirname, "..", "assets");
const SOURCE_LOGO = join(ASSETS_DIR, "logo_V.png");

const VARIANTS = [
  {
    name: "og-image.png",
    width: 1200,
    height: 630,
    fit: "cover" as const,
    background: { r: 30, g: 41, b: 59 },
  },
  {
    name: "twitter-image.png",
    width: 1200,
    height: 675,
    fit: "cover" as const,
    background: { r: 30, g: 41, b: 59 },
  },
  {
    name: "favicon.png",
    width: 32,
    height: 32,
    fit: "contain" as const,
    background: { r: 30, g: 41, b: 59 },
  },
  {
    name: "apple-touch-icon.png",
    width: 180,
    height: 180,
    fit: "contain" as const,
    background: { r: 30, g: 41, b: 59 },
  },
  {
    name: "icon-192.png",
    width: 192,
    height: 192,
    fit: "contain" as const,
    background: { r: 30, g: 41, b: 59 },
  },
  {
    name: "icon-512.png",
    width: 512,
    height: 512,
    fit: "contain" as const,
    background: { r: 30, g: 41, b: 59 },
  },
  {
    name: "mstile-150x150.png",
    width: 150,
    height: 150,
    fit: "contain" as const,
    background: { r: 30, g: 41, b: 59 },
  },
  {
    name: "nav-logo.png",
    width: 96,
    height: 96,
    fit: "contain" as const,
    background: { r: 30, g: 41, b: 59 },
  },
];

async function generateImages() {
  if (!existsSync(SOURCE_LOGO)) {
    console.error(`Source logo not found: ${SOURCE_LOGO}`);
    process.exit(1);
  }

  if (!existsSync(PUBLIC_DIR)) {
    mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  console.log(`Generating images from: ${SOURCE_LOGO}\n`);

  for (const variant of VARIANTS) {
    try {
      const inputBuffer = await sharp(SOURCE_LOGO)
        .resize(variant.width, variant.height, {
          fit: variant.fit,
          background: variant.background,
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toBuffer();

      const outputPath = join(PUBLIC_DIR, variant.name);
      await sharp(inputBuffer).toFile(outputPath);

      const sizeKB = (inputBuffer.length / 1024).toFixed(1);
      console.log(`✓ ${variant.name} (${variant.width}x${variant.height}) - ${sizeKB}KB`);
    } catch (error) {
      console.error(`✗ Failed to generate ${variant.name}:`, error);
    }
  }

  // Also generate ICO for favicon (using 32x32 PNG)
  console.log("\n✓ Image generation complete!");
  console.log("\nGenerated files:");
  for (const v of VARIANTS) {
    console.log(`  - ${v.name}`);
  }
}

generateImages();
