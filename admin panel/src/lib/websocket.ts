type MessageCallback = (data: any) => void;

export class QueueWebSocketClient {
  private ws: WebSocket | null = null;
  private centreId: string | null = null;
  private listeners: Set<MessageCallback> = new Set();
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  public isConnected: boolean = false;

  connect(centreId: string) {
    if (this.ws && this.centreId === centreId) return;

    this.disconnect();
    this.centreId = centreId;

    const wsBase = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const url = `${wsBase}/api/v1/ws/queue/${centreId}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.notifyListeners({ type: "CONNECTION_OPEN" });
        // Start ping heartbeat
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 15000);
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.notifyListeners(payload);
        } catch {
          // ignore non-json
        }
      };

      this.ws.onclose = () => {
        this.cleanup();
        this.notifyListeners({ type: "CONNECTION_CLOSED" });
        // Attempt reconnect after 5s
        this.reconnectTimer = setTimeout(() => {
          if (this.centreId) this.connect(this.centreId);
        }, 5000);
      };

      this.ws.onerror = () => {
        this.cleanup();
      };
    } catch {
      this.cleanup();
    }
  }

  subscribe(callback: MessageCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(data: any) {
    this.listeners.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error("WS listener error:", err);
      }
    });
  }

  private cleanup() {
    this.isConnected = false;
    if (this.pingInterval) clearInterval(this.pingInterval);
  }

  disconnect() {
    this.cleanup();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.centreId = null;
  }
}

export const queueWs = new QueueWebSocketClient();
