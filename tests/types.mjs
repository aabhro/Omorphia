import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const declarations=readFileSync('types/index.d.ts','utf8');
const catalog=readFileSync('AI/COMPONENT-CATALOG.md','utf8');
const tags=[...catalog.matchAll(/&lt;(ui-[a-z-]+)&gt;/g)].map(x=>x[1]);
for(const tag of new Set(tags)) assert.ok(declarations.includes("'"+tag+"':"),'TypeScript tag map includes '+tag);
for(const symbol of ['version','theme','config','toast','confirm','commands','icons','icon','iconConfig','UIDatePicker','UITimePicker']) assert.match(declarations,new RegExp('\\b'+symbol+'\\b'),'TypeScript declaration includes '+symbol);
console.log('TypeScript declaration checks passed.');
