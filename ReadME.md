# Event Bus

An EventBus using decorators, originated from [Spherical](https://codeberg.org/Miniblox/Spherical),
but this code is from [Vape Rewrite](https://codeberg.org/Miniblox/VapeRewrite).
Generated using Grok because I'm lazy.
This EventBus looks a lot like Google's event bus and other similar event buses in Java,
because I like it that way (and also event buses in TS don't really look good).

Cool features:

- Strict-ish types (if you are missing parameters, it won't error, but if you add more or change the type, it will error)
- Decorators recommended, but `on` and `off` are available as methods on the bus itself.
- You don't need to spam a bunch of `on`/`off` calls

## License

AGPL, womp womp.

## Usage

### Setup

Define events (technically "optional", but you probably want this):
```ts
interface Events {
  EventA: string;
  EventB: string;
}
```
(maybe I'll make it `unknown[] | unknown` so multiple args works)

Then, create a new EventBus:
```ts
const bus = new EventBus<Events>();
```

### Subscribing and Unsubscribing listeners

Call `EventBus#registerSubscriber(Object)` to register a subscriber:
```ts
bus.registerSubscriber(this);
```

Call `EventBus#unregisterSubscriber(Object)` to unregister a subscriber:
```ts
bus.unregisterSubscriber(this);
```

### Subscribing to events


While events can be subscribed to using `Bus#on`, `Bus#once`, `Bus#onceB`, and `Bus#off`, it is most recommended to use the `@Subscribe` decorator.

> [!CAUTION]
> the `@Subscribe` decorator will **NOT** work if the method is a [JS private method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements) (starts with `#`).
> If using TypeScript, `private name() {}` in classes will work fine, since they mean nothing at runtime.
> You can also work around this by simply making a wrapper member with a private identifier that then isn't a private identifier, and subscribing that object instead.

```ts
class MyClass {
  @Subscribe("event") // TS access flags work, but private members (i.e. `#myMethod`) will **NOT** work
  private myMethod() {
    console.log("on event!");
  }
}
```
