"use client";

import { useState, useMemo, useRef } from "react";
import { Button, Icon, Card, StatusBadge, Input } from "../components/ui";
import FarmerShell from "./FarmerShell";
import { useLanguage } from "../lib/languageContext";
import { CENTRES } from "../lib/mockData";
import GoogleMapComponent, { UserCoordinates, RoutePreviewInfo } from "../components/GoogleMapComponent";

interface Props {
  navigate: (view: string) => void;
}

// Popular Punjab farming hubs for instant location simulation without GPS prompts
const PUNJAB_FARMING_HUBS = [
  { id: "kotla", name: "Kotla Kalan (Near Amritsar)", coords: { lat: 31.6250, lng: 74.8650 } },
  { id: "ajnala", name: "Ajnala Rural Block", coords: { lat: 31.8350, lng: 74.7500 } },
  { id: "ropar", name: "Ropar Bypass Area", coords: { lat: 30.9700, lng: 76.5100 } },
  { id: "nakodar", name: "Nakodar Mandi Region", coords: { lat: 31.1300, lng: 75.4600 } },
  { id: "ludhiana", name: "Ludhiana Focal Point", coords: { lat: 30.9010, lng: 75.8573 } },
];

// Haversine formula to calculate accurate distance between coordinates in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function FindCenter({ navigate }: Props) {
  const { t, isRTL } = useLanguage();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<number>(1);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
  const [selectedVillageId, setSelectedVillageId] = useState<string>("");
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<RoutePreviewInfo | null>(null);

  const cardListRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { id: "All", label: t("filter_all", "All Centres") },
    { id: "Lowest Wait", label: t("filter_lowest_wait", "Lowest Wait") },
    { id: "Available Slots", label: t("available_slots", "Available Slots") },
    { id: "Open Now", label: t("open_now", "Open Now") },
    { id: "Within 10 km", label: t("filter_within_10km", "Within 10 km") },
  ];

  // Process centres with real calculated distance if userLocation is available
  const centresWithDistance = useMemo(() => {
    return CENTRES.map(c => {
      if (userLocation) {
        const calculatedKm = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          c.coordinates.lat,
          c.coordinates.lng
        );
        return {
          ...c,
          distKm: calculatedKm,
          dist: `${calculatedKm} km`,
          isCalculated: true,
        };
      }
      return {
        ...c,
        isCalculated: false,
      };
    });
  }, [userLocation]);

  // Handle village quick-pick
  const handleVillageSelect = (villageId: string) => {
    setSelectedVillageId(villageId);
    if (!villageId) {
      setUserLocation(null);
      return;
    }
    const hub = PUNJAB_FARMING_HUBS.find(h => h.id === villageId);
    if (hub) {
      setUserLocation(hub.coords);
      setLocationNotice(null);
    }
  };

  // Handle filter selection
  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    if (filterId === "Within 10 km" && !userLocation) {
      setLocationNotice(
        t(
          "location_needed_for_10km",
          "Location access is unavailable. Select your village or enable GPS to filter within 10 km."
        )
      );
    } else {
      setLocationNotice(null);
    }
  };

  // Filter and sort the centres list
  const filteredCentres = useMemo(() => {
    let result = centresWithDistance.filter(c => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        q === "" ||
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.commodities.some(comm => comm.toLowerCase().includes(q));

      if (!matchesQuery) return false;

      if (activeFilter === "Open Now") return c.status === "open";
      if (activeFilter === "Available Slots") return c.slots > 0;
      if (activeFilter === "Within 10 km" && userLocation) return c.distKm <= 10;
      return true;
    });

    if (activeFilter === "Lowest Wait") {
      result.sort((a, b) => a.waitMin - b.waitMin);
    } else if (activeFilter === "Available Slots") {
      result.sort((a, b) => b.slots - a.slots);
    } else {
      result.sort((a, b) => a.distKm - b.distKm);
    }

    return result;
  }, [centresWithDistance, query, activeFilter, userLocation]);

  // Selected centre resolution
  const selectedCenter = useMemo(() => {
    return (
      filteredCentres.find(c => c.id === selectedId) ||
      centresWithDistance.find(c => c.id === selectedId) ||
      filteredCentres[0] ||
      centresWithDistance[0]
    );
  }, [filteredCentres, centresWithDistance, selectedId]);

  const fastestCentre = useMemo(() => {
    const openCentres = centresWithDistance.filter(c => c.status === "open");
    if (openCentres.length === 0) return null;
    return [...openCentres].sort((a, b) => a.waitMin - b.waitMin)[0];
  }, [centresWithDistance]);

  const closestCentre = useMemo(() => {
    return [...centresWithDistance].sort((a, b) => a.distKm - b.distKm)[0];
  }, [centresWithDistance]);

  return (
    <FarmerShell navigate={navigate} current="find-center" title={t("find_center_title", "Find a Procurement Centre")}>

      {/* ═════════════════════════════════════════════════════════════════════
          DESKTOP VIEW (12-Col Split: 6 Cols Primary Decision List + 6 Cols Interactive Logistics Map)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-4 max-w-7xl mx-auto px-6 pt-4 pb-12">
        
        {/* Page Title & Context */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
              {t("find_center_title", "Find a Procurement Centre")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("find_center_sub", "Compare nearby centres by distance, queue wait, and slot availability.")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("slot-recommendation")}
            icon={<Icon name="star" size={15} className="text-amber-500" />}
          >
            {t("btn_smart_recommend", "Smart Slot Recommendation")}
          </Button>
        </div>

        {/* Smart Slot Recommendation Banner */}
        <div className="bg-secondary/70 border border-green-200 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs">
              ★
            </span>
            <div>
              <span className="font-bold text-foreground">
                {t("recommended_slot_label", "RECOMMENDED SLOT:")} Tomorrow · 10:30–11:00 AM at ABC Procurement Centre
              </span>
              <span className="text-muted-foreground ml-2">
                {t("stat_est_wait", "Estimated wait")}: <strong className="text-primary">~20 min</strong> (Lower expected queue)
              </span>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate("slot-booking")}>
            {t("btn_book_this_slot", "Book This Slot")}
          </Button>
        </div>

        {/* Search Bar & Village Quick-Picker (Row 1) */}
        <div className="bg-white p-3.5 rounded-2xl border border-border shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder={t("search_center_placeholder", "Search by centre name, village, district or commodity...")}
                icon={<Icon name="search" size={17} />}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            {/* Village Quick-Picker */}
            <div className="flex items-center gap-2 bg-[#f7f4ef] border border-border rounded-xl px-3 py-2 shrink-0 text-xs">
              <Icon name="pin" size={14} className="text-primary shrink-0" />
              <select
                value={selectedVillageId}
                onChange={e => handleVillageSelect(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                title={t("select_village", "Select Village / Area")}
              >
                <option value="">{t("select_village", "Select Village / Area")}</option>
                {PUNJAB_FARMING_HUBS.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Pills & Summary (Row 2) */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/60">
            <div className="flex items-center gap-1.5 flex-wrap">
              {filterOptions.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleFilterClick(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    activeFilter === f.id
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-[#f7f4ef] text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Comparison Highlights */}
            <div className="text-xs text-muted-foreground flex items-center gap-2 shrink-0">
              <span><strong>{t("comparison", "Comparison")}:</strong> {filteredCentres.length} {t("evaluated", "evaluated")}</span>
              {fastestCentre && (
                <span className="border-l border-border pl-2">
                  {t("fastest", "Fastest")}: <strong className="text-green-700">{fastestCentre.name.split(" ")[0]} ({fastestCentre.wait})</strong>
                </span>
              )}
            </div>
          </div>

          {/* Location Notice */}
          {locationNotice && (
            <div className="flex items-center justify-between text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg">
              <span className="flex items-center gap-1.5">
                <Icon name="alert" size={13} className="text-amber-600" />
                <span>{locationNotice}</span>
              </span>
              <button onClick={() => setLocationNotice(null)} className="font-bold text-amber-800/70 hover:text-amber-900">
                ✕
              </button>
            </div>
          )}
        </div>

        {/* 12-Column Split: 6 cols Primary Comparison Cards + 6 cols Secondary Google Map Locator */}
        <div className="grid grid-cols-12 gap-5 items-start">
          
          {/* LEFT: PRIMARY DECISION CARDS (6 Cols) */}
          <div ref={cardListRef} className="col-span-6 space-y-3 max-h-[820px] overflow-y-auto pr-1">
            
            {filteredCentres.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Icon name="search" size={36} className="mx-auto mb-2 opacity-30" />
                <p className="font-bold text-foreground text-sm">{t("no_centres_found", "No matching procurement centres")}</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your search terms or filter selection.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setQuery("");
                    setActiveFilter("All");
                    setLocationNotice(null);
                  }}
                >
                  {t("reset_filters", "Reset Filters")}
                </Button>
              </Card>
            ) : (
              filteredCentres.map(c => {
                const isSelected = c.id === selectedCenter?.id;
                const isOpen = c.status === "open";
                const isDelayed = c.status === "delayed" || c.status === "limited";
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${c.coordinates.lat},${c.coordinates.lng}`;

                return (
                  <div
                    key={c.id}
                    id={`centre-card-${c.id}`}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-primary ring-2 ring-primary/25 shadow-md"
                        : "bg-white border-border hover:border-primary/40 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground text-base font-display">{c.name}</h3>
                          {isSelected && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {t("selected", "Selected")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Icon name="pin" size={12} className="text-muted-foreground/70" />
                          <span>{c.address}</span>
                        </p>
                      </div>
                      <StatusBadge
                        status={c.status === "delayed" ? "limited" : c.status}
                        label={
                          isOpen
                            ? t("open_now", "● Open")
                            : isDelayed
                            ? t("status_delayed", "▲ Delayed")
                            : t("closed", "○ Closed")
                        }
                      />
                    </div>

                    {/* 3-Column Key Decision Grid: Distance + Wait + Availability */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-[#fcfaf7] border border-border/80 my-2 text-center text-xs">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">{t("distance", "Distance")}</p>
                        <p className="font-bold text-foreground text-sm mt-0.5">{c.dist}</p>
                        <p className="text-[9px] text-muted-foreground">
                          {c.isCalculated ? t("from_farm", "From farm") : c.distKm <= 5 ? t("closest", "Closest") : "Standard"}
                        </p>
                      </div>
                      <div className="border-x border-border/70">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">{t("stat_est_wait", "Est. Wait")}</p>
                        <p className={`font-bold text-sm mt-0.5 ${isDelayed ? "text-amber-700" : isOpen ? "text-green-700" : "text-muted-foreground"}`}>
                          {c.wait}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{c.waitMin <= 15 ? t("fastest", "Fastest") : "Normal"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">{t("available_slots", "Available Slots")}</p>
                        <p className={`font-bold text-sm mt-0.5 ${c.slots > 0 ? "text-green-700" : "text-muted-foreground"}`}>
                          {c.slots > 0 ? `${c.slots} ${t("slots_label", "slots")}` : t("none", "None")}
                        </p>
                        <p className="text-[9px] text-muted-foreground">Next: {c.nextSlot}</p>
                      </div>
                    </div>

                    {/* Driving Route ETA snippet if selected */}
                    {isSelected && routeInfo && (
                      <div className="bg-secondary/60 border border-green-200 rounded-xl px-3 py-1.5 text-xs flex items-center justify-between text-foreground mb-2">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span>🚗</span>
                          <span>{t("drive_time_est", "Drive Time")}: <strong>~{routeInfo.duration}</strong> ({routeInfo.distance})</span>
                        </span>
                        <span className="text-[11px] text-primary font-bold">Via {routeInfo.summary}</span>
                      </div>
                    )}

                    {/* Actions: View Centre, Book Slot & Directions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("center-detail");
                          }}
                          className="text-muted-foreground hover:text-primary font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Icon name="warehouse" size={14} />
                          {t("btn_view_centre", "View Centre")}
                        </button>
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-primary font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Icon name="arrow_right" size={13} className={isRTL ? "rotate-180" : ""} />
                          {t("get_directions", "Get Directions")}
                        </a>
                      </div>

                      <Button
                        size="sm"
                        variant={isSelected ? "primary" : "outline"}
                        disabled={c.status === "closed"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(c.id);
                          navigate("slot-booking");
                        }}
                        icon={<Icon name="calendar" size={14} />}
                      >
                        {t("btn_book_slot", "Book Slot")}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT: SECONDARY GOOGLE MAP LOCATOR & SPOTLIGHT (6 Cols) */}
          <div className="col-span-6 sticky top-20 space-y-3">
            
            {/* Real Interactive Google Map Component */}
            <GoogleMapComponent
              centres={filteredCentres}
              selectedCenterId={selectedCenter?.id || null}
              onSelectCenter={(id) => {
                setSelectedId(id);
                const cardEl = document.getElementById(`centre-card-${id}`);
                if (cardEl) {
                  cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }
              }}
              onViewCenter={() => navigate("center-detail")}
              onBookSlot={(id) => {
                setSelectedId(id);
                navigate("slot-booking");
              }}
              userLocation={userLocation}
              onUserLocationChange={(coords) => {
                setUserLocation(coords);
                setSelectedVillageId("");
              }}
              onRouteInfoChange={(info) => setRouteInfo(info)}
              className="h-[460px] shadow-xs"
            />

            {/* Sleek Selected Centre Spotlight */}
            {selectedCenter && (
              <Card className="p-3.5 border border-border bg-white shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-display text-foreground">
                      {selectedCenter.name}
                    </h3>
                    <span className="text-[11px] font-bold text-primary bg-secondary px-2 py-0.5 rounded-md border border-green-200">
                      {selectedCenter.dist}
                    </span>
                  </div>
                  <StatusBadge
                    status={selectedCenter.status === "delayed" ? "limited" : selectedCenter.status}
                    label={
                      selectedCenter.status === "open"
                        ? t("open_now", "● Open")
                        : selectedCenter.status === "delayed"
                        ? t("status_delayed", "▲ Delayed")
                        : t("closed", "○ Closed")
                    }
                  />
                </div>

                {/* Best time & Drive time info row */}
                <div className="flex items-center justify-between text-xs bg-[#fcfaf7] border border-border rounded-xl px-3 py-2">
                  <span className="text-muted-foreground">
                    {t("best_time_to_visit", "Best time to visit")}: <strong className="text-primary">{selectedCenter.lowestWaitTime}</strong>
                  </span>
                  {routeInfo ? (
                    <span className="text-foreground font-semibold flex items-center gap-1">
                      <span>🚗</span>
                      <span>~{routeInfo.duration} ({routeInfo.distance})</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{selectedCenter.operatingHours}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-0.5">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate("slot-booking")}
                    icon={<Icon name="calendar" size={14} />}
                    disabled={selectedCenter.status === "closed"}
                  >
                    {t("btn_book_slot_here", "Book Slot Here")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("center-detail")}
                    icon={<Icon name="warehouse" size={14} />}
                  >
                    {t("btn_view_details", "Details")}
                  </Button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.coordinates.lat},${selectedCenter.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-1"
                    title={t("get_directions", "Get Directions")}
                  >
                    <Icon name="pin" size={13} className="text-primary" />
                    <span>{t("get_directions", "Directions")}</span>
                  </a>
                </div>
              </Card>
            )}

          </div>

        </div>

      </div>


      {/* ═════════════════════════════════════════════════════════════════════
          MOBILE VIEW (md:hidden, List-First with Map View & Bottom Sheet)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3 px-4 pt-3 pb-24">
        
        <div>
          <h1 className="text-lg font-bold font-display text-foreground">
            {t("find_center_title", "Find a Procurement Centre")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("find_center_sub", "Compare nearby centres by distance, queue wait, and slots.")}
          </p>
        </div>

        {/* Search */}
        <Input
          placeholder={t("search_center_placeholder", "Search centre, village, or district...")}
          icon={<Icon name="search" size={16} />}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        {/* View Switcher: List vs Map */}
        <div className="flex bg-muted rounded-xl p-1">
          <button
            onClick={() => setMobileView("list")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileView === "list" ? "bg-white text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            {t("view_list", "List View")} ({filteredCentres.length})
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileView === "map" ? "bg-white text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            {t("view_map", "Map View")}
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {filterOptions.map(f => (
            <button
              key={f.id}
              onClick={() => handleFilterClick(f.id)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                activeFilter === f.id
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Mobile View Content: List vs Map */}
        {mobileView === "list" ? (
          <div className="space-y-2.5">
            {filteredCentres.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                <Icon name="search" size={28} className="mx-auto mb-2 opacity-30" />
                <p className="font-bold text-foreground text-sm">{t("no_centres_found", "No matching centres")}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setQuery("");
                    setActiveFilter("All");
                  }}
                >
                  {t("reset_filters", "Reset Filters")}
                </Button>
              </Card>
            ) : (
              filteredCentres.map(c => (
                <Card
                  key={c.id}
                  className={`p-3 transition-all border cursor-pointer ${
                    c.id === selectedId ? "border-primary ring-2 ring-primary/20 shadow-xs" : "border-border"
                  }`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-bold text-foreground text-sm font-display">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">{c.address} · {c.dist}</p>
                    </div>
                    <StatusBadge
                      status={c.status === "delayed" ? "limited" : c.status}
                      label={
                        c.status === "open"
                          ? t("open_now", "Open")
                          : c.status === "delayed"
                          ? t("status_delayed", "Delayed")
                          : t("closed", "Closed")
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1 py-1.5 px-2 rounded-lg bg-[#fcfaf7] border border-border my-1.5 text-center text-xs">
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">{t("distance", "Distance")}</p>
                      <p className="font-bold text-foreground">{c.dist}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">{t("stat_est_wait", "Est. Wait")}</p>
                      <p className={`font-bold ${c.status === "delayed" ? "text-amber-700" : "text-primary"}`}>{c.wait}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">{t("available_slots", "Slots")}</p>
                      <p className={`font-bold ${c.slots > 0 ? "text-green-700" : "text-muted-foreground"}`}>
                        {c.slots > 0 ? `${c.slots} slots` : "None"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      fullWidth
                      disabled={c.status === "closed"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(c.id);
                        navigate("slot-booking");
                      }}
                    >
                      {t("btn_book_slot", "Book Slot")}
                    </Button>
                    <Button
                      size="sm"
                      fullWidth
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(c.id);
                        navigate("center-detail");
                      }}
                    >
                      {t("btn_view_details", "Details")}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Real Interactive Mobile Google Map with Logistics Controls */}
            <GoogleMapComponent
              centres={filteredCentres}
              selectedCenterId={selectedCenter?.id || null}
              onSelectCenter={(id) => setSelectedId(id)}
              onViewCenter={() => navigate("center-detail")}
              onBookSlot={(id) => {
                setSelectedId(id);
                navigate("slot-booking");
              }}
              userLocation={userLocation}
              onUserLocationChange={(coords) => setUserLocation(coords)}
              onRouteInfoChange={(info) => setRouteInfo(info)}
              className="h-[420px] shadow-xs"
            />

            {/* Selected Centre Bottom Sheet Card */}
            {selectedCenter && (
              <Card className="p-3.5 border-2 border-primary/30 shadow-xs bg-white space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-foreground font-display">{selectedCenter.name}</h3>
                      <span className="text-[10px] font-bold text-primary bg-secondary px-1.5 py-0.5 rounded">
                        {selectedCenter.dist}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedCenter.address}</p>
                  </div>
                  <StatusBadge
                    status={selectedCenter.status === "delayed" ? "limited" : selectedCenter.status}
                    label={
                      selectedCenter.status === "open"
                        ? t("open_now", "Open")
                        : selectedCenter.status === "delayed"
                        ? t("status_delayed", "Delayed")
                        : t("closed", "Closed")
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-1 py-1.5 px-2 rounded-lg bg-[#fcfaf7] border border-border text-center text-xs">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">{t("operating_hours", "Hours")}</p>
                    <p className="font-bold text-foreground text-[11px]">{selectedCenter.operatingHours}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">{t("stat_est_wait", "Wait")}</p>
                    <p className={`font-bold text-[11px] ${selectedCenter.status === "delayed" ? "text-amber-700" : "text-primary"}`}>
                      {selectedCenter.wait}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">{t("available_slots", "Slots")}</p>
                    <p className="font-bold text-green-700 text-[11px]">{selectedCenter.slots} open</p>
                  </div>
                </div>

                {routeInfo && (
                  <div className="bg-secondary/70 border border-green-200 rounded-lg p-2 text-xs flex items-center justify-between text-foreground">
                    <span className="flex items-center gap-1">
                      <span>🚗</span>
                      <span>Drive: <strong>~{routeInfo.duration}</strong> ({routeInfo.distance})</span>
                    </span>
                    <span className="text-[10px] font-bold text-primary">via {routeInfo.summary}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    fullWidth
                    disabled={selectedCenter.status === "closed"}
                    onClick={() => {
                      setSelectedId(selectedCenter.id);
                      navigate("slot-booking");
                    }}
                  >
                    {t("btn_book_slot_here", "Book Slot Here")}
                  </Button>
                  <Button
                    size="sm"
                    fullWidth
                    variant="outline"
                    onClick={() => navigate("center-detail")}
                  >
                    {t("btn_view_details", "Details")}
                  </Button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.coordinates.lat},${selectedCenter.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center shrink-0"
                    title="Directions"
                  >
                    <Icon name="pin" size={15} className="text-primary" />
                  </a>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Mobile Sticky Action Bar */}
        {selectedCenter && selectedCenter.status === "open" && (
          <div className="fixed bottom-14 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-border z-30">
            <div className="max-w-md mx-auto">
              <Button
                fullWidth
                size="md"
                onClick={() => navigate("slot-booking")}
                icon={<Icon name="calendar" size={16} />}
              >
                {t("btn_book_slot_here", "Book Slot at")} {selectedCenter.name.split(" ")[0]}
              </Button>
            </div>
          </div>
        )}

      </div>

    </FarmerShell>
  );
}
