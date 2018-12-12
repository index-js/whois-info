# Whois-js
> Whois lookup

## Installation

Install via `npm`:

```
$ npm i whois-info
```

## Usage

Domain lookup

``` js
/*
* OK
* No Match
* Not Found
* Error: Not Supported
* Error: No Data
* Error: Connect
*/

let tests = ['yanglin.me', 'nomatchdomain.com', 'notfounddomain.me', 'nic.ba', 'nic.es', 'nic.ke']
// ;[...tests].forEach(domain => {
//   lookup(domain)
//     .then(data => console.log(domain, data.split(/\n/)[0]))
//     .catch(e => console.log(domain, e.message))
// })
```

IP lookup
``` js
let ip = '8.8.8.8'
lookup(ip)
  .then(data => console.log(data))
  .catch(e => console.log(ip, e.message))
```

## Authors

**Yanglin** ([i@yangl.in](mailto:mail@yanglin.me))


## License

Copyright (c) 2018 Yanglin

Released under the MIT license
