import { StudentNote } from '../types';

export type RealtimeEvent =
  | { type: 'NOTE_ADDED'; note: StudentNote }
  | { type: 'NOTE_LIKED'; noteId: string; likes: number }
  | { type: 'NOTE_DELETED'; noteId: string }
  | { type: 'TEACHER_REPLY'; note: StudentNote };

type Listener = (event: RealtimeEvent) => void;

class RealtimeHub {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('teachers_day_realtime_hub');
        this.channel.onmessage = (messageEvent) => {
          if (messageEvent.data && typeof messageEvent.data === 'object') {
            this.notifyListeners(messageEvent.data as RealtimeEvent);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization failed, falling back to local events', err);
      }
    }

    // Also listen to window storage events for browsers where BroadcastChannel is constrained
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'teachers_day_realtime_event' && e.newValue) {
          try {
            const eventData = JSON.parse(e.newValue);
            this.notifyListeners(eventData);
          } catch {
            // ignore parse errors
          }
        }
      });
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(event: RealtimeEvent) {
    // Notify in-tab listeners
    this.notifyListeners(event);

    // Notify other tabs via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {
        console.warn('Failed to broadcast via channel', err);
      }
    }

    // Fallback sync via localStorage event
    try {
      localStorage.setItem('teachers_day_realtime_event', JSON.stringify({ ...event, _ts: Date.now() }));
    } catch {
      // ignore
    }
  }

  private notifyListeners(event: RealtimeEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in realtime listener', err);
      }
    });
  }
}

export const realtimeHub = new RealtimeHub();
