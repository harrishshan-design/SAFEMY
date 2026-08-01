"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import type { GoogleMapsPoint } from "../../db/google-maps";

let mapsPromise: Promise<{
  maps: google.maps.MapsLibrary;
  core: google.maps.CoreLibrary;
  marker: google.maps.MarkerLibrary;
}> | null = null;

function loadGoogleMaps(apiKey: string) {
  if (!mapsPromise) {
    setOptions({ key: apiKey, v: "weekly", language: "en", region: "MY", authReferrerPolicy: "origin" });
    mapsPromise = Promise.all([
      importLibrary("maps"),
      importLibrary("core"),
      importLibrary("marker"),
    ]).then(([maps, core, marker]) => ({ maps, core, marker }));
  }
  return mapsPromise;
}

export function GoogleLiveMap({
  customer,
  personnel,
  personnelName,
}: {
  customer?: GoogleMapsPoint;
  personnel?: GoogleMapsPoint;
  personnelName: string;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const customerMarkerRef = useRef<google.maps.Marker | null>(null);
  const personnelMarkerRef = useRef<google.maps.Marker | null>(null);
  const routeRef = useRef<google.maps.Polyline | null>(null);
  const libraryRef = useRef<Awaited<ReturnType<typeof loadGoogleMaps>> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

  useEffect(() => {
    if (!apiKey || !canvasRef.current) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    loadGoogleMaps(apiKey).then((libraries) => {
      if (cancelled || !canvasRef.current) return;
      libraryRef.current = libraries;
      const initial = customer ?? personnel ?? { lat: 3.139, lng: 101.6869 };
      mapRef.current = new libraries.maps.Map(canvasRef.current, {
        center: initial,
        zoom: customer || personnel ? 16 : 11,
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
        gestureHandling: "greedy",
        clickableIcons: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });
      setStatus("ready");
    }).catch(() => {
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      customerMarkerRef.current?.setMap(null);
      personnelMarkerRef.current?.setMap(null);
      routeRef.current?.setMap(null);
    };
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current;
    const libraries = libraryRef.current;
    if (status !== "ready" || !map || !libraries) return;

    if (customer) {
      if (!customerMarkerRef.current) {
        customerMarkerRef.current = new libraries.marker.Marker({
          map,
          title: "SafeMY customer",
          label: { text: "YOU", color: "#ffffff", fontSize: "10px", fontWeight: "800" },
          icon: {
            path: libraries.core.SymbolPath.CIRCLE,
            fillColor: "#073b38",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 4,
            scale: 18,
          },
          zIndex: 3,
        });
      }
      customerMarkerRef.current.setPosition(customer);
    } else {
      customerMarkerRef.current?.setMap(null);
      customerMarkerRef.current = null;
    }

    if (personnel) {
      if (!personnelMarkerRef.current) {
        personnelMarkerRef.current = new libraries.marker.Marker({
          map,
          title: personnelName || "Assigned SafeMY personnel",
          label: { text: "PRO", color: "#ffffff", fontSize: "10px", fontWeight: "800" },
          icon: {
            path: libraries.core.SymbolPath.CIRCLE,
            fillColor: "#f15f4b",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 4,
            scale: 18,
          },
          zIndex: 2,
        });
      }
      personnelMarkerRef.current.setPosition(personnel);
      personnelMarkerRef.current.setTitle(personnelName || "Assigned SafeMY personnel");
    } else {
      personnelMarkerRef.current?.setMap(null);
      personnelMarkerRef.current = null;
    }

    if (customer && personnel) {
      const path = [personnel, customer];
      if (!routeRef.current) {
        routeRef.current = new libraries.maps.Polyline({
          map,
          path,
          geodesic: true,
          strokeColor: "#287e68",
          strokeOpacity: 0.9,
          strokeWeight: 5,
        });
      } else {
        routeRef.current.setPath(path);
      }
      const bounds = new libraries.core.LatLngBounds();
      bounds.extend(customer);
      bounds.extend(personnel);
      map.fitBounds(bounds, 72);
    } else {
      routeRef.current?.setMap(null);
      routeRef.current = null;
      const point = customer ?? personnel;
      if (point) {
        map.setCenter(point);
        map.setZoom(16);
      }
    }
  }, [customer?.lat, customer?.lng, personnel?.lat, personnel?.lng, personnelName, status]);

  return (
    <>
      <div ref={canvasRef} className="google-live-map" aria-label="Google Map showing the live customer and assigned personnel locations" />
      {status === "loading" && <div className="google-map-state">Loading Google Maps...</div>}
      {status === "error" && <div className="google-map-state error">Google Maps could not load. Use the directions button below.</div>}
    </>
  );
}
