import type { DomainEventMap, DomainEventName,} from "./event.types.js";

type EventHandler<K extends DomainEventName> = (
    payload: DomainEventMap[K]
) => void | Promise<void>;

class EventBus {
    private handlers = new Map<
        DomainEventName,
        Set<EventHandler<any>>
    >();

    on<K extends DomainEventName>(
        eventName: K,
        handler: EventHandler<K>
    ) {
        let eventHandlers = this.handlers.get(eventName);

        if (!eventHandlers) {
            eventHandlers = new Set();
            this.handlers.set(eventName, eventHandlers);
        }

        eventHandlers.add(handler);

        return () => {
            eventHandlers.delete(handler);
        };
    }

    async emit<K extends DomainEventName>(
        eventName: K,
        payload: DomainEventMap[K]
    ) {
        const eventHandlers = this.handlers.get(eventName);

        if (!eventHandlers) {
            return;
        }

        await Promise.all(
            Array.from(eventHandlers).map(async (handler) => {
                try {
                    await handler(payload);
                } catch (error) {
                    console.error(
                        `[EVENT BUS] Subscriber failed for "${eventName}"`,
                        error
                    );
                }
            })
        );
    }
}

export const eventBus = new EventBus();