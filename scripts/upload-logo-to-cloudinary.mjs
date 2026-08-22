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
  const logoPath = path.join(process.cwd(), "public", "images", "logo", "Green-basket-logo.png");
  if (!fs.existsSync(logoPath)) {
    console.error("Logo not found at", logoPath);
    return;
  }

  console.log("Uploading official logo to Cloudinary...");
  const result = await cloudinary.uploader.upload(logoPath, {
    folder: "green-basket/branding",
    public_id: "green_basket_logo_official",
    resource_type: "image",
    overwrite: true,
  });

  console.log("SUCCESS! Cloudinary Official Logo URL:", result.secure_url);
}

main().catch(console.error);
