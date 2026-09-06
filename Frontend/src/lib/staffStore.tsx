"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type QueueStatus = "processing" | "waiting" | "arrived" | "delayed" | "completed";
export type SlotStatus = "available" | "limited" | "full" | "closed";
export type AlertType = "queue" | "slot" | "centre" | "procurement" | "general";
export type AlertStatus = "active" | "scheduled" | "sent" | "expired";

export interface CentreInfo {
  id: string;
  name: string;
  address: string;
  location: string;
  operatingHours: string;
  status: "open" | "closed" | "maintenance";
  manager: string;
  defaultSlotCapacity: number;
  maxDailyCapacity: number;
}

export interface StaffUser {
  id: string;
  name: string;
  role: string;
  staffId: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export interface QueueItem {
  id: string;
  n: string; // e.g. "#05"
  num: number;
  name: string;
  phoneMasked: string;
  bookingId: string;
  slot: string;
  arrived: string;
  status: QueueStatus;
  commodity: string;
  quantity: string;
  estimatedWait: string;
  delayReason?: string;
  weighbridgeBay?: string;
}

export interface ProcurementSlot {
  id: string;
  time: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  status: SlotStatus;
  commodity: string;
  note?: string;
}

export interface FarmerRecord {
  id: string;
  reference: string;
  name: string;
  phoneMasked: string;
  village: string;
  currentBookingId: string;
  queueNumber: string;
  commodity: string;
  quantity: string;
  status: QueueStatus;
  lastUpdated: string;
  totalDeliveries: number;
  landArea: string;
}

export interface CentreAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  audience: string;
  status: AlertStatus;
  timestamp: string;
  reach: number;
}

export interface AuditLogEntry {
  id: string;
  time: string;
  staffName: string;
  action: string;
  details?: string;
}

export interface StaffToast {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: "Q-05",
    n: "#05",
    num: 5,
    name: "Gurpreet Singh",
    phoneMasked: "98••••5512",
    bookingId: "KS-240912-0811",
    slot: "10:00–10:30 AM",
    arrived: "10:12 AM",
    status: "processing",
    commodity: "Wheat",
    quantity: "65 quintals",
    estimatedWait: "Processing (Bay 1)",
    weighbridgeBay: "Bay 1",
  },
  {
    id: "Q-06",
    n: "#06",
    num: 6,
    name: "Suresh Patel",
    phoneMasked: "97••••4421",
    bookingId: "KS-240912-0820",
    slot: "10:30–11:00 AM",
    arrived: "10:22 AM",
    status: "waiting",
    commodity: "Wheat",
    quantity: "50 quintals",
    estimatedWait: "~12 min",
    weighbridgeBay: "Bay 1",
  },
  {
    id: "Q-07",
    n: "#07",
    num: 7,
    name: "Anjali Devi",
    phoneMasked: "99••••7822",
    bookingId: "KS-240912-0835",
    slot: "10:30–11:00 AM",
    arrived: "10:30 AM",
    status: "arrived",
    commodity: "Wheat",
    quantity: "40 quintals",
    estimatedWait: "~24 min",
    weighbridgeBay: "Bay 2",
  },
  {
    id: "Q-08",
    n: "#08",
    num: 8,
    name: "Ramesh Kumar",
    phoneMasked: "98••••3210",
    bookingId: "KS-240912-0842",
    slot: "10:30–11:00 AM",
    arrived: "10:20 AM",
    status: "waiting",
    commodity: "Wheat",
    quantity: "85 quintals",
    estimatedWait: "~35 min",
    weighbridgeBay: "Bay 2",
  },
  {
    id: "Q-09",
    n: "#09",
    num: 9,
    name: "Meera Joshi",
    phoneMasked: "97••••2290",
    bookingId: "KS-240912-0854",
    slot: "11:00–11:30 AM",
    arrived: "10:45 AM",
    status: "delayed",
    commodity: "Wheat",
    quantity: "70 quintals",
    estimatedWait: "~48 min",
    delayReason: "Moisture content 15.2% (>14% limit) — sun drying required",
    weighbridgeBay: "Bay 1",
  },
  {
    id: "Q-10",
    n: "#10",
    num: 10,
    name: "Arun Sharma",
    phoneMasked: "98••••6642",
    bookingId: "KS-240912-0863",
    slot: "11:00–11:30 AM",
    arrived: "10:55 AM",
    status: "waiting",
    commodity: "Mustard",
    quantity: "40 quintals",
    estimatedWait: "~58 min",
    weighbridgeBay: "Bay 2",
  },
];

