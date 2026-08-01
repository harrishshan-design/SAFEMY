"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Shared across every LiveMap instance on the page so the script tag is
// only ever injected once, and later mounts just await the same load.
let mapsLoadPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps) return Promise.resolve();
  if (mapsLoadPromise) return mapsLoadPromise;

  mapsLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("google-maps-script") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")));
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return mapsLoadPromise;
}

export function LiveMap({
  lat,
  lng,
  destination,
  updatedAt,
}: {
  lat: number;
  lng: number;
  destination?: string;
  updatedAt: string | null;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [eta, setEta] = useState<{ duration: string; distance: string } | null>(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;
    let cancelled = false;
    loadGoogleMaps()
      .then(() => { if (!cancelled) setReady(true); })
      .catch((err) => { if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load map"); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !mapDivRef.current) return;

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapDivRef.current, {
        center: { lat, lng },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
      });
      markerRef.current = new google.maps.Marker({
        map: mapRef.current,
        position: { lat, lng },
        title: "Assigned officer",
      });
      rendererRef.current = new google.maps.DirectionsRenderer({
        map: mapRef.current,
        suppressMarkers: true,
      });
    } else {
      markerRef.current?.setPosition({ lat, lng });
      mapRef.current.panTo({ lat, lng });
    }

    if (destination) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        { origin: { lat, lng }, destination, travelMode: google.maps.TravelMode.DRIVING },
        (result, status) => {
          if (status === "OK" && result) {
            rendererRef.current?.setDirections(result);
            const leg = result.routes[0]?.legs[0];
            if (leg) setEta({ duration: leg.duration?.text ?? "", distance: leg.distance?.text ?? "" });
          }
        },
      );
    }
  }, [ready, lat, lng, destination]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <p className="tool-empty">
        Live map isn&apos;t configured yet. Raw position: {lat.toFixed(5)}, {lng.toFixed(5)}
        {updatedAt && ` · last updated ${new Date(updatedAt).toLocaleTimeString()}`}
      </p>
    );
  }

  if (loadError) {
    return <p className="form-error">Couldn&apos;t load the map: {loadError}</p>;
  }

  return (
    <div>
      <div ref={mapDivRef} className="live-map-canvas" />
      {eta && <p className="form-note">Estimated {eta.duration} away ({eta.distance}) by road — traffic-dependent, not a guarantee.</p>}
    </div>
  );
}
