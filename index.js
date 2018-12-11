/*
* Whois-Info
* Yanglin <Mail@yanglin.me>
* https://github.com/FurqanSoftware/node-whois
* https://github.com/imnotjames/whois-servers
* https://www.iana.org/domains/root/db
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
    let server = null
    let tld = domain
    while (tld && !server) {
      if (Servers[tld] && Servers[tld][0]) {
        server = Servers[tld][0]
      }
      tld = tld.replace(/^.+?(\.|$)/, '')
    }
    if (!server) {
      throw new Error('No whois server is known')
    } else {
      return _lookup(server, domain)
    }
  }
}

const _lookup = (server, domain) => {
  domain = domain.toLowerCase()
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
    socket.once('close', () => resolve(parseRaw(data, domain)))
    socket.on('error', error => reject(error))
    socket.on('timeout', () => socket.destroy())
  })
}

const parseRaw = (data, domain) => {
  const split = data.split(/\r?\n/)
  const startReg = new RegExp(domain, 'i')
  const endReg = /^\s*[#%>-]/

  let start = null
  let end = null
  let parsed = []

  for (let index = 0; index < split.length; index ++) {
    let line = split[index]
    // Start with domain name
    if (start == null) {
      if (startReg.test(line)) start = index
    }
    if (start != null && index >= start) {
      // End with notice
      if (end == null && endReg.test(line)) {
        break
      }
      parsed.push(line.trim())
    }
  }
  // Start with multi-line
  if (parsed.length && parsed[0].toLowerCase() === domain) {
    parsed.unshift(split[start - 1].trim())
  }
  return parsed.join('\n')
}

module.exports = { lookup, _lookup }
