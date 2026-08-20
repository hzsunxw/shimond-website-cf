const { DatabaseSync } = require('node:sqlite')
const fs = require('fs')

const db = new DatabaseSync('dev.db')
const rows = db.prepare("SELECT sql, type FROM sqlite_master WHERE type IN ('table','index') AND sql IS NOT NULL ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 END").all()
const sql = rows.map(r => r.sql + ';').join('\n\n')
fs.writeFileSync('prisma/migrations/0001_init.sql', sql, 'utf8')
console.log('Migration SQL written, lines:', sql.split('\n').length)
db.close()
