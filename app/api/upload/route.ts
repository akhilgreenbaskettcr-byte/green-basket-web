import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let fileData = "";
    let folder = "general";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      folder = (formData.get("folder") as string) || "general";

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/jpeg";
      fileData = `data:${mimeType};base64,${buffer.toString("base64")}`;
    } else {
      const body = await request.json();
      fileData = body.fileData || body.image || "";
      folder = body.folder || "general";
    }

    if (!fileData) {
      return NextResponse.json({ error: "No image data received" }, { status: 400 });
    }

    const result = await uploadToCloudinary(fileData, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image to Cloudinary" },
      { status: 500 }
    );
  }
}
