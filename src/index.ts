/**
 * An EventBus using decorators, originated from [Spherical](https://codeberg.org/Miniblox/Spherical),
 * but this code is from [Vape Rewrite](https://codeberg.org/Miniblox/VapeRewrite).
 * Generated using Grok because I'm lazy.
 * This EventBus looks a lot like Google's event bus and other similar event buses in Java, because I like it that way
 * (and also event buses in TS don't really look good).
 * @module
 */

/**
 * Map of event name -> argument type
 */
export type EventDict = Record<string, unknown>;

interface HandlerEntry<E = unknown> {
  handler: (payload: E) => void;
  priority: number;
}

interface AdditionalProperties<T extends EventDict> {
  __handlers: {
    event: PropertyKey;
    handler: (value: unknown) => void;
  }[];
  __subscriptions: Subscription<T>[];
}

const DEFAULT_PRIORITY = 1;

/**
 * A type-safe event bus that uses decorators to register and emit events.
 * You can still invoke `on` / `off` / `once` / etc, but the decorator is the preferred way to subscribe.
 * @see {@link Subscribe} the decorator to subscribe with
 */
export default class EventBus<Events extends EventDict> {
  private listeners: Partial<{
    [K in keyof Events]: Array<HandlerEntry<Events[K]>>;
  }> = {};

  on<K extends keyof Events>(
    event: K,
    listener: Events[K] extends void
      ? () => void
      : (payload: Events[K]) => void,
    priority: number = DEFAULT_PRIORITY,
  ): void {
    this.listeners[event] ??= [];
    this.listeners[event]?.push({ handler: listener, priority });
    // higher priority first
    this.listeners[event]?.sort((a, b) => b.priority - a.priority);
  }

  once<K extends keyof Events>(
    event: K,
    listener: Events[K] extends void
      ? () => void
      : (payload: Events[K]) => void,
    priority: number = DEFAULT_PRIORITY,
  ): void {
    const handler = ((payload: Events[K]) => {
      listener(payload);
      this.off(event, handler);
    }) as Events[K] extends void ? () => void : (payload: Events[K]) => void;
    this.on(event, handler, priority);
  }
  onceB<K extends keyof Events>(
    event: K,
    listener: Events[K] extends void
      ? () => boolean
      : (payload: Events[K]) => boolean,
    priority: number = DEFAULT_PRIORITY,
  ): void {
    const handler = ((payload: Events[K]) => {
      const r = listener(payload);
      if (r) this.off(event, handler);
    }) as Events[K] extends void ? () => void : (payload: Events[K]) => void;
    this.on(event, handler, priority);
  }

  off<K extends keyof Events>(
    event: K,
    listener: Events[K] extends void
      ? () => void
      : (payload: Events[K]) => void,
  ): void {
    const handlers = this.listeners[event];
    if (handlers) {
      this.listeners[event] = handlers.filter(
        (entry) => entry.handler !== listener,
      );
      if (this.listeners[event]?.length === 0) {
        delete this.listeners[event];
      }
    }
  }

  emit<K extends keyof Events>(
    event: K,
    ...payload: Events[K] extends void ? [] : [Events[K]]
  ): void {
    const handlers = this.listeners[event];
    if (!handlers) return;
    for (const { handler } of handlers) {
      if (payload?.[0]) {
        handler(payload[0]);
      } else {
        (handler as () => void)();
      }
    }
  }

  registerSubscriber<T>(instance: T): void {
    const proto = instance as AdditionalProperties<Events>;
    const subscriptions: Subscription<Events>[] = proto.__subscriptions;
    if (!subscriptions) return;
    for (const sub of subscriptions) {
      const handler = (instance as { [k: typeof sub.method]: () => void })[
        sub.method
      ]!.bind(instance);
      const inst = instance as AdditionalProperties<Events>;
      inst.__handlers ??= [];
      inst.__handlers.push({
        event: sub.event,
        handler,
      });
      this.on(
        sub.event as keyof Events,
        handler,
        sub.priority ?? DEFAULT_PRIORITY,
      );
    }
  }

  unregisterSubscriber<T>(instance: T): void {
    const inst = instance as AdditionalProperties<Events>;
    const handlers = inst.__handlers;
    if (!handlers) return;
    for (const { event, handler } of handlers) {
      //@ts-expect-error: lazy
      this.off(event as keyof Events, handler);
    }
    inst.__handlers = [];
  }
}

interface Subscription<E> {
  event: keyof E;
  method: string;
  priority?: number;
}

/**
 * Subscribe/Handle an event.
 * @param event name of the event to handle/subscribe to
 * @param priority priority of the subscription, determines the order in which handlers are called.
 * @returns decorator function
 */
export function Subscribe<E extends EventDict, K extends keyof E>(
  event: K,
  priority: number = DEFAULT_PRIORITY,
): <A extends E[K] = E[K]>(
  _target: unknown,
  mdc: ClassMethodDecoratorContext<
    unknown,
    A extends void ? () => void : (e: A) => void
  > & {
    name: string;
  },
) => void {
  return <A extends E[K] = E[K]>(
    _target: unknown,
    mdc: ClassMethodDecoratorContext<
      unknown,
      A extends void ? () => void : (e: A) => void
    > & { name: string },
  ) => {
    mdc.addInitializer(function () {
      const t = this as AdditionalProperties<E>;
      t.__subscriptions ??= [];
      const subscriptions: Subscription<E>[] = t.__subscriptions;
      subscriptions.push({ event, method: mdc.name, priority });
    });
  };
}
