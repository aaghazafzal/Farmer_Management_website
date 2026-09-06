export type CentreStatus = "open" | "limited" | "closed";

export interface Centre {
  id: string;
  code: string;
  name: string;
  address: string;
  location: string;
  district: string;
  state: string;
  status: CentreStatus;
  operating_hours: string;
  phone: string;
  default_slot_capacity: number;
  max_daily_capacity: number;
  weighbridge_count: number;
  commodities: string[];
  queue_count?: number;
  available_slots_today?: number;
}

export type QueueStatus = "waiting" | "arrived" | "processing" | "delayed" | "completed" | "cancelled";

export interface QueueEntry {
  id: string;
  centre_id: string;
  booking_id: string;
  queue_number: number;
  token: string;
  farmer_name: string;
  phone_masked: string;
  slot_time: string;
  commodity: string;
  quantity: string;
  status: QueueStatus;
  arrived_at?: string;
  processing_started_at?: string;
  completed_at?: string;
  delay_reason?: string;
  weighbridge_bay?: string;
}

export type SlotStatus = "available" | "limited" | "full" | "closed";

export interface Slot {
  id: string;
  slot_ref: string;
  centre_id: string;
  date: string;
  start_time: string;
  end_time: string;
  time: string;
  capacity: number;
  booked: number;
  available: number;
  status: SlotStatus;
  commodity: string;
  is_closed: boolean;
  note?: string;
}

export interface FarmerRecord {
  id: string;
  farmer_reference: string;
  name: string;
  phone: string;
  phone_masked: string;
  village: string;
  district: string;
  state: string;
  land_area: string;
  total_deliveries: number;
  active_booking?: {
    token: string;
    commodity: string;
    quantity: string;
    slot_time: string;
    status: string;
  };
}

export interface ProcurementRecord {
  id: string;
  booking_id: string;
  farmer_id: string;
  farmer_name: string;
  token: string;
  commodity: string;
  gross_weight_quintals?: number;
  tare_weight_quintals?: number;
  net_weight_quintals?: number;
  moisture_percent?: number;
  grade?: "Grade A" | "Standard" | "Substandard";
  msp_per_quintal: number;
  total_payout?: number;
  weighbridge_bay?: string;
  status: "waiting" | "in_progress" | "verification" | "completed" | "delayed" | "rejected";
  delay_reason?: string;
  started_at?: string;
  completed_at?: string;
  history?: Array<{
    timestamp: string;
    status: string;
    staff_name: string;
    note?: string;
  }>;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  type: "weather" | "queue" | "operational";
  created_at: string;
  is_active: boolean;
  centre_id?: string;
}

export interface AuditLogItem {
  id: string;
  actor_name: string;
  actor_id: string;
  centre_id: string;
  action: string;
  details: string;
  entity_type: string;
  entity_id: string;
  time_ist: string;
}

export interface DailyReport {
  date: string;
  centre_name: string;
  total_farmers_served: number;
  total_procured_quintals: number;
  total_msp_disbursed: number;
  breakdown_by_crop: Record<string, number>;
  average_wait_minutes: number;
  weighbridge_utilization_pct: number;
}
