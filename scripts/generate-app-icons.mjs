#!/usr/bin/env node
/**
 * Genera icon.png, android-icon-foreground.png y favicon.png
 * desde assets/images/Stride-logo-background.png
 */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const script = `
from PIL import Image
from pathlib import Path
root = Path(${JSON.stringify(root)})
src = root / "assets/images/Stride-logo-background.png"
img = Image.open(src).convert("RGBA")
w, h = img.size
side = max(w, h)
canvas = Image.new("RGBA", (side, side), (245, 247, 250, 255))
canvas.paste(img, ((side - w) // 2, (side - h) // 2), img)
icon = canvas.resize((1024, 1024), Image.Resampling.LANCZOS)
icon.save(root / "assets/icon.png", optimize=True)
icon.save(root / "assets/android-icon-foreground.png", optimize=True)
favicon = icon.resize((48, 48), Image.Resampling.LANCZOS)
favicon.save(root / "assets/favicon.png", optimize=True)
landing_favicon = root / "landing/assets/images/favicon.png"
landing_favicon.parent.mkdir(parents=True, exist_ok=True)
favicon.save(landing_favicon, optimize=True)
print("Iconos generados desde Stride-logo-background.png")
`;

const result = spawnSync('python3', ['-c', script], { encoding: 'utf8' });
if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(1);
}
console.log(result.stdout);