const INITIAL_SLOTS: ProcurementSlot[] = [
  { id: "SLOT-08", time: "08:00–09:00", startTime: "08:00", endTime: "09:00", capacity: 20, booked: 12, status: "available", commodity: "Wheat · Paddy" },
  { id: "SLOT-09", time: "09:00–10:00", startTime: "09:00", endTime: "10:00", capacity: 20, booked: 18, status: "limited", commodity: "Wheat · Paddy" },
  { id: "SLOT-10", time: "10:00–11:00", startTime: "10:00", endTime: "11:00", capacity: 20, booked: 20, status: "full", commodity: "Wheat" },
  { id: "SLOT-11", time: "11:00–12:00", startTime: "11:00", endTime: "12:00", capacity: 20, booked: 14, status: "available", commodity: "Wheat · Mustard" },
  { id: "SLOT-12", time: "12:00–13:00", startTime: "12:00", endTime: "13:00", capacity: 20, booked: 9, status: "available", commodity: "Wheat" },
  { id: "SLOT-14", time: "14:00–15:00", startTime: "14:00", endTime: "15:00", capacity: 20, booked: 16, status: "limited", commodity: "Wheat · Paddy" },
  { id: "SLOT-15", time: "15:00–16:00", startTime: "15:00", endTime: "16:00", capacity: 20, booked: 11, status: "available", commodity: "Wheat" },
];

const INITIAL_FARMERS: FarmerRecord[] = [
  {
    id: "F-10482",
    reference: "F-10482",
    name: "Ramesh Kumar",
    phoneMasked: "98••••3210",
    village: "Kotla Kalan, Amritsar",
    currentBookingId: "KS-240912-0842",
    queueNumber: "#08",
    commodity: "Wheat",
    quantity: "85 quintals",
    status: "waiting",
    lastUpdated: "10:14 AM",
    totalDeliveries: 6,
    landArea: "4.5 Acres",
  },
  {
    id: "F-10471",
    reference: "F-10471",
    name: "Gurpreet Singh",
    phoneMasked: "98••••5512",
    village: "Majitha, Amritsar",
    currentBookingId: "KS-240912-0811",
    queueNumber: "#05",
    commodity: "Wheat",
    quantity: "65 quintals",
    status: "processing",
    lastUpdated: "10:48 AM",
    totalDeliveries: 14,
    landArea: "8.5 Acres",
  },
  {
    id: "F-10491",
    reference: "F-10491",
    name: "Suresh Patel",
    phoneMasked: "97••••4421",
    village: "Focal Point Rural, Amritsar",
    currentBookingId: "KS-240912-0820",
    queueNumber: "#06",
    commodity: "Wheat",
    quantity: "50 quintals",
    status: "waiting",
    lastUpdated: "10:22 AM",
    totalDeliveries: 9,
    landArea: "5.0 Acres",
  },
  {
    id: "F-10503",
    reference: "F-10503",
    name: "Anjali Devi",
    phoneMasked: "99••••7822",
    village: "Ajnala Road, Amritsar",
    currentBookingId: "KS-240912-0835",
    queueNumber: "#07",
    commodity: "Wheat",
    quantity: "40 quintals",
    status: "arrived",
    lastUpdated: "10:30 AM",
    totalDeliveries: 5,
    landArea: "3.5 Acres",
  },
  {
    id: "F-10518",
    reference: "F-10518",
    name: "Meera Joshi",
    phoneMasked: "97••••2290",
    village: "Kot Khalsa, Amritsar",
    currentBookingId: "KS-240912-0854",
    queueNumber: "#09",
    commodity: "Wheat",
    quantity: "70 quintals",
    status: "delayed",
    lastUpdated: "10:45 AM",
    totalDeliveries: 11,
    landArea: "6.0 Acres",
  },
  {
    id: "F-10527",
    reference: "F-10527",
    name: "Arun Sharma",
    phoneMasked: "98••••6642",
    village: "Chheharta Rural, Amritsar",
    currentBookingId: "KS-240912-0863",
    queueNumber: "#10",
    commodity: "Mustard",
    quantity: "40 quintals",
    status: "waiting",
    lastUpdated: "10:55 AM",
    totalDeliveries: 8,
    landArea: "4.0 Acres",
  },
  {
    id: "F-10444",
    reference: "F-10444",
    name: "Harbhajan Lal",
    phoneMasked: "97••••8831",
    village: "Kotla Kalan, Amritsar",
    currentBookingId: "KS-240912-0802",
    queueNumber: "#04",
    commodity: "Wheat",
    quantity: "90 quintals",
    status: "completed",
    lastUpdated: "09:50 AM",
    totalDeliveries: 15,
    landArea: "9.0 Acres",
  },
];

