'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
const engine=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
assert.equal(crypto.createHash('sha256').update(engine).digest('hex'),fs.readFileSync(require.resolve('../docs/engine.sha256'),'utf8').trim(),'Existing calendar/payroll engine must be preserved byte-for-byte');
const hashes=JSON.parse(fs.readFileSync(require.resolve('../docs/domain-hashes.json'),'utf8'));
for(const [path,hash] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(require.resolve('../'+path))).digest('hex'),hash,path+' changed');
console.log('PASS original calendar/payroll script and domain modules preserved byte-for-byte');
