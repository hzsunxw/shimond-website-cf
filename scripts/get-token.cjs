const fs = require('fs')
const p = 'C:/Users/sunxw/AppData/Roaming/xdg.config/.wrangler/config/default.toml'
const t = fs.readFileSync(p, 'utf8')
const m = t.match(/oauth_token\s*=\s*"([^"]+)"/)
if (m) console.log(m[1])
else console.log('NOT FOUND')