const INITIAL_ALERTS: CentreAlert[] = [
  {
    id: "ALT-01",
    type: "queue",
    title: "Queue #09 delayed — verification in progress",
    message: "Queue processing is temporarily slower than expected. Estimated wait for subsequent tokens has increased by ~15 minutes.",
    audience: "Farmers with active bookings",
    status: "active",
    timestamp: "10:40 AM",
    reach: 27,
  },
  {
    id: "ALT-02",
    type: "slot",
    title: "10:00 AM slot reached full capacity",
    message: "The 10:00–11:00 AM procurement slot is now 100% booked (20/20). Recommend booking 11:00 or 12:00 slots.",
    audience: "All farmers viewing centre",
    status: "active",
    timestamp: "09:55 AM",
    reach: 14,
  },
  {
    id: "ALT-03",
    type: "general",
    title: "7 new bookings received for 14:00 slot",
    message: "Afternoon slot bookings have been recorded and registered into queue schedule.",
    audience: "Centre Staff",
    status: "sent",
    timestamp: "09:20 AM",
    reach: 7,
  },
  {
    id: "ALT-04",
    type: "procurement",
    title: "84 farmers processed successfully today",
    message: "Morning procurement target achieved with 100% electronic weighbridge verification.",
    audience: "All Staff",
    status: "sent",
    timestamp: "09:05 AM",
    reach: 84,
  },
  {
    id: "ALT-05",
    type: "centre",
    title: "Weighing bay routine calibration after 4:00 PM",
    message: "Scheduled maintenance for Bay 1 weighbridge sensor. Procurement remains uninterrupted on Bay 2.",
    audience: "All farmers & staff",
    status: "scheduled",
    timestamp: "Today · 4:00 PM",
    reach: 45,
  },
];

const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "LOG-01",
    time: "10:48 AM",
    staffName: "Raj Kumar",
    action: "Updated Token #05 (Gurpreet Singh)",
    details: "Waiting → Processing (Bay 1 weighbridge)",
  },
  {
    id: "LOG-02",
    time: "10:45 AM",
    staffName: "Harpreet Kaur",
    action: "Flagged delay for Token #09 (Meera Joshi)",
    details: "Moisture content re-test required (15.2% > 14%)",
  },
  {
    id: "LOG-03",
    time: "10:40 AM",
    staffName: "Raj Kumar",
    action: "Created queue-delay broadcast alert",
    details: "SMS & push notification sent to all active queue holders",
  },
  {
    id: "LOG-04",
    time: "10:22 AM",
    staffName: "Surjit Singh",
    action: "Marked Token #06 (Suresh Patel) as Arrived",
    details: "Gate 2 entry verified with 50 quintals Wheat",
  },
  {
    id: "LOG-05",
    time: "10:20 AM",
    staffName: "Raj Kumar",
    action: "Assigned queue token #08 to Ramesh Kumar",
    details: "Booking KS-240912-0842 · Bay 2 queue position #08",
  },
  {
    id: "LOG-06",
    time: "10:18 AM",
    staffName: "Surjit Singh",
    action: "Checked in Ramesh Kumar vehicle at Gate 2",
    details: "Produce: 85 quintals Wheat · Tractor trolley verified",
  },
  {
    id: "LOG-07",
    time: "09:55 AM",
    staffName: "Raj Kumar",
    action: "Closed 10:00–11:00 AM slot",
    details: "Reached maximum capacity threshold (20/20 farmers)",
  },
  {
    id: "LOG-08",
    time: "08:04 AM",
    staffName: "Raj Kumar",
    action: "Staff portal authenticated login",
    details: "Session opened from Staff Terminal T-01 (KS-STAFF-014)",
  },
];

