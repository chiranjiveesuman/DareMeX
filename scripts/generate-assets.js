const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZES = {
  icon: 1024,
  favicon: 196,
  'adaptive-icon': 1024,
  splash: 1242
};

async function generateAssets() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../assets/icon.svg'));

  for (const [name, size] of Object.entries(SIZES)) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `../assets/${name}.png`));
    
    console.log(`Generated ${name}.png (${size}x${size})`);
  }
}

generateAssets().catch(console.error); 