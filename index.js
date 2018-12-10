/*
* Whois-JS
* Yanglin <Mail@yanglin.me>
* https://github.com/FurqanSoftware/node-whois
* https://github.com/imnotjames/whois-servers
*/

const net = require('net')
const Servers = require('./servers.json')

const timeout = 30000
const ipHost = 'whois.ripe.net'

const punycode = /[^\0-\x7E]/
const email = /@/


const lookup = domain => {
  if (!domain) {
    throw new Error('Please enter domain name')
  } else if (punycode.test(domain)) {
    throw new Error('Please use the "xn--" format for the Punycode domain')
  } else if (email.test(domain)) {
    throw new Error('Email address not supported')
  } else if (net.isIP(domain) !== 0) {
    return _lookup(ipHost, domain)
  } else {
    let server = findServer(domain)
    if (!server) {
      throw new Error('No whois server is known')
    } else {
      return _lookup(server, domain)
    }
  }
}

const findServer = domain => {
  let server
  let tld = domain

  while (tld && !server) {
    server = Servers[tld]
    tld = tld.replace(/^.+?(\.|$)/, '')
  }

  return server
}

const _lookup = (server, domain) => {
  const query = domain + '\r\n'

  if (typeof server === 'string') {
    let [host, port] = server.split(':')
    server = { host, port }
  }
  if (!server.port) {
    server.port = 43
  }

  return new Promise((resolve, reject) => {
    const socket = net.connect(server)
    socket.setTimeout(timeout)
    socket.setEncoding('utf8')
    socket.write(query)
    
    let data = ''
    socket.on('data', chunk => data += chunk.replace(/\r/g, ''))
    socket.on('close', () => resolve(data))
    socket.on('error', error => reject(error))
    socket.on('timeout', () => socket.destroy())
  })
}

module.exports = { lookup, _lookup }