export interface FarmerBookingModel {
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
  status: "confirmed" | "completed" | "delayed" | "processing";
  queueStatus: string;
  weighbridgeBay: string;
  delayReason?: string;
  arrivalInstructions: string[];
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

export interface FarmerNotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "success" | "info" | "warning" | "error";
}

interface StaffContextType {
  centre: CentreInfo;
  currentUser: StaffUser;
  queue: QueueItem[];
  slots: ProcurementSlot[];
  farmers: FarmerRecord[];
  alerts: CentreAlert[];
  auditLog: AuditLogEntry[];
  toasts: StaffToast[];
  activeQueueCount: number;
  completedTodayCount: number;
  delayedCount: number;
  totalBookedSlots: number;
  todaysFarmersCount: number;

  farmerBooking: FarmerBookingModel;
  farmerNotifications: FarmerNotificationItem[];

  updateQueueStatus: (queueNumber: string, newStatus: QueueStatus, reason?: string) => void;
  callNextToken: () => { calledToken: string; farmerName: string } | null;
  createSlot: (slot: Omit<ProcurementSlot, "id" | "booked" | "status">) => void;
  updateSlotCapacity: (slotId: string, newCapacity: number) => void;
  toggleSlotStatus: (slotId: string) => void;
  createAlert: (alert: Omit<CentreAlert, "id" | "timestamp" | "status" | "reach">) => void;
  dismissAlert: (alertId: string) => void;
  updateCentreProfile: (updates: Partial<CentreInfo>) => void;
  updateNotificationSetting: (key: string, value: boolean) => void;
  notificationSettings: Record<string, boolean>;
  addAuditLog: (action: string, details?: string) => void;
  showToast: (message: string, type?: "success" | "info" | "warning" | "error") => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
}

const STORAGE_KEY = "kisansetu_unified_state_v2";

const INITIAL_CENTRE: CentreInfo = {
  id: "CTR-AMR-001",
  name: "ABC Procurement Centre",
  address: "Main Road, Kotla Kalan, Amritsar",
  location: "Amritsar, Punjab",
  operatingHours: "08:00–17:00",
  status: "open",
  manager: "Raj Kumar",
  defaultSlotCapacity: 20,
  maxDailyCapacity: 140,
};

