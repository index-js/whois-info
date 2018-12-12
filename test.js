const { lookup } = require('./')

/*
* OK
* No Match
* Not Found
* Error: Not Supported
* Error: No Data
* Error: Connect
*/

;['yanglin.me', 'nomatchdomain.com', 'fedcba.me', 'fedcba.ba', 'nodata.es', 'fedcba.ke'].forEach(domain => {
  lookup(domain)
    .then(data => console.log(domain, data.split(/\n/)[0]))
    .catch(e => console.log(domain, e.message))
})
