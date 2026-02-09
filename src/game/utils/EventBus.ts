// 순수 TypeScript로 구현한 EventEmitter (Phaser 의존성 제거)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallback = (...args: any[]) => void;

class SimpleEventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
    return this;
  }

  off(event: string, callback?: EventCallback): this {
    if (!callback) {
      this.events.delete(event);
    } else {
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    }
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(event: string, ...args: any[]): this {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(...args));
    }
    return this;
  }

  once(event: string, callback: EventCallback): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    return this.on(event, onceCallback);
  }

  removeAllListeners(): this {
    this.events.clear();
    return this;
  }
}

// React와 Phaser 간의 통신을 위한 EventBus
export const EventBus = new SimpleEventEmitter();

// 이벤트 타입 정의
export const GameEvents = {
  // React -> Phaser
  MOVE_AGENT: 'moveAgent',
  SET_AGENT_ACTIVE: 'setAgentActive',
  SHOW_BUBBLE: 'showBubble',
  HIDE_BUBBLE: 'hideBubble',
  START_CONVERSATION: 'startConversation',

  // Phaser -> React
  GAME_READY: 'gameReady',
  AGENT_CLICKED: 'agentClicked',
  AGENT_MOVED: 'agentMoved',
} as const;
