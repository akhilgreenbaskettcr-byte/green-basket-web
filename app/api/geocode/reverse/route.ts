import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { success: false, error: "Latitude and longitude coordinates are required." },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { success: false, error: "Invalid latitude or longitude numbers." },
      { status: 400 }
    );
  }

  try {
    // Primary Provider: OpenStreetMap Nominatim
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const nomRes = await fetch(nomUrl, {
      headers: {
        "User-Agent": "GreenBasketApp/1.0 (contact@greenbasket.in)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 0 },
    });

    if (nomRes.ok) {
      const nomData = await nomRes.json();
      const address = nomData?.address || {};

      // Extract postal code (specifically looking for 6-digit Indian PIN code)
      let pincode = (address.postcode || "").replace(/\D/g, "");
      if (pincode.length > 6) pincode = pincode.slice(0, 6);

      const areaName =
        address.suburb ||
        address.neighbourhood ||
        address.residential ||
        address.village ||
        address.town ||
        address.city_district ||
        address.county ||
        address.city ||
        "Detected Area";

      if (pincode && pincode.length === 6) {
        return NextResponse.json({
          success: true,
          pincode,
          areaName,
          rawAddress: address,
        });
      }
    }

    // Fallback Provider: BigDataCloud Reverse Geocoding API
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const bdcRes = await fetch(bdcUrl, { next: { revalidate: 0 } });

    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      let pincode = (bdcData?.postcode || "").replace(/\D/g, "");
      if (pincode.length > 6) pincode = pincode.slice(0, 6);

      const areaName =
        bdcData?.locality ||
        bdcData?.city ||
        bdcData?.principalSubdivision ||
        "Detected Area";

      if (pincode && pincode.length === 6) {
        return NextResponse.json({
          success: true,
          pincode,
          areaName,
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to detect 6-digit postal PIN code from coordinates. Please select your area manually.",
      },
      { status: 422 }
    );
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Network failure while retrieving location information. Please try again.",
      },
      { status: 500 }
    );
  }
}
