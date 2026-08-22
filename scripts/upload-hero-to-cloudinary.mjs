import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";

cloudinary.config({
  cloud_name: "pjgmmeb8",
  api_key: "999578273622396",
  api_secret: "XZuT4oXP4yE2e3FGoDWKXgLukHw",
  secure: true,
});

async function main() {
  const heroPath = path.join(process.cwd(), "public", "images", "hero-vegetables.jpg");
  if (!fs.existsSync(heroPath)) {
    console.error("Hero image not found at", heroPath);
    return;
  }

  console.log("Uploading hero image to Cloudinary...");
  const result = await cloudinary.uploader.upload(heroPath, {
    folder: "green-basket/hero",
    public_id: "hero_vegetables_main",
    resource_type: "image",
    overwrite: true,
  });

  console.log("SUCCESS! Cloudinary Hero Image URL:", result.secure_url);
}

main().catch(console.error);
