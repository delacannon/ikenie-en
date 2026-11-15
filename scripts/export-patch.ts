/**
 * Builds public/patch/ (manifest.json + one BPS per changed file) from Kizuato Studio's last
 * Ikenie build, then applies it to the original disk image as a check.
 *
 * Usage: node scripts/export-patch.ts   (env IKENIE_PROJECT, IKENIE_HDI to override paths)
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { bpsEncode, crc32, hex32 } from "../../../kizuato-re/engine/src/patch/bps.ts";
import { patchDisk } from "../src/components/patcher.ts";

const PROJ = process.env.IKENIE_PROJECT ?? join(homedir(), "kizuato-re/project-ikenie");
const ORIG = process.env.IKENIE_HDI ?? JSON.parse(readFileSync(join(PROJ, "project.json"), "utf8")).baseHdi;
const GAME_DIR: string = JSON.parse(readFileSync(join(PROJ, "project.json"), "utf8")).gameDir ?? "";
const OUT = join(import.meta.dirname, "../public/patch");
const version = "2026.11.15";

const B = join(PROJ, "build/en");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const changed: string[] = JSON.parse(readFileSync(join(B, "changed.json"), "utf8"));
const files = [];
const pmap = new Map<string, Uint8Array>();
for (const rel of changed) {
  const src = new Uint8Array(readFileSync(join(PROJ, "game", rel)));
  const tgt = new Uint8Array(readFileSync(join(B, "game", rel)));
  if (src.length === tgt.length && crc32(src) === crc32(tgt)) continue;
  const name = `${rel.replace(/\//g, "_")}.bps`;
  const bps = bpsEncode(src, tgt, `Ikenie en ${rel}`);
  writeFileSync(join(OUT, name), bps);
  pmap.set(name, bps);
  files.push({ path: GAME_DIR && !rel.startsWith(`${GAME_DIR}/`) ? `${GAME_DIR}/${rel}` : rel, patch: name, source: { size: src.length, crc32: hex32(crc32(src)) }, target: { size: tgt.length, crc32: hex32(crc32(tgt)) } });
}
const m = {
  format: "kizuato-re-patch/1" as const, game: "Ikenie", lang: "en", version, created: new Date().toISOString(),
  title: "Ikenie - Kyouraku no Shinden — English translation",
  requires: "your own copy of Ikenie - Kyouraku no Shinden (Cat's Pro, 1994), PC-98 hard-disk image (.hdi / .nhd) with the IKENIE folder",
  credits: ["Ikenie EN", "Original game © 1994 Cat's Pro.", "Made with Kizuato Studio"],
  files,
};
writeFileSync(join(OUT, "manifest.json"), JSON.stringify(m, null, 1));
const { disk, results } = patchDisk(m, new Uint8Array(readFileSync(ORIG)), pmap);
console.log(files.length, "files", disk ? "VERIFY OK" : "VERIFY FAIL", results.filter((r) => r.status !== "patched"));
if (!disk) process.exit(1);
