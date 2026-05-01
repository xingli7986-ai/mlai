import sharp from "sharp";
const src = "design/studio-join-ui-design.png";
const meta = await sharp(src).metadata();
console.log("w x h:", meta.width, meta.height);
const sections = 6;
const sectionH = Math.floor(meta.height / sections);
for (let i = 0; i < sections; i++) {
  const top = i * sectionH;
  const h = i === sections - 1 ? meta.height - top : sectionH;
  await sharp(src)
    .extract({ left: 0, top, width: meta.width, height: h })
    .toFile(`design/_join-section-${i + 1}.png`);
  console.log(`section ${i + 1}: top=${top}, h=${h}`);
}
