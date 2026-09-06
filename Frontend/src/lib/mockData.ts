export interface ProcurementCentre {
  id: number;
  name: string;
  dist: string;
  distKm: number;
  status: "open" | "closed" | "limited" | "delayed";
  nextSlot: string;
  wait: string;
  waitMin: number;
  address: string;
  slots: number;
  operatingHours: string;
  lowestWaitTime: string;
  commodities: string[];
  phone: string;
  incharge: string;
  mapCoords: { x: number; y: number };
  coordinates: { lat: number; lng: number };
}

export interface ActiveBooking {
  id: string;
  centre: string;
  centreAddress: string;
  date: string;
  fullDate: string;
  slot: string;
  gateEntry: string;
  queuePosition: string;
  queueNumber: number;
  tokensAhead: number;
  nowServing: string;
  servingStarted: string;
  estimatedWait: string;
  approxTurn: string;
  lastUpdated: string;
  commodity: string;
  quantity: string;
  status: "confirmed" | "completed" | "cancelled";
  queueStatus: "Moving normally" | "Delayed" | "Faster than expected" | "Temporarily unavailable";
  arrivalInstructions: string[];
  weighbridgeBay?: string;
  procurementDetails: {
    grossWeight: string;
    grossWeightStatus: string;
    moisture: string;
    moistureStatus: string;
    grade: string;
    gradeStatus: string;
    inspector: string;
  };
}

export const ACTIVE_BOOKING: ActiveBooking = {
  id: "KS-240912-0842",
  centre: "ABC Procurement Centre",
  centreAddress: "Main Road, Kotla Kalan, Amritsar",
  date: "12 Sep 2026",
  fullDate: "Thursday, 12 September 2026",
  slot: "10:30–11:00 AM",
  gateEntry: "10:15 AM",
  queuePosition: "#08",
  queueNumber: 8,
  tokensAhead: 3,
  nowServing: "#05",
  servingStarted: "10:48 AM",
  estimatedWait: "35 min",
  approxTurn: "11:15 AM",
  lastUpdated: "10:14 AM",
  commodity: "Wheat",
  quantity: "85 quintals",
  status: "confirmed",
  queueStatus: "Moving normally",
  weighbridgeBay: "Bay 2",
  arrivalInstructions: [
    "Enter through Gate 2 at 10:15 AM.",
    "Keep booking reference KS-240912-0842 ready.",
    "Report to Weighbridge Bay 2 upon token call.",
  ],
  procurementDetails: {
    grossWeight: "14,280 kg",
    grossWeightStatus: "Completed",
    moisture: "11.8%",
    moistureStatus: "Recorded (Passed <14%)",
    grade: "Grade A",
    gradeStatus: "Recorded",
    inspector: "Harpreet Kaur (KS-STAFF-029)",
  },
};

