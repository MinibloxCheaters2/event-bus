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

I'm not duplicating this in the README, as the module doc already covers it.
