const whois = require('./')


// Domain lookup
/*
* OK
* No Match
* Not Found
* Error: Not Supported
* Error: No Data
* Error: Connect
*/
let tests = ['yanglin.me', 'nomatchdomain.com', 'notfounddomain.me', 'nic.ba', 'nic.es', 'nic.ke']
;[...tests].forEach(domain => {
  whois.lookup(domain)
    .then(data => console.log(domain, data.split(/\n/)[0]))
    .catch(e => console.log(domain, e.message))
})

// IP lookup
let ip = '8.8.8.8'
whois.lookup(ip)
  .then(data => console.log(data))
  .catch(e => console.log(ip, e.message))