const INITIAL_STAFF_USER: StaffUser = {
  id: "STF-014",
  name: "Raj Kumar",
  role: "Centre Manager",
  staffId: "KS-STAFF-014",
  lastLogin: "Today, 08:04 AM",
  twoFactorEnabled: true,
};

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [centre, setCentre] = useState<CentreInfo>(INITIAL_CENTRE);
  const [currentUser] = useState<StaffUser>(INITIAL_STAFF_USER);
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [slots, setSlots] = useState<ProcurementSlot[]>(INITIAL_SLOTS);
  const [farmers, setFarmers] = useState<FarmerRecord[]>(INITIAL_FARMERS);
  const [alerts, setAlerts] = useState<CentreAlert[]>(INITIAL_ALERTS);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOG);
  const [toasts, setToasts] = useState<StaffToast[]>([]);

  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>({
    smsEnabled: true,
    advanceAlerts: true,
    delayWarnings: true,
    dailySummaryEmail: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.queue) setQueue(parsed.queue);
        if (parsed.slots) setSlots(parsed.slots);
        if (parsed.farmers) setFarmers(parsed.farmers);
        if (parsed.alerts) setAlerts(parsed.alerts);
        if (parsed.auditLog) setAuditLog(parsed.auditLog);
        if (parsed.centre) setCentre(parsed.centre);
        if (parsed.notificationSettings) setNotificationSettings(parsed.notificationSettings);
      }
    } catch {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.queue) setQueue(parsed.queue);
          if (parsed.slots) setSlots(parsed.slots);
          if (parsed.farmers) setFarmers(parsed.farmers);
          if (parsed.alerts) setAlerts(parsed.alerts);
          if (parsed.auditLog) setAuditLog(parsed.auditLog);
          if (parsed.centre) setCentre(parsed.centre);
          if (parsed.notificationSettings) setNotificationSettings(parsed.notificationSettings);
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const saveStateToStorage = (updates: Partial<{
    queue: QueueItem[];
    slots: ProcurementSlot[];
    farmers: FarmerRecord[];
    alerts: CentreAlert[];
    auditLog: AuditLogEntry[];
    centre: CentreInfo;
    notificationSettings: Record<string, boolean>;
  }>) => {
    try {
      const currentRaw = localStorage.getItem(STORAGE_KEY);
      const existing = currentRaw ? JSON.parse(currentRaw) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...updates }));
    } catch {}
  };

  const activeQueueCount = queue.filter(q => q.status !== "completed").length + 21;
  const completedTodayCount = 84 + queue.filter(q => q.status === "completed").length;
  const delayedCount = queue.filter(q => q.status === "delayed").length + 8;
  const totalBookedSlots = slots.reduce((acc, s) => acc + s.booked, 0);
  const todaysFarmersCount = 142;

  const addAuditLog = useCallback((action: string, details?: string) => {
    const newEntry: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      staffName: currentUser.name,
      action,
      details,
    };
    setAuditLog(prev => {
      const next = [newEntry, ...prev];
      saveStateToStorage({ auditLog: next });
      return next;
    });
  }, [currentUser.name]);

  const showToast = useCallback((message: string, type: "success" | "info" | "warning" | "error" = "success") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const updateQueueStatus = useCallback((queueNumber: string, newStatus: QueueStatus, reason?: string) => {
    let updatedQueue: QueueItem[] = [];
    setQueue(prev => {
      updatedQueue = prev.map(item => item.n === queueNumber ? { ...item, status: newStatus, delayReason: reason !== undefined ? reason : item.delayReason, estimatedWait: newStatus === "processing" ? "Processing (Bay 2)" : newStatus === "completed" ? "Completed" : item.estimatedWait } : item);
      return updatedQueue;
    });

    let updatedFarmers: FarmerRecord[] = [];
    setFarmers(prev => {
      updatedFarmers = prev.map(f => f.queueNumber === queueNumber ? { ...f, status: newStatus, lastUpdated: "Just now" } : f);
      return updatedFarmers;
    });

    saveStateToStorage({ queue: updatedQueue, farmers: updatedFarmers });
    addAuditLog(`Updated Token ${queueNumber} → ${newStatus.toUpperCase()}`, reason ? `Reason: ${reason}` : undefined);
    showToast(`Token ${queueNumber} status updated to ${newStatus}`);
  }, [addAuditLog, showToast]);

  const callNextToken = useCallback(() => {
    const nextWaiting = queue.find(q => q.status === "waiting" || q.status === "arrived");
    if (!nextWaiting) {
      showToast("No farmers currently waiting in queue", "info");
      return null;
    }
    updateQueueStatus(nextWaiting.n, "processing");
    addAuditLog(`Called Next Token: ${nextWaiting.n}`, `${nextWaiting.name} dispatched to weighbridge`);
    showToast(`Dispatched token ${nextWaiting.n} (${nextWaiting.name})`);
    return { calledToken: nextWaiting.n, farmerName: nextWaiting.name };
  }, [queue, updateQueueStatus, addAuditLog, showToast]);

  const createSlot = useCallback((slotData: Omit<ProcurementSlot, "id" | "booked" | "status">) => {
    const newSlot: ProcurementSlot = { ...slotData, id: `SLOT-${Date.now().toString().slice(-4)}`, booked: 0, status: "available" };
    setSlots(prev => {
      const next = [...prev, newSlot];
      saveStateToStorage({ slots: next });
      return next;
    });
    addAuditLog(`Created new slot ${newSlot.time}`, `Capacity: ${newSlot.capacity} bags (${newSlot.commodity})`);
    showToast(`Slot ${newSlot.time} successfully created`);
  }, [addAuditLog, showToast]);

  const updateSlotCapacity = useCallback((slotId: string, newCapacity: number) => {
    setSlots(prev => {
      const next = prev.map(s => s.id === slotId ? { ...s, capacity: newCapacity, status: (s.booked >= newCapacity ? "full" : (s.booked / newCapacity) >= 0.8 ? "limited" : "available") as SlotStatus } : s);
      saveStateToStorage({ slots: next });
      return next;
    });
    addAuditLog(`Adjusted slot ${slotId} capacity`, `New capacity: ${newCapacity}`);
    showToast(`Slot capacity updated to ${newCapacity}`);
  }, [addAuditLog, showToast]);

  const toggleSlotStatus = useCallback((slotId: string) => {
    let toggledTime = "";
    let isNowClosed = false;
    setSlots(prev => {
      const next = prev.map(s => {
        if (s.id === slotId) {
          toggledTime = s.time;
          isNowClosed = s.status !== "closed";
          return { ...s, status: isNowClosed ? ("closed" as SlotStatus) : ("available" as SlotStatus) };
        }
        return s;
      });
      saveStateToStorage({ slots: next });
      return next;
    });
    addAuditLog(`Toggled slot ${toggledTime} status`, isNowClosed ? "Marked as CLOSED" : "REOPENED slot");
    showToast(`Slot ${toggledTime} is now ${isNowClosed ? "closed" : "open"}`);
  }, [addAuditLog, showToast]);

  const createAlert = useCallback((alertData: Omit<CentreAlert, "id" | "timestamp" | "status" | "reach">) => {
    const newAlert: CentreAlert = { ...alertData, id: `ALT-${Date.now().toString().slice(-4)}`, status: "active", timestamp: "Just now", reach: activeQueueCount };
    setAlerts(prev => {
      const next = [newAlert, ...prev];
      saveStateToStorage({ alerts: next });
      return next;
    });
    addAuditLog(`Broadcast alert: ${newAlert.title}`, `Audience: ${newAlert.audience} (${newAlert.reach} reached)`);
    showToast(`Alert broadcasted to ${newAlert.reach} farmers`);
  }, [activeQueueCount, addAuditLog, showToast]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => {
      const next = prev.map(a => a.id === alertId ? { ...a, status: "expired" as AlertStatus } : a);
      saveStateToStorage({ alerts: next });
      return next;
    });
    addAuditLog(`Dismissed alert ${alertId}`);
    showToast("Alert dismissed");
  }, [addAuditLog, showToast]);

  const updateCentreProfile = useCallback((updates: Partial<CentreInfo>) => {
    setCentre(prev => {
      const next = { ...prev, ...updates };
      saveStateToStorage({ centre: next });
      return next;
    });
    addAuditLog("Updated Centre Profile & Jurisdictions");
  }, [addAuditLog]);

  const updateNotificationSetting = useCallback((key: string, value: boolean) => {
    setNotificationSettings(prev => {
      const next = { ...prev, [key]: value };
      saveStateToStorage({ notificationSettings: next });
      return next;
    });
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCentre(INITIAL_CENTRE);
    setQueue(INITIAL_QUEUE);
    setSlots(INITIAL_SLOTS);
    setFarmers(INITIAL_FARMERS);
    setAlerts(INITIAL_ALERTS);
    setAuditLog(INITIAL_AUDIT_LOG);
    showToast("Demo data reset to initial synchronized baseline", "info");
  }, [showToast]);

  const rameshQueueItem = queue.find(q => q.n === "#08") || INITIAL_QUEUE[3];
  const nowServingItem = queue.find(q => q.status === "processing");
  const nowServingToken = nowServingItem ? nowServingItem.n : "#05";
  const rameshIndex = queue.findIndex(q => q.n === "#08");
  const activeAheadCount = rameshIndex >= 0 ? queue.slice(0, rameshIndex).filter(q => q.status !== "completed").length : 3;

  const farmerBooking: FarmerBookingModel = {
    id: "KS-240912-0842",
    centre: centre.name,
    centreAddress: centre.address,
    date: "12 Sep 2026",
    fullDate: "Thursday, 12 September 2026",
    slot: "10:30–11:00 AM",
    gateEntry: "10:15 AM",
    queuePosition: rameshQueueItem.n,
    queueNumber: 8,
    tokensAhead: activeAheadCount,
    nowServing: nowServingToken,
    servingStarted: nowServingItem?.arrived || "10:48 AM",
    estimatedWait: rameshQueueItem.status === "processing" ? "Now Serving (Bay 2)" : rameshQueueItem.status === "completed" ? "Completed" : rameshQueueItem.status === "delayed" ? "Delayed (Moisture Check)" : activeAheadCount > 0 ? `~${activeAheadCount * 12} min` : "Turn is Next!",
    approxTurn: rameshQueueItem.status === "processing" ? "Now at Weighbridge" : "11:15 AM",
    lastUpdated: "Just now",
    commodity: "Wheat",
    quantity: "85 quintals",
    status: rameshQueueItem.status === "processing" ? "processing" : rameshQueueItem.status === "completed" ? "completed" : rameshQueueItem.status === "delayed" ? "delayed" : "confirmed",
    queueStatus: rameshQueueItem.status === "delayed" ? "Delayed" : alerts.some(a => a.type === "queue" && a.status === "active") ? "Queue moving with minor delays" : "Moving normally",
    weighbridgeBay: "Bay 2",
    delayReason: rameshQueueItem.delayReason,
    arrivalInstructions: ["Enter through Gate 2 at 10:15 AM.", "Keep booking reference KS-240912-0842 ready.", "Report to Weighbridge Bay 2 upon token call."],
    procurementDetails: {
      grossWeight: "14,280 kg",
      grossWeightStatus: rameshQueueItem.status === "completed" ? "Final Weighment Done" : "In Progress",
      moisture: "11.8%",
      moistureStatus: "Recorded (Passed <14%)",
      grade: "Grade A",
      gradeStatus: "Recorded",
      inspector: "Harpreet Kaur (KS-STAFF-029)",
    },
  };

  const farmerNotifications: FarmerNotificationItem[] = alerts.map(a => ({
    id: a.id,
    title: a.title,
    desc: a.message,
    time: a.timestamp,
    type: a.type === "queue" ? "warning" : a.type === "procurement" ? "success" : "info",
  }));

  return (
    <StaffContext.Provider
      value={{
        centre,
        currentUser,
        queue,
        slots,
        farmers,
        alerts,
        auditLog,
        toasts,
        activeQueueCount,
        completedTodayCount,
        delayedCount,
        totalBookedSlots,
        todaysFarmersCount,
        farmerBooking,
        farmerNotifications,
        updateQueueStatus,
        callNextToken,
        createSlot,
        updateSlotCapacity,
        toggleSlotStatus,
        createAlert,
        dismissAlert,
        updateCentreProfile,
        updateNotificationSetting,
        notificationSettings,
        addAuditLog,
        showToast,
        removeToast,
        resetAllData,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
}

export function useStaffContext() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaffContext must be used within a StaffProvider");
  }
  return context;
}
