"""
KisanSetu Backend — Real-time WebSocket Gateway
================================================
Provides real-time pub/sub broadcasting for procurement centre dashboards
and farmer mobile views.

Channels:
  /api/v1/ws/queue/{centre_id}  — Live queue updates & status changes
"""
from __future__ import annotations

import json
import logging
from collections import defaultdict
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from bson import ObjectId

from app.core.database import get_database
from app.services.queue_service import get_queue_state

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["Real-time"])


class ConnectionManager:
    """Manages active WebSocket connections grouped by centre_id."""

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = defaultdict(set)

    async def connect(self, centre_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[centre_id].add(websocket)
        logger.info("WS client connected to centre %s (total: %d)", centre_id, len(self.active_connections[centre_id]))

    def disconnect(self, centre_id: str, websocket: WebSocket):
        if centre_id in self.active_connections:
            self.active_connections[centre_id].discard(websocket)
            if not self.active_connections[centre_id]:
                del self.active_connections[centre_id]
        logger.info("WS client disconnected from centre %s", centre_id)

    async def broadcast(self, centre_id: str, message: dict):
        """Broadcast JSON payload to all active clients for a given centre."""
        if centre_id not in self.active_connections:
            return

        dead_connections = set()
        payload = json.dumps(message)

        for ws in self.active_connections[centre_id]:
            try:
                await ws.send_text(payload)
            except Exception as e:
                logger.warning("Error sending WS message: %s", e)
                dead_connections.add(ws)

        for dead in dead_connections:
            self.disconnect(centre_id, dead)


manager = ConnectionManager()


async def broadcast_queue_update(centre_id: str, event_type: str, data: dict):
    """Utility function to broadcast queue events from services."""
    await manager.broadcast(
        centre_id=centre_id,
        message={"type": event_type, "centre_id": centre_id, "data": data},
    )


@router.websocket("/queue/{centre_id}")
async def queue_websocket(websocket: WebSocket, centre_id: str):
    """
    WebSocket endpoint for live centre queue updates.
    On connection, sends immediate snapshot of current queue.
    Listens for client pings and heartbeat messages.
    """
    await manager.connect(centre_id, websocket)

    try:
        # Send initial snapshot
        db = get_database()
        if db is not None:
            try:
                state = await get_queue_state(db, centre_id)
                await websocket.send_text(json.dumps({"type": "QUEUE_SNAPSHOT", "data": state}))
            except Exception as ex:
                logger.warning("Could not send initial queue snapshot: %s", ex)

        # Keep connection open and respond to heartbeats
        while True:
            text = await websocket.receive_text()
            try:
                data = json.loads(text)
                if data.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except Exception:
                pass

    except WebSocketDisconnect:
        manager.disconnect(centre_id, websocket)
    except Exception as exc:
        logger.error("WebSocket unexpected error: %s", exc)
        manager.disconnect(centre_id, websocket)
