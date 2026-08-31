export async function extractCoordinatesFromUrl(
  inputUrl: string
): Promise<{ lat: number; lng: number } | { error: string }> {
  const urlStr = inputUrl.trim();
  if (!urlStr) {
    return { error: "Please enter a valid map location link." };
  }

  // 1. Direct Regex checks for @lat,lng
  const atMatch = urlStr.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 2. Direct Regex checks for q=lat,lng / query=lat,lng / ll=lat,lng
  const qMatch = urlStr.match(/[?&](?:q|query|ll|center)=(-?\d+\.\d+)[,%2C]+(-?\d+\.\d+)/i);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 3. Direct Regex checks for /dir/.../lat,lng
  const dirMatch = urlStr.match(/\/(?:dir|place|search)\/[^/]*(-?\d+\.\d+)[,%2C]+(-?\d+\.\d+)/i);
  if (dirMatch) {
    const lat = parseFloat(dirMatch[1]);
    const lng = parseFloat(dirMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 4. Direct Regex for raw numbers e.g. "9.9816, 76.2999"
  const rawMatch = urlStr.match(/^(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)$/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 5. If HTTP/HTTPS URL, resolve shortened or complex links via server API
  if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) {
    try {
      const res = await fetch(`/api/geocode/resolve-url?url=${encodeURIComponent(urlStr)}`);
      const data = await res.json();
      if (data.success && isValidLatLng(data.lat, data.lng)) {
        return { lat: data.lat, lng: data.lng };
      } else if (data.error) {
        return { error: data.error };
      }
    } catch {
      return { error: "Unable to find a location from this link. Please check the link and try again." };
    }
  }

  return { error: "Unable to find a location from this link. Please check the link and try again." };
}

function isValidLatLng(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
