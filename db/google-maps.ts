export type GoogleMapsPoint = { lat: number; lng: number };

function coordinate(point: GoogleMapsPoint) {
  return `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`;
}

export function googleMapsSearchUrl(point: GoogleMapsPoint) {
  const params = new URLSearchParams({
    api: "1",
    query: coordinate(point),
    utm_source: "SafeMY",
    utm_campaign: "location_sharing",
  });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export function googleMapsDirectionsUrl(origin: GoogleMapsPoint, destination: GoogleMapsPoint) {
  const params = new URLSearchParams({
    api: "1",
    origin: coordinate(origin),
    destination: coordinate(destination),
    travelmode: "driving",
    utm_source: "SafeMY",
    utm_campaign: "live_assignment_tracking",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
