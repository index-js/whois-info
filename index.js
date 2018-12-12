/*
* Whois-Info
* Yanglin <Mail@yanglin.me>
* https://github.com/FurqanSoftware/node-whois
* https://github.com/imnotjames/whois-servers
* https://www.iana.org/domains/root/db
*/

const net = require('net')
const TLD_SERVER = require('./tld.json')

const timeout = 30000
const ipHost = 'whois.ripe.net'

const punycode = /[^\0-\x7E]/
const email = /@/


const lookup = domain => {
  return new Promise((resolve, reject) => {
    if (!domain) {
      reject(new Error('Please enter domain name'))
    } else if (punycode.test(domain)) {
      reject(new Error('Please use the "xn--" format for the Punycode domain'))
    } else if (email.test(domain)) {
      reject(new Error('Email address not supported'))
    } else if (net.isIP(domain) !== 0) {
      resolve(_lookup(ipHost, domain))
    } else {
      let [tld, ...args] = domain.split('.').reverse()
      if (args.length == 0) {
        reject(new Error('Invalid domain'))
      }

      if (TLD_SERVER[tld] && TLD_SERVER[tld][0]) {
        resolve(_lookup(TLD_SERVER[tld][0], domain))
      } else {
        reject(new Error('No whois server is known'))
      }
    }
  })
}

const _lookup = (server, domain) => {
  domain = domain.toLowerCase().trim()
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
    socket.once('close', () => {
      let result = parseRaw(data, domain)
      if (result) resolve(result)
      else reject(new Error('No data'))
    })
    socket.on('error', error => reject(error))
    socket.on('timeout', () => socket.destroy())
  })
}

const parseRaw = (data, domain) => {
  if (!data) return ''

  const split = data.split(/\r?\n/)
  const startReg = new RegExp(domain, 'i')
  const notFound = /(Not\s+Found|No\s+Match)/i
  const copyReg = /Copyright/i
  const descReg = /Whois\s+(Inaccuracy|Infor|Lookup)/i
  const otherReg = /^\s*[#%>-]/

  let start = null
  let end = null
  let parsed = []

  for (let index = 0; index < split.length; index ++) {
    let line = split[index].trim()
    // Start with domain name
    if (start == null) {
      if (startReg.test(line) || notFound.test(line)) {
        start = index
        // Start with multi-line
        if (line.toLowerCase() === domain) {
          parsed.push(split[index - 1].trim())
        }
        parsed.push(line)
      }
    } else if (index > start) {
      if (end != null) break
      // End with copyright, description and other
      else if (copyReg.test(line) || descReg.test(line) || otherReg.test(line)) break
      // Up to 1 blank line
      else if (line == '' && split[index - 1].trim() == '') continue
      else parsed.push(line.trim())
    }
  }
  return parsed.join('\n')
}

module.exports = { lookup, _lookup }
