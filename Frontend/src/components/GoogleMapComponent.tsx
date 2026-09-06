"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { loadGoogleMaps, resetGoogleMapsLoader } from "../lib/googleMapsLoader";
import { ProcurementCentre } from "../lib/mockData";
import { Icon, Button } from "./ui";
import { useLanguage } from "../lib/languageContext";

export interface UserCoordinates {
  lat: number;
  lng: number;
}

export interface RoutePreviewInfo {
  distance: string;
  duration: string;
  summary?: string;
}

interface GoogleMapComponentProps {
  centres: ProcurementCentre[];
  selectedCenterId: number | null;
  onSelectCenter: (id: number) => void;
  onViewCenter: (id: number) => void;
  onBookSlot: (id: number) => void;
  userLocation?: UserCoordinates | null;
  onUserLocationChange?: (coords: UserCoordinates) => void;
  onRouteInfoChange?: (info: RoutePreviewInfo | null) => void;
  className?: string;
}

// KisanSetu restrained map style (soft agricultural greens, warm land, clean quiet roads)
const KISANSETU_MAP_STYLE = [
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d8e6eb" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f8f5ee" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e4ded4" }, { weight: 1 }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f2ebd9" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#dfd5be" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e3ece3" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#d5cdc1" }, { weight: 1 }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#485348" }] },
  { featureType: "transit", stylers: [{ visibility: "simplified" }, { opacity: 0.6 }] },
];

// Generate clean SVG custom marker icons with integrated Wait-Time Pills
function createMarkerIcon(centre: ProcurementCentre, isSelected: boolean) {
  let mainColor = "#1d6b3a"; // open brand green
  let statusText = centre.wait;

  if (centre.status === "delayed" || centre.status === "limited") {
    mainColor = "#d97706"; // amber
    statusText = centre.wait;
  } else if (centre.status === "closed") {
    mainColor = "#5f685f"; // muted gray
    statusText = "Closed";
  }

  const shortName = centre.name.split(" ")[0];
  const labelText = `${shortName} · ${statusText}`;
  const pillWidth = Math.max(86, labelText.length * 6.8 + 22);
  const totalWidth = pillWidth + 8;
  const totalHeight = 58;
  const pinCenterX = totalWidth / 2;

  const svg = `
    <svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
      </defs>

      <!-- Selection Ring Pulse -->
      ${
        isSelected
          ? `<circle cx="${pinCenterX}" cy="41" r="14" stroke="#1d6b3a" stroke-width="2.5" stroke-dasharray="3 3" opacity="0.85"/>`
          : ""
      }

      <!-- Pin Base & Needle -->
      <path d="M${pinCenterX} 56 C${pinCenterX} 56 ${pinCenterX + 11} 46 ${pinCenterX + 11} 39 C${pinCenterX + 11} 32.92 ${pinCenterX + 6.08} 28 ${pinCenterX} 28 C${pinCenterX - 6.08} 28 ${pinCenterX - 11} 32.92 ${pinCenterX - 11} 39 C${pinCenterX - 11} 46 ${pinCenterX} 56 Z" 
            fill="${mainColor}" 
            stroke="#ffffff" 
            stroke-width="2" 
            filter="url(#shadow)"/>
      <circle cx="${pinCenterX}" cy="39" r="4" fill="#ffffff" />

      <!-- Top Label Pill (Spatial Decision Badge) -->
      <g filter="url(#shadow)">
        <rect x="4" y="2" width="${pillWidth}" height="21" rx="10.5" 
              fill="${mainColor}" 
              stroke="#ffffff" 
              stroke-width="${isSelected ? 2.5 : 1.5}"/>
        <circle cx="14" cy="12.5" r="3" fill="#ffffff" />
        <text x="${pinCenterX + 3}" y="16" 
              fill="#ffffff" 
              font-family="'Inter', system-ui, sans-serif" 
              font-size="10.5" 
              font-weight="700" 
              text-anchor="middle">
          ${labelText}
        </text>
      </g>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
    scaledSize: new (window as any).google.maps.Size(totalWidth, totalHeight),
    anchor: new (window as any).google.maps.Point(pinCenterX, totalHeight - 2),
  };
}

// User farm location pulsing dot icon
function createUserLocationIcon() {
  const svg = `
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="16" fill="#2563eb" fill-opacity="0.22" />
      <circle cx="18" cy="18" r="9" fill="#2563eb" stroke="#ffffff" stroke-width="2.5" />
      <circle cx="18" cy="18" r="3.5" fill="#ffffff" />
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
    scaledSize: new (window as any).google.maps.Size(36, 36),
    anchor: new (window as any).google.maps.Point(18, 18),
  };
}

