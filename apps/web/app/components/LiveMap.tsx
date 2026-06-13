"use client";

import { useEffect, useRef } from "react";

interface RiderPin {
  riderId: string;
  name: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

interface Props {
  pins: RiderPin[];
  centerLat?: number;
  centerLng?: number;
  height?: number;
  primaryColor?: string;
}

export default function LiveMap({ pins, centerLat, centerLng, height = 320, primaryColor = "#6366f1" }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Dynamically load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const defLat = centerLat || (pins[0]?.lat) || 22.5726;
      const defLng = centerLng || (pins[0]?.lng) || 88.3639;

      const map = L.map(mapRef.current!, {
        center: [defLat, defLng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add initial pins
      addPins(L, map, pins, primaryColor);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update pins when they change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      addPins(L, mapInstanceRef.current, pins, primaryColor);
    });
  }, [pins, primaryColor]);

  function addPins(L: any, map: any, riderPins: RiderPin[], color: string) {
    riderPins.forEach((pin) => {
      const existingMarker = markersRef.current.get(pin.riderId);
      const latLng = L.latLng(pin.lat, pin.lng);

      const iconHtml = `
        <div style="
          background:${color};
          color:white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          width:32px;height:32px;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 12px rgba(0,0,0,0.4);
          border:2px solid white;
        ">
          <span style="transform:rotate(45deg);font-size:14px">🏍</span>
        </div>
      `;
      const icon = L.divIcon({ html: iconHtml, className: "", iconSize: [32, 32], iconAnchor: [16, 32] });

      if (existingMarker) {
        existingMarker.setLatLng(latLng);
      } else {
        const marker = L.marker(latLng, { icon }).addTo(map);
        const ago = Math.round((Date.now() - new Date(pin.updatedAt).getTime()) / 1000);
        marker.bindPopup(`<b>${pin.name}</b><br/>Updated ${ago}s ago`);
        markersRef.current.set(pin.riderId, marker);
      }
    });
  }

  return (
    <div
      ref={mapRef}
      style={{ height, borderRadius: 16, overflow: "hidden", background: "#1a1f2e" }}
      className="w-full border border-white/10"
    />
  );
}
