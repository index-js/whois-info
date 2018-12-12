# Whois-js
> Whois lookup

## Installation

Install via `npm`:

```
$ npm i whois-info
```

## Usage

``` js
const { lookup } = require('whois-info')

lookup('yanglin.me')
  .then(data => console.log(data))
  .catch(e => console.log(e))

```

## Authors

**Yanglin** ([i@yangl.in](mailto:mail@yanglin.me))


## License

Copyright (c) 2018 Yanglin

Released under the MIT license