export default function GoogleMapComponent({
  centres,
  selectedCenterId,
  onSelectCenter,
  onViewCenter,
  onBookSlot,
  userLocation: propUserLocation,
  onUserLocationChange,
  onRouteInfoChange,
  className = "",
}: GoogleMapComponentProps) {
  const { t, isRTL } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const userMarkerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);

  // Advanced Map Layers & Services
  const trafficLayerRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);

  // Layer States
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);
  const [internalUserLoc, setInternalUserLoc] = useState<UserCoordinates | null>(propUserLocation || null);

  // Toggles
  const [showTraffic, setShowTraffic] = useState(false);
  const [showRadius, setShowRadius] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [mapType, setMapType] = useState<"roadmap" | "hybrid">("roadmap");
  const [routeInfo, setRouteInfo] = useState<RoutePreviewInfo | null>(null);

  // Sync prop user location
  useEffect(() => {
    if (propUserLocation) {
      setInternalUserLoc(propUserLocation);
    }
  }, [propUserLocation]);

  // Initialize and load the Google Maps API
  const initMap = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const googleMaps = await loadGoogleMaps();
      if (!mapContainerRef.current) return;

      let initialLat = 31.6340;
      let initialLng = 74.8723;

      if (centres.length > 0) {
        const sumLat = centres.reduce((acc, c) => acc + c.coordinates.lat, 0);
        const sumLng = centres.reduce((acc, c) => acc + c.coordinates.lng, 0);
        initialLat = sumLat / centres.length;
        initialLng = sumLng / centres.length;
      }

      const map = new googleMaps.Map(mapContainerRef.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: 11,
        minZoom: 8,
        maxZoom: 18,
        mapTypeId: googleMaps.MapTypeId.ROADMAP,
        styles: KISANSETU_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: googleMaps.ControlPosition.RIGHT_BOTTOM,
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: googleMaps.ControlPosition.RIGHT_TOP,
        },
        gestureHandling: "greedy",
      });

      mapInstanceRef.current = map;

      // Allow click-to-pin on map to set custom farm location
      map.addListener("click", (e: any) => {
        if (e.latLng) {
          const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          setInternalUserLoc(coords);
          if (onUserLocationChange) {
            onUserLocationChange(coords);
          }
          setGeoNotice(t("farm_location_set", "Farm location pinned on map."));
        }
      });

      trafficLayerRef.current = new googleMaps.TrafficLayer();

      radiusCircleRef.current = new googleMaps.Circle({
        strokeColor: "#1d6b3a",
        strokeOpacity: 0.5,
        strokeWeight: 1.5,
        fillColor: "#1d6b3a",
        fillOpacity: 0.08,
        map: null,
        radius: 10000,
      });

      directionsServiceRef.current = new googleMaps.DirectionsService();
      directionsRendererRef.current = new googleMaps.DirectionsRenderer({
        map: null,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#1d6b3a",
          strokeWeight: 4,
          strokeOpacity: 0.85,
        },
      });

      infoWindowRef.current = new googleMaps.InfoWindow({
        disableAutoPan: false,
        pixelOffset: new googleMaps.Size(0, -10),
      });

      setLoading(false);
    } catch (err: any) {
      console.error("Google Maps Load Error:", err);
      setLoadError(err.message || "Failed to load Google Maps");
      setLoading(false);
    }
  }, [centres, onUserLocationChange, t]);

  useEffect(() => {
    initMap();

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current.clear();
      if (userMarkerRef.current) userMarkerRef.current.setMap(null);
      if (trafficLayerRef.current) trafficLayerRef.current.setMap(null);
      if (radiusCircleRef.current) radiusCircleRef.current.setMap(null);
      if (directionsRendererRef.current) directionsRendererRef.current.setMap(null);
      if (infoWindowRef.current) infoWindowRef.current.close();
    };
  }, [initMap]);

  // Re-sync markers and bounds when centres array changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    const currentCentreIds = new Set(centres.map(c => c.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentCentreIds.has(id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    });

    if (centres.length === 0) {
      if (infoWindowRef.current) infoWindowRef.current.close();
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();

    centres.forEach(centre => {
      const position = { lat: centre.coordinates.lat, lng: centre.coordinates.lng };
      bounds.extend(position);

      const isSelected = centre.id === selectedCenterId;
      let marker = markersRef.current.get(centre.id);

      if (!marker) {
        marker = new window.google.maps.Marker({
          position,
          map,
          title: `${centre.name} (${centre.status.toUpperCase()} - ${centre.dist})`,
          icon: createMarkerIcon(centre, isSelected),
          zIndex: isSelected ? 100 : 10,
        });

        marker.addListener("click", () => {
          onSelectCenter(centre.id);
          openInfoWindow(centre, marker);
        });

        markersRef.current.set(centre.id, marker);
      } else {
        marker.setIcon(createMarkerIcon(centre, isSelected));
        marker.setZIndex(isSelected ? 100 : 10);
      }
    });

    if (centres.length === 1) {
      map.setCenter({ lat: centres[0].coordinates.lat, lng: centres[0].coordinates.lng });
      map.setZoom(13);
    } else if (centres.length > 1) {
      map.fitBounds(bounds, { top: 35, right: 35, bottom: 35, left: 35 });
      const listener = window.google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 14) map.setZoom(14);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [centres, selectedCenterId, onSelectCenter]);

  // Traffic Layer Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const traffic = trafficLayerRef.current;
    if (!map || !traffic) return;
    traffic.setMap(showTraffic ? map : null);
  }, [showTraffic]);

  // 10 km Radius Circle Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const circle = radiusCircleRef.current;
    if (!map || !circle) return;

    if (!showRadius) {
      circle.setMap(null);
      return;
    }

    let anchorCenter = null;
    if (internalUserLoc) {
      anchorCenter = internalUserLoc;
    } else {
      const selected = centres.find(c => c.id === selectedCenterId) || centres[0];
      if (selected) anchorCenter = selected.coordinates;
    }

    if (anchorCenter) {
      circle.setCenter(anchorCenter);
      circle.setMap(map);
    } else {
      circle.setMap(null);
    }
  }, [showRadius, internalUserLoc, selectedCenterId, centres]);

  // User Marker Synchronization
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    if (internalUserLoc) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition(internalUserLoc);
      } else {
        userMarkerRef.current = new window.google.maps.Marker({
          position: internalUserLoc,
          map,
          title: t("your_location", "Your Farm Location"),
          icon: createUserLocationIcon(),
          zIndex: 999,
        });
      }
    }
  }, [internalUserLoc, t]);

  // Driving Route Calculation & Preview
  useEffect(() => {
    const map = mapInstanceRef.current;
    const renderer = directionsRendererRef.current;
    const service = directionsServiceRef.current;
    if (!map || !renderer || !service || !window.google?.maps) return;

    const selected = centres.find(c => c.id === selectedCenterId);

    if (!showRoute || !internalUserLoc || !selected) {
      renderer.setMap(null);
      setRouteInfo(null);
      if (onRouteInfoChange) onRouteInfoChange(null);
      return;
    }

    const request = {
      origin: internalUserLoc,
      destination: selected.coordinates,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    service.route(request, (response: any, status: any) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        renderer.setDirections(response);
        renderer.setMap(map);

        const leg = response.routes[0]?.legs[0];
        if (leg) {
          const info: RoutePreviewInfo = {
            distance: leg.distance?.text || "",
            duration: leg.duration?.text || "",
            summary: response.routes[0]?.summary || "Fastest Route",
          };
          setRouteInfo(info);
          if (onRouteInfoChange) onRouteInfoChange(info);
        }
      } else {
        renderer.setMap(null);
        setRouteInfo(null);
        if (onRouteInfoChange) onRouteInfoChange(null);
      }
    });
  }, [showRoute, internalUserLoc, selectedCenterId, centres, onRouteInfoChange]);

  // Map Type Effect
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    map.setMapTypeId(
      mapType === "hybrid"
        ? window.google.maps.MapTypeId.HYBRID
        : window.google.maps.MapTypeId.ROADMAP
    );
  }, [mapType]);

  // InfoWindow
  const openInfoWindow = useCallback(
    (centre: ProcurementCentre, marker: any) => {
      const map = mapInstanceRef.current;
      const infoWindow = infoWindowRef.current;
      if (!map || !infoWindow) return;

      const isOpen = centre.status === "open";
      const isDelayed = centre.status === "delayed" || centre.status === "limited";

      const statusBadgeHtml = isOpen
        ? `<span style="background:#e8f0e9;color:#1d6b3a;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">● Open</span>`
        : isDelayed
        ? `<span style="background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">▲ Delayed</span>`
        : `<span style="background:#f3f4f6;color:#6b7280;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">○ Closed</span>`;

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${centre.coordinates.lat},${centre.coordinates.lng}`;

      const content = `
        <div style="font-family:'Inter',system-ui,sans-serif;padding:6px 2px;max-width:270px;color:#1a2319;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px;">
            <div style="font-size:14px;font-weight:700;font-family:'Poppins',sans-serif;line-height:1.2;">
              ${centre.name}
            </div>
            ${statusBadgeHtml}
          </div>
          
          <div style="font-size:11px;color:#697067;margin-bottom:8px;line-height:1.3;">
            📍 ${centre.address} · <strong>${centre.dist}</strong>
          </div>

          <div style="background:#f7f4ef;border:1px solid #e0dbce;border-radius:8px;padding:6px 8px;display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;margin-bottom:10px;">
            <div>
              <span style="color:#697067;font-size:9px;text-transform:uppercase;font-weight:600;">Est. Wait:</span>
              <div style="font-weight:700;color:${isDelayed ? "#b45309" : "#1d6b3a"};">${centre.wait}</div>
            </div>
            <div>
              <span style="color:#697067;font-size:9px;text-transform:uppercase;font-weight:600;">Available Slots:</span>
              <div style="font-weight:700;">${centre.slots > 0 ? `${centre.slots} today` : "None"}</div>
            </div>
            <div style="grid-column: span 2;border-top:1px solid #e0dbce;padding-top:4px;margin-top:2px;">
              <span style="color:#697067;font-size:9px;text-transform:uppercase;font-weight:600;">Next Slot:</span>
              <span style="font-weight:600;margin-left:4px;">${centre.nextSlot}</span>
            </div>
          </div>

          <div style="display:flex;gap:6px;">
            <button id="infowindow-book-btn" 
                    ${centre.status === "closed" ? "disabled" : ""}
                    style="flex:1;background:${centre.status === "closed" ? "#d1d5db" : "#1d6b3a"};color:#ffffff;border:none;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;cursor:${centre.status === "closed" ? "not-allowed" : "pointer"};">
              Book Slot
            </button>
            <button id="infowindow-view-btn" 
                    style="flex:1;background:#ffffff;color:#1a2319;border:1px solid #d0cad0;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;">
              View Centre
            </button>
          </div>

          <div style="text-align:center;margin-top:6px;">
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" 
               style="font-size:10px;color:#1d6b3a;font-weight:600;text-decoration:none;">
              ↗ Get Directions in Google Maps
            </a>
          </div>
        </div>
      `;

      infoWindow.setContent(content);
      infoWindow.open(map, marker);

      window.google.maps.event.addListenerOnce(infoWindow, "domready", () => {
        const bookBtn = document.getElementById("infowindow-book-btn");
        const viewBtn = document.getElementById("infowindow-view-btn");
        if (bookBtn) bookBtn.onclick = () => onBookSlot(centre.id);
        if (viewBtn) viewBtn.onclick = () => onViewCenter(centre.id);
      });
    },
    [onBookSlot, onViewCenter]
  );

  // Sync external card selection
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCenterId) return;

    const marker = markersRef.current.get(selectedCenterId);
    const centre = centres.find(c => c.id === selectedCenterId);

    if (marker && centre) {
      map.panTo(marker.getPosition());
      if (map.getZoom() < 12) {
        map.setZoom(13);
      }
      openInfoWindow(centre, marker);

      markersRef.current.forEach((m, id) => {
        const c = centres.find(item => item.id === id);
        if (c) {
          m.setIcon(createMarkerIcon(c, id === selectedCenterId));
          m.setZIndex(id === selectedCenterId ? 100 : 10);
        }
      });
    }
  }, [selectedCenterId, centres, openInfoWindow]);

  // Geolocation Handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice(t("geo_not_supported", "Geolocation is not supported by your browser."));
      return;
    }

    setLocatingUser(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocatingUser(false);
        const coords: UserCoordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setInternalUserLoc(coords);
        if (onUserLocationChange) {
          onUserLocationChange(coords);
        }

        const map = mapInstanceRef.current;
        if (map && window.google?.maps) {
          map.panTo(coords);
          map.setZoom(12);
        }
      },
      err => {
        setLocatingUser(false);
        console.warn("Geolocation permission error:", err);
        setGeoNotice(
          t(
            "location_permission_denied",
            "Location access was denied. You can click anywhere on the map or pick your village."
          )
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map || centres.length === 0 || !window.google?.maps) return;

    const bounds = new window.google.maps.LatLngBounds();
    centres.forEach(c => bounds.extend(c.coordinates));
    if (internalUserLoc) bounds.extend(internalUserLoc);

    map.fitBounds(bounds, { top: 35, right: 35, bottom: 35, left: 35 });
  };

  const handleRetry = () => {
    resetGoogleMapsLoader();
    initMap();
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-border bg-white shadow-xs ${className}`}
      role="region"
      aria-label="Interactive map of agricultural procurement centres"
    >
      {/* 1. Sleek Unified Header (White background, brand green accents) */}
      <div className="bg-white px-3.5 py-2.5 border-b border-border/80 flex flex-wrap items-center justify-between gap-2 z-10 relative">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <h2 className="font-bold text-xs text-foreground font-display tracking-tight">
            {t("mandi_map_title", "Procurement Centre Map")}
          </h2>
          <span className="text-[10px] font-bold text-primary bg-secondary px-2 py-0.5 rounded-full">
            {centres.length} {t("centres_found", "centres")}
          </span>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {/* Traffic Toggle */}
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              showTraffic
                ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                : "bg-[#f7f4ef] text-foreground border-border hover:bg-muted"
            }`}
            title={t("live_traffic_hint", "Live road conditions approaching mandi gate")}
          >
            <span>🚦</span>
            <span>{t("map_layer_traffic", "Traffic")}</span>
          </button>

          {/* 10 km Radius Circle Toggle */}
          <button
            onClick={() => setShowRadius(!showRadius)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              showRadius
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-[#f7f4ef] text-foreground border-border hover:bg-muted"
            }`}
            title={t("short_haul_radius_hint", "10 km local tractor haulage threshold")}
          >
            <span>⭕</span>
            <span>{t("map_layer_radius", "10 km Radius")}</span>
          </button>

          {/* Route Preview Toggle (when user loc is active) */}
          {internalUserLoc && (
            <button
              onClick={() => setShowRoute(!showRoute)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                showRoute
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-[#f7f4ef] text-foreground border-border hover:bg-muted"
              }`}
              title="Toggle driving route preview"
            >
              <span>🛣️</span>
              <span>{t("map_layer_route", "Route")}</span>
            </button>
          )}

          {/* Map / Satellite Toggle */}
          <div className="flex items-center bg-[#f7f4ef] border border-border rounded-lg p-0.5 text-[10px] font-bold">
            <button
              onClick={() => setMapType("roadmap")}
              className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                mapType === "roadmap" ? "bg-white text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("map_view_roadmap", "Map")}
            </button>
            <button
              onClick={() => setMapType("hybrid")}
              className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                mapType === "hybrid" ? "bg-white text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("map_view_satellite", "Sat")}
            </button>
          </div>

          {/* Fit All Button */}
          <button
            onClick={handleFitAll}
            className="p-1 px-1.5 rounded-lg bg-[#f7f4ef] hover:bg-muted border border-border text-foreground text-[11px] font-bold transition-all cursor-pointer"
            title={t("map_fit_all", "Fit All")}
          >
            ⛶
          </button>

          {/* Locate GPS Button */}
          <button
            onClick={handleUseMyLocation}
            disabled={locatingUser}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-white text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            title={t("use_my_location", "Use My Location")}
          >
            <Icon name="pin" size={11} className={locatingUser ? "animate-spin text-green-200" : "text-white"} />
            <span>{locatingUser ? t("locating", "Locating…") : t("use_my_location", "Location")}</span>
          </button>
        </div>
      </div>

      {/* 2. Floating Live Route Driving ETA Card (Inside Map Canvas) */}
      {routeInfo && showRoute && (
        <div className={`absolute top-14 ${isRTL ? "right-3" : "left-3"} z-10 bg-white/95 backdrop-blur border border-green-300 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2.5 text-xs text-foreground animate-fadeIn`}>
          <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center text-xs shrink-0">
            🚗
          </div>
          <div>
            <p className="font-bold text-foreground leading-tight">
              {t("route_eta_prefix", "Drive")}: ~{routeInfo.duration} <span className="text-muted-foreground font-normal">({routeInfo.distance})</span>
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Via {routeInfo.summary}
            </p>
          </div>
        </div>
      )}

      {/* Geolocation Notice Banner */}
      {geoNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-1 text-xs text-amber-800 flex items-center justify-between z-10 relative">
          <span className="flex items-center gap-1.5">
            <Icon name="alert" size={13} className="text-amber-600 shrink-0" />
            <span>{geoNotice}</span>
          </span>
          <button onClick={() => setGeoNotice(null)} className="text-amber-800/70 hover:text-amber-900 font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* Map Canvas / Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[460px] md:h-[480px]"
        tabIndex={0}
      />

      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-[#f7f4ef] flex flex-col items-center justify-center p-6 z-20">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
          <p className="font-bold text-sm text-foreground">
            {t("loading_map", "Loading procurement centres map…")}
          </p>
          <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
            {t("loading_map_sub", "Connecting to Google Maps and preparing Punjab procurement coordinates.")}
          </p>
        </div>
      )}

      {/* Error Fallback Card */}
      {loadError && !loading && (
        <div className="absolute inset-0 bg-[#f7f4ef] flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <Icon name="alert" size={24} />
          </div>
          <h3 className="font-bold text-foreground text-sm font-display">
            {t("map_unavailable_title", "Map unavailable")}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-xs">
            {t(
              "map_unavailable_desc",
              "We couldn't load the map right now. Procurement centres and booking features remain fully available in the list."
            )}
          </p>
          <Button size="sm" variant="outline" onClick={handleRetry} icon={<Icon name="refresh" size={14} />}>
            {t("retry_map", "Retry Map")}
          </Button>
        </div>
      )}

      {/* Bottom Floating Legend & Hint */}
      {!loading && !loadError && (
        <div className={`absolute bottom-3 ${isRTL ? "right-3" : "left-3"} bg-white/95 backdrop-blur px-2.5 py-1 rounded-xl border border-border text-[10px] font-semibold flex items-center gap-2.5 shadow-xs z-10`}>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#1d6b3a]" /> {t("open_now", "Open")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#d97706]" /> {t("status_delayed", "Delayed")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#5f685f]" /> {t("closed", "Closed")}
          </span>
          {internalUserLoc ? (
            <span className="flex items-center gap-1 border-l border-border pl-2 text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-300" /> {t("from_farm", "Farm")}
            </span>
          ) : (
            <span className="text-muted-foreground border-l border-border pl-2 text-[9px]">
              {t("click_map_to_set_location", "Click map to pin farm")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
