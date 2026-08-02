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

function makePin(library: google.maps.MarkerLibrary, label: string, background: string) {
  return new library.PinElement({
    background,
    borderColor: "#ffffff",
    glyphColor: "#ffffff",
    glyphText: label,
    scale: 1.15,
  });
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
  const customerMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const personnelMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const routeRef = useRef<google.maps.Polyline | null>(null);
  const libraryRef = useRef<Awaited<ReturnType<typeof loadGoogleMaps>> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mapMode, setMapMode] = useState<"roadmap" | "satellite">("roadmap");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID?.trim() || "DEMO_MAP_ID";

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
        mapId,
        mapTypeId: mapMode,
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
        gestureHandling: "greedy",
        clickableIcons: false,
      });
      setStatus("ready");
    }).catch(() => {
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      if (customerMarkerRef.current) customerMarkerRef.current.map = null;
      if (personnelMarkerRef.current) personnelMarkerRef.current.map = null;
      routeRef.current?.setMap(null);
    };
  // Map configuration is fixed for the life of this assignment view.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, mapId]);

  useEffect(() => {
    mapRef.current?.setMapTypeId(mapMode);
  }, [mapMode]);

  useEffect(() => {
    const map = mapRef.current;
    const libraries = libraryRef.current;
    if (status !== "ready" || !map || !libraries) return;

    if (customer) {
      if (!customerMarkerRef.current) {
        const marker = new libraries.marker.AdvancedMarkerElement({
          map,
          title: "SafeMY customer",
          zIndex: 3,
        });
        marker.append(makePin(libraries.marker, "YOU", "#073b38"));
        customerMarkerRef.current = marker;
      }
      customerMarkerRef.current.position = customer;
    } else if (customerMarkerRef.current) {
      customerMarkerRef.current.map = null;
      customerMarkerRef.current = null;
    }

    if (personnel) {
      if (!personnelMarkerRef.current) {
        const marker = new libraries.marker.AdvancedMarkerElement({
          map,
          title: personnelName || "Assigned SafeMY personnel",
          zIndex: 2,
        });
        marker.append(makePin(libraries.marker, "PRO", "#f15f4b"));
        personnelMarkerRef.current = marker;
      }
      personnelMarkerRef.current.position = personnel;
      personnelMarkerRef.current.title = personnelName || "Assigned SafeMY personnel";
    } else if (personnelMarkerRef.current) {
      personnelMarkerRef.current.map = null;
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
  }, [customer, personnel, personnelName, status]);

  return (
    <>
      <div className="google-map-mode-switch" aria-label="Map view">
        <button className={mapMode === "roadmap" ? "active" : ""} onClick={() => setMapMode("roadmap")}>Map</button>
        <button className={mapMode === "satellite" ? "active" : ""} onClick={() => setMapMode("satellite")}>Satellite</button>
      </div>
      <div ref={canvasRef} className="google-live-map" aria-label="Google Map showing the live customer and assigned personnel locations" />
      {status === "loading" && <div className="google-map-state">Loading Google Maps…</div>}
      {status === "error" && <div className="google-map-state error">Google Maps is not configured for this deployment. Use the route and area-view buttons below.</div>}
    </>
  );
}
