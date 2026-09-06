import { MOCK_CENTRES, MOCK_QUEUE_ENTRIES, MOCK_SLOTS, MOCK_FARMERS, MOCK_PROCUREMENTS, MOCK_ALERTS, MOCK_AUDIT_LOGS, MOCK_DAILY_REPORT } from "./mockAdminData";
import { Centre, QueueEntry, Slot, FarmerRecord, ProcurementRecord, AlertItem, AuditLogItem, DailyReport } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const API_BASE = `${BACKEND_URL}/api/v1`;

// Fallback in-memory state when backend is disconnected
let localCentres = [...MOCK_CENTRES];
let localQueue = [...MOCK_QUEUE_ENTRIES];
let localSlots = [...MOCK_SLOTS];
let localProcurements = [...MOCK_PROCUREMENTS];
let localAlerts = [...MOCK_ALERTS];
let localAuditLogs = [...MOCK_AUDIT_LOGS];

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("admin_token") || "demo-admin-uid-001"
      : "demo-admin-uid-001";

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch {
    // Graceful fallback to local mock state
    return null;
  }
}

export const api = {
  async getCentres(): Promise<Centre[]> {
    const data = await apiFetch<Centre[]>("/centres");
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return localCentres;
  },

  async getQueue(centreId: string): Promise<QueueEntry[]> {
    const data = await apiFetch<{ entries: QueueEntry[] }>(`/queue/${centreId}`);
    if (data && Array.isArray(data.entries)) {
      return data.entries;
    }
    return localQueue.filter((q) => q.centre_id === centreId || !q.centre_id);
  },

  async callNextToken(centreId: string, bay?: string): Promise<QueueEntry | null> {
    const data = await apiFetch<QueueEntry>(`/queue/${centreId}/call-next`, {
      method: "POST",
      body: JSON.stringify({ weighbridge_bay: bay || "Weighbridge Bay 1" }),
    });
    if (data) return data;

    // Local fallback: advance next arrived/waiting to processing
    const nextWaiting = localQueue.find((q) => q.status === "waiting" || q.status === "arrived");
    if (nextWaiting) {
      nextWaiting.status = "processing";
      nextWaiting.processing_started_at = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      nextWaiting.weighbridge_bay = bay || "Weighbridge Bay 1";
      return { ...nextWaiting };
    }
    return null;
  },

  async updateQueueStatus(entryId: string, status: string, bay?: string): Promise<QueueEntry | null> {
    const data = await apiFetch<QueueEntry>(`/queue/entry/${entryId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, weighbridge_bay: bay }),
    });
    if (data) return data;

    // Local fallback
    const item = localQueue.find((q) => q.id === entryId);
    if (item) {
      item.status = status as any;
      if (bay) item.weighbridge_bay = bay;
      if (status === "arrived") item.arrived_at = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (status === "completed") item.completed_at = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return { ...item };
    }
    return null;
  },

  async delayQueueEntry(entryId: string, reason: string): Promise<QueueEntry | null> {
    const data = await apiFetch<QueueEntry>(`/queue/entry/${entryId}/delay`, {
      method: "PATCH",
      body: JSON.stringify({ delay_reason: reason }),
    });
    if (data) return data;

    const item = localQueue.find((q) => q.id === entryId);
    if (item) {
      item.status = "delayed";
      item.delay_reason = reason;
      return { ...item };
    }
    return null;
  },

  async getSlots(centreId: string, date?: string): Promise<Slot[]> {
    const query = date ? `?date=${date}` : "";
    const data = await apiFetch<Slot[]>(`/centres/${centreId}/slots${query}`);
    if (data && Array.isArray(data) && data.length > 0) {
      return data.map((s: any) => ({
        ...s,
        time: s.time || `${s.start_time}–${s.end_time}`,
      }));
    }
    return localSlots.filter((s) => s.centre_id === centreId || !s.centre_id);
  },

  async updateSlotCapacity(slotId: string, capacity: number): Promise<Slot | null> {
    const data = await apiFetch<Slot>(`/slots/${slotId}/capacity`, {
      method: "PATCH",
      body: JSON.stringify({ capacity }),
    });
    if (data) return data;

    const slot = localSlots.find((s) => s.id === slotId);
    if (slot) {
      slot.capacity = capacity;
      slot.available = Math.max(0, capacity - slot.booked);
      return { ...slot };
    }
    return null;
  },

  async toggleSlotClosed(slotId: string, close: boolean): Promise<Slot | null> {
    const endpoint = close ? `/slots/${slotId}/close` : `/slots/${slotId}/reopen`;
    const data = await apiFetch<Slot>(endpoint, { method: "POST" });
    if (data) return data;

    const slot = localSlots.find((s) => s.id === slotId);
    if (slot) {
      slot.is_closed = close;
      slot.status = close ? "closed" : "available";
      return { ...slot };
    }
    return null;
  },

  async getFarmers(): Promise<FarmerRecord[]> {
    const data = await apiFetch<FarmerRecord[]>("/staff/farmers");
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return MOCK_FARMERS;
  },

  async getProcurements(): Promise<ProcurementRecord[]> {
    return localProcurements;
  },

  async updateProcurement(procId: string, updates: Partial<ProcurementRecord>): Promise<ProcurementRecord | null> {
    const data = await apiFetch<ProcurementRecord>(`/procurements/${procId}/details`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    if (data) return data;

    const item = localProcurements.find((p) => p.id === procId);
    if (item) {
      Object.assign(item, updates);
      if (updates.gross_weight_quintals && updates.tare_weight_quintals) {
        item.net_weight_quintals = Math.round((updates.gross_weight_quintals - updates.tare_weight_quintals) * 10) / 10;
        item.total_payout = Math.round(item.net_weight_quintals * item.msp_per_quintal);
      }
      return { ...item };
    }
    return null;
  },

  async getAlerts(): Promise<AlertItem[]> {
    const data = await apiFetch<AlertItem[]>("/alerts");
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return localAlerts;
  },

  async createAlert(alert: Omit<AlertItem, "id" | "created_at" | "is_active">): Promise<AlertItem> {
    const newAlert: AlertItem = {
      ...alert,
      id: `alt-${Date.now()}`,
      created_at: "Just now",
      is_active: true,
    };
    localAlerts.unshift(newAlert);
    return newAlert;
  },

  async getDailyReport(centreId: string): Promise<DailyReport> {
    const data = await apiFetch<DailyReport>(`/reports/daily?centre_id=${centreId}`);
    if (data) return data;
    return MOCK_DAILY_REPORT;
  },

  async getAuditLogs(centreId: string): Promise<AuditLogItem[]> {
    const data = await apiFetch<AuditLogItem[]>(`/reports/audit-log?centre_id=${centreId}`);
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return localAuditLogs;
  },
};