export const CENTRES: ProcurementCentre[] = [
  {
    id: 1,
    name: "ABC Procurement Centre",
    dist: "4.2 km",
    distKm: 4.2,
    status: "open",
    nextSlot: "11:30 AM",
    wait: "24 min",
    waitMin: 24,
    address: "Main Road, Kotla Kalan, Amritsar",
    slots: 8,
    operatingHours: "08:00–17:00",
    lowestWaitTime: "11:30 AM",
    commodities: ["Wheat", "Paddy", "Mustard"],
    phone: "+91 98765-11001",
    incharge: "Raj Kumar, Centre Manager (KS-STAFF-014)",
    mapCoords: { x: 140, y: 120 },
    coordinates: { lat: 31.6340, lng: 74.8723 },
  },
  {
    id: 2,
    name: "Sector 12 Mandi Centre",
    dist: "6.8 km",
    distKm: 6.8,
    status: "delayed",
    nextSlot: "1:00 PM",
    wait: "40 min",
    waitMin: 40,
    address: "Sector 12, Focal Point, Amritsar",
    slots: 3,
    operatingHours: "08:00–17:00",
    lowestWaitTime: "2:00 PM",
    commodities: ["Wheat", "Paddy"],
    phone: "+91 98765-22002",
    incharge: "Centre Staff",
    mapCoords: { x: 260, y: 160 },
    coordinates: { lat: 31.6054, lng: 74.9125 },
  },
  {
    id: 3,
    name: "Ropar Grain Depot",
    dist: "11.1 km",
    distKm: 11.1,
    status: "open",
    nextSlot: "10:45 AM",
    wait: "10 min",
    waitMin: 10,
    address: "NH 21, Industrial Area, Ropar",
    slots: 14,
    operatingHours: "08:30–17:30",
    lowestWaitTime: "10:45 AM",
    commodities: ["Wheat", "Maize", "Barley"],
    phone: "+91 98765-33003",
    incharge: "Centre Staff",
    mapCoords: { x: 380, y: 90 },
    coordinates: { lat: 30.9661, lng: 76.5272 },
  },
  {
    id: 4,
    name: "Nakodar Procurement Point",
    dist: "18.5 km",
    distKm: 18.5,
    status: "closed",
    nextSlot: "Tomorrow 08:00 AM",
    wait: "—",
    waitMin: 999,
    address: "GT Road, Near Grain Market, Nakodar",
    slots: 0,
    operatingHours: "09:00–16:00",
    lowestWaitTime: "Tomorrow 08:00 AM",
    commodities: ["Wheat", "Paddy"],
    phone: "+91 98765-44004",
    incharge: "Centre Staff",
    mapCoords: { x: 90, y: 220 },
    coordinates: { lat: 31.1260, lng: 75.4720 },
  },
  {
    id: 5,
    name: "Ajnala Procurement Point",
    dist: "22.0 km",
    distKm: 22.0,
    status: "open",
    nextSlot: "2:00 PM",
    wait: "15 min",
    waitMin: 15,
    address: "Near Old Tehsil, Ajnala",
    slots: 6,
    operatingHours: "08:30–17:00",
    lowestWaitTime: "2:00 PM",
    commodities: ["Wheat", "Mustard"],
    phone: "+91 98765-55005",
    incharge: "Centre Staff",
    mapCoords: { x: 70, y: 80 },
    coordinates: { lat: 31.8400, lng: 74.7600 },
  },
];

export const COMPLETED_BOOKINGS = [
  {
    id: "KS-240905-0334",
    centre: "Sector 12 Centre",
    date: "5 Sep 2026",
    slot: "2:00–2:30 PM",
    status: "completed" as const,
    commodity: "Wheat",
    quantity: "120 quintals",
    reference: "REF-SEC12-905",
  },
  {
    id: "KS-240828-0119",
    centre: "ABC Procurement Centre",
    date: "28 Aug 2026",
    slot: "9:30–10:00 AM",
    status: "completed" as const,
    commodity: "Paddy",
    quantity: "60 quintals",
    reference: "REF-ABC-828",
  },
  {
    id: "KS-240815-0902",
    centre: "Ropar Grain Depot",
    date: "15 Aug 2026",
    slot: "11:00–11:30 AM",
    status: "completed" as const,
    commodity: "Maize",
    quantity: "95 quintals",
    reference: "REF-ROP-815",
  },
  {
    id: "KS-240722-0441",
    centre: "ABC Procurement Centre",
    date: "22 Jul 2026",
    slot: "10:00–10:30 AM",
    status: "completed" as const,
    commodity: "Wheat",
    quantity: "110 quintals",
    reference: "REF-ABC-722",
  },
  {
    id: "KS-240618-0210",
    centre: "Sector 12 Centre",
    date: "18 Jun 2026",
    slot: "14:00–14:30 PM",
    status: "completed" as const,
    commodity: "Barley",
    quantity: "75 quintals",
    reference: "REF-SEC12-618",
  },
  {
    id: "KS-240530-0115",
    centre: "ABC Procurement Centre",
    date: "30 May 2026",
    slot: "09:00–09:30 AM",
    status: "completed" as const,
    commodity: "Mustard",
    quantity: "50 quintals",
    reference: "REF-ABC-530",
  },
];

export const CANCELLED_BOOKINGS = [
  {
    id: "KS-240820-0281",
    centre: "Ropar Grain Depot",
    date: "20 Aug 2026",
    slot: "11:00–11:30 AM",
    status: "cancelled" as const,
    commodity: "Wheat",
    quantity: "80 quintals",
    reason: "Rescheduled by farmer due to harvest schedule",
  },
  {
    id: "KS-240710-0199",
    centre: "Sector 12 Centre",
    date: "10 Jul 2026",
    slot: "15:00–15:30 PM",
    status: "cancelled" as const,
    commodity: "Paddy",
    quantity: "65 quintals",
    reason: "Cancelled by farmer",
  },
];
