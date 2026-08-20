const dns = require('dns')
dns.setDefaultResultOrder('ipv4first')
const resolver = new dns.Resolver()
resolver.setServers(['1.1.1.1', '8.8.8.8'])

const checks = [
  ['TXT', 'resend._domainkey.shimondpvc.com'],
  ['MX', 'send.shimondpvc.com'],
  ['TXT', 'send.shimondpvc.com'],
  ['TXT', '_dmarc.shimondpvc.com'],
]

let done = 0
checks.forEach(([type, domain]) => {
  resolver.resolve(domain, type, (err, addrs) => {
    console.log(type, domain, ':', err ? '❌ ' + err.code : '✅ ' + JSON.stringify(addrs))
    if (++done === checks.length) process.exit(0)
  })
})
