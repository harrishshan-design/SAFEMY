export type SafeMyGender = "female" | "male" | "non_binary" | "prefer_not_to_say";
export type PersonnelGenderPreference = "same_gender" | "female" | "male" | "no_preference";

export type Coordinates = { lat: number; lng: number };

export interface MatchablePersonnel {
  id: number;
  gender: string;
  rating: number;
  last_lat: number | null;
  last_lng: number | null;
}

export function makeTrackingToken() {
  return `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
}

export async function hashTrackingToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function haversineKm(a: Coordinates, b: Coordinates) {
  const radius = 6371;
  const toRadians = (value: number) => value * Math.PI / 180;
  const latDelta = toRadians(b.lat - a.lat);
  const lngDelta = toRadians(b.lng - a.lng);
  const value = Math.sin(latDelta / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(lngDelta / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function requestedGender(customerGender: SafeMyGender, preference: PersonnelGenderPreference) {
  if (preference === "same_gender" && customerGender !== "prefer_not_to_say") return customerGender;
  if (preference === "female" || preference === "male") return preference;
  return null;
}

export function rankPersonnel<T extends MatchablePersonnel>(
  rows: T[],
  customerGender: SafeMyGender,
  preference: PersonnelGenderPreference,
  pickup: Coordinates | null,
) {
  const preferred = requestedGender(customerGender, preference);
  return rows
    .map((personnel) => {
      const hasLocation = personnel.last_lat !== null && personnel.last_lng !== null;
      return {
        ...personnel,
        gender_priority: preferred ? personnel.gender === preferred : true,
        distance_km: pickup && hasLocation
          ? haversineKm(pickup, { lat: personnel.last_lat as number, lng: personnel.last_lng as number })
          : null,
      };
    })
    .sort((a, b) => {
      if (a.gender_priority !== b.gender_priority) return a.gender_priority ? -1 : 1;
      if (a.distance_km === null && b.distance_km !== null) return 1;
      if (a.distance_km !== null && b.distance_km === null) return -1;
      if (a.distance_km !== null && b.distance_km !== null && a.distance_km !== b.distance_km) return a.distance_km - b.distance_km;
      return Number(b.rating) - Number(a.rating);
    });
}

export function validCoordinates(lat: unknown, lng: unknown): Coordinates | null {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return null;
  if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) return null;
  return { lat: parsedLat, lng: parsedLng };
}
