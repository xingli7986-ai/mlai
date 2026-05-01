import sharp from "sharp";
const src = "design/studio-join-ui-design.png";
const meta = await sharp(src).metadata();
const rows = 6;
const cols = 2;
const cellH = Math.floor(meta.height / rows);
const cellW = Math.floor(meta.width / cols);
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const top = r * cellH;
    const left = c * cellW;
    const h = r === rows - 1 ? meta.height - top : cellH;
    const w = c === cols - 1 ? meta.width - left : cellW;
    await sharp(src)
      .extract({ left, top, width: w, height: h })
      .resize({ width: 720 })
      .toFile(`design/_join-r${r + 1}c${c + 1}.png`);
  }
}
console.log("done");
