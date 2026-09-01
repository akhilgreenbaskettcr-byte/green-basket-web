const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo', 'Green-basket-logo.png');

  // Load and trim logo
  const logoBuffer = await sharp(logoPath)
    .trim()
    .toBuffer();

  // Helper to make square icon with white background and padded logo
  async function makeIcon(size, paddingPercent = 0.15) {
    const pad = Math.round(size * paddingPercent);
    const innerSize = size - pad * 2;

    const resizedLogo = await sharp(logoBuffer)
      .resize({
        width: innerSize,
        height: innerSize,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();

    // Composite on white background with rounded corner effect / safe padding
    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png();
  }

  // 192x192 standard icon
  await (await makeIcon(192, 0.12)).toFile(path.join(iconsDir, 'icon-192x192.png'));
  console.log('✓ Created icon-192x192.png');

  // 512x512 standard icon
  await (await makeIcon(512, 0.12)).toFile(path.join(iconsDir, 'icon-512x512.png'));
  console.log('✓ Created icon-512x512.png');

  // Maskable 512x512 icon (minimum 20% safe-zone padding for Android adaptive icons)
  await (await makeIcon(512, 0.22)).toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));
  console.log('✓ Created icon-maskable-512x512.png');

  // Apple touch icon (180x180)
  await (await makeIcon(180, 0.10)).toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('✓ Created apple-touch-icon.png');

  // Favicons
  await (await makeIcon(32, 0.05)).toFile(path.join(iconsDir, 'favicon-32x32.png'));
  await (await makeIcon(16, 0.05)).toFile(path.join(iconsDir, 'favicon-16x16.png'));
  await (await makeIcon(48, 0.08)).toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
  console.log('✓ Created favicons & favicon.ico');

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
