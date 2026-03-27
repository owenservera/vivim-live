type DemoEvent =
  | 'tab-change'
  | 'preferences-update'
  | 'session-progress'
  | 'error-occurred'
  | 'feature-interaction';

type EventHandler = (payload: any) => void;

class DemoEventBus {
  private listeners = new Map<DemoEvent, Set<EventHandler>>();

  on(event: DemoEvent, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  emit(event: DemoEvent, payload: any): void {
    this.listeners.get(event)?.forEach(handler => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`Event handler error for ${event}:`, err);
      }
    });
  }

  clear(event: DemoEvent): void {
    this.listeners.delete(event);
  }

  clearAll(): void {
    this.listeners.clear();
  }
}

export const demoBus = new DemoEventBus();
