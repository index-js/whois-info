const { lookup } = require('./')

lookup('yanglin.me')
  .then(data => console.log(data))
  .catch(e => console.log(e))
