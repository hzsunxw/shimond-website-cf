// Add Resend DNS records to Cloudflare via API
const ZONE = 'shimondpvc.com'
const TOKEN = process.env.CF_API_TOKEN || ''

// Get zone ID first, then add records
const https = require('https')

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': data.length } : {})
      }
    }, (res) => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }))
    })
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function main() {
  // 1. Get zone ID
  const zones = await apiCall('GET', `?name=${ZONE}`)
  if (!zones.body.result || !zones.body.result.length) {
    console.error('Zone not found:', zones.body)
    process.exit(1)
  }
  const zoneId = zones.body.result[0].id
  console.log('Zone ID:', zoneId)

  // 2. DNS records to add
  const records = [
    // DKIM
    { type: 'TXT', name: 'resend._domainkey', content: 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCztKs6FRGPeNN9ECtLVhRSF4lI4kos6sds3hxo1z3QQHI5Ozxz9TZHBkc0ks8qYmpBgzQikf2Dih3tu+k8HDQA3f7wdtjE4Hzh/9VaUxUTlnWYutUYumCB60Xlk0qXwNX9/kdO+INpHgiymdKLa9cICKTepViAXDI1oUhUSsixFQIDAQAB' },
    // SPF - MX
    { type: 'MX', name: 'send', content: 'feedback-smtp.us-east-1.amazonses.com', priority: 10 },
    // SPF - TXT
    { type: 'TXT', name: 'send', content: 'v=spf1 include:amazonses.com ~all' },
    // DMARC
    { type: 'TXT', name: '_dmarc', content: 'v=DMARC1; p=none;' },
  ]

  // 3. Add each record
  for (const r of records) {
    const body = { type: r.type, name: r.name, content: r.content, ttl: 1 }
    if (r.priority) body.priority = r.priority
    const res = await apiCall('POST', `/${zoneId}/dns_records`, body)
    if (res.body.success) {
      console.log(`✅ ${r.type} ${r.name} -> added`)
    } else {
      console.log(`❌ ${r.type} ${r.name} -> ${JSON.stringify(res.body.errors)}`)
    }
  }
}

main().catch(console.error)
