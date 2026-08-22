import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pjgmmeb8",
  api_key: process.env.CLOUDINARY_API_KEY || "999578273622396",
  api_secret: process.env.CLOUDINARY_API_SECRET || "XZuT4oXP4yE2e3FGoDWKXgLukHw",
  secure: true,
});

export default cloudinary;

/**
 * Upload image buffer or base64 data to Cloudinary
 */
export async function uploadToCloudinary(
  fileData: string,
  folder: string = "green-basket"
): Promise<{ url: string; public_id: string }> {
  const result = await cloudinary.uploader.upload(fileData, {
    folder: `green-basket/${folder}`,
    resource_type: "image",
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}
