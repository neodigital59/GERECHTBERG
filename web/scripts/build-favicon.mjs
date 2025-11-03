import pngToIco from "png-to-ico";
import { writeFile } from "fs/promises";
import path from "path";

async function main() {
  const projectRoot = process.cwd();
  const src = path.join(projectRoot, "public", "Logo-Favicon.png");
  const out = path.join(projectRoot, "app", "favicon.ico");

  try {
    const icoBuffer = await pngToIco([src]);
    await writeFile(out, icoBuffer);
    console.log(`Favicon generated: ${out}`);
  } catch (err) {
    console.error("Failed to generate favicon.ico", err);
    process.exit(1);
  }
}

main();