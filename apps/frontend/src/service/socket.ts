import { BACKEND_URL } from './consts';
import { getAuthToken } from './auth';

type EventHandler = (data: any) => void;

class WsClient {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<EventHandler>>();
  private _connected = false;
  private shouldReconnect = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  get connected() {
    return this._connected;
  }

  connect() {
    if (this._connected || this.ws) return;
    this.shouldReconnect = true;
    this.doConnect();
  }

  private doConnect() {
    const origin = BACKEND_URL || window.location.origin;
    const base = origin.replace(/^http/, 'ws');
    const token = getAuthToken();
    const url = token ? `${base}?token=${token}` : base;

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this._connected = true;
    };

    this.ws.onmessage = (msg) => {
      try {
        const { event, data } = JSON.parse(msg.data);
        const handlers = this.listeners.get(event);
        if (handlers) handlers.forEach((h) => h(data));
      } catch (e) {
        console.error('[WS] Bad message:', e);
      }
    };

    this.ws.onclose = () => {
      this._connected = false;
      this.ws = null;
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose fires after onerror
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this._connected = false;
  }

  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler?: EventHandler) {
    if (handler) {
      this.listeners.get(event)?.delete(handler);
    } else {
      this.listeners.delete(event);
    }
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.doConnect();
    }, 3000);
  }
}

export const socket = new WsClient();
