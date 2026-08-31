import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: "Missing URL parameter" },
        { status: 400 }
      );
    }

    const trimmedUrl = targetUrl.trim();
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
      return NextResponse.json(
        { success: false, error: "Invalid URL protocol" },
        { status: 400 }
      );
    }

    // Follow redirect on server to resolve shortened links (e.g., maps.app.goo.gl)
    const response = await fetch(trimmedUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const finalUrl = response.url || "";

    // 1. Check @lat,lng pattern
    const atMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (isValidLatLng(lat, lng)) {
        return NextResponse.json({ success: true, lat, lng, resolvedUrl: finalUrl });
      }
    }

    // 2. Check q=lat,lng or query=lat,lng or ll=lat,lng
    const qMatch = finalUrl.match(/[?&](?:q|query|ll|center)=(-?\d+\.\d+)[,%2C]+(-?\d+\.\d+)/i);
    if (qMatch) {
      const lat = parseFloat(qMatch[1]);
      const lng = parseFloat(qMatch[2]);
      if (isValidLatLng(lat, lng)) {
        return NextResponse.json({ success: true, lat, lng, resolvedUrl: finalUrl });
      }
    }

    // 3. Check /dir/.../lat,lng
    const dirMatch = finalUrl.match(/\/(?:dir|place|search)\/[^/]*(-?\d+\.\d+)[,%2C]+(-?\d+\.\d+)/i);
    if (dirMatch) {
      const lat = parseFloat(dirMatch[1]);
      const lng = parseFloat(dirMatch[2]);
      if (isValidLatLng(lat, lng)) {
        return NextResponse.json({ success: true, lat, lng, resolvedUrl: finalUrl });
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to find location coordinates from this link. Please check the link and try again.",
      },
      { status: 422 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to resolve location link" },
      { status: 500 }
    );
  }
}

function isValidLatLng(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
