import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const dom = new JSDOM('<!doctype html><html data-ui-theme="dark"><body></body></html>', { runScripts:'outside-only', pretendToBeVisual:true, url:'http://localhost/' });
const w=dom.window,d=w.document; w.Element.prototype.scrollIntoView=()=>{}; w.eval(readFileSync('dist/omorphia.min.js','utf8'));
const O=w.Omorphia,mount=(html)=>{const root=d.createElement('div');root.innerHTML=html;d.body.append(root);return root;};
let passed=0;const test=async(name,fn)=>{await fn();passed++;console.log('  ✓ '+name);};
await new Promise(r=>setTimeout(r,0));
await test('registers and exports all advanced elements',()=>{
 const names=['UIColorPicker','UIFileUpload','UICombobox','UIMultiSelect','UINumberInput','UIOtpInput','UIRichTextEditor','UIDataTable','UITreeView','UISplitPanel','UIStepper','UIStep','UITimeline','UITimelineItem','UIRating','UISkeleton','UIEmptyState','UITour'];
 for(const name of names)assert.equal(typeof O[name],'function',name);
 for(const tag of ['ui-color-picker','ui-file-upload','ui-combobox','ui-multi-select','ui-number-input','ui-otp-input','ui-rich-text-editor','ui-data-table','ui-tree-view','ui-split-panel','ui-stepper','ui-step','ui-timeline','ui-timeline-item','ui-rating','ui-skeleton','ui-empty-state','ui-tour'])assert.ok(w.customElements.get(tag),tag);
});
await test('color picker validates hex and alpha values',()=>{
 const el=mount('<ui-color-picker value="#b58bbf" alpha name="accent"></ui-color-picker>').querySelector('ui-color-picker');
 assert.equal(el.value,'#b58bbf');assert.equal(el.setColor('rgba(20,40,60,.5)'),true);assert.equal(el.value,'#14283c80');
 assert.equal(el.setColor('not-a-color'),false);assert.equal(el.querySelector('input[type=hidden]').value,'#14283c80');assert.ok(el.querySelectorAll('.ui-color-preset').length>=5);
});
await test('file upload validates and preserves a valid file on invalid replacement',()=>{
 const el=mount('<ui-file-upload name="docs" accept=".pdf" multiple max-files="2" max-size="100"></ui-file-upload>').querySelector('ui-file-upload');
 assert.equal(el.addFiles([{name:'guide.pdf',type:'application/pdf',size:50},{name:'pic.png',type:'image/png',size:20},{name:'large.pdf',type:'application/pdf',size:200}]).length,1);
 assert.equal(el.files[0].name,'guide.pdf');assert.equal(el.error.hidden,false);assert.equal(el.removeFile(0),true);
 const one=mount('<ui-file-upload name="single" accept=".pdf"></ui-file-upload>').querySelector('ui-file-upload');
 one.addFiles([{name:'a.pdf',type:'',size:10}]);one.addFiles([{name:'bad.txt',type:'text/plain',size:10}]);
 assert.deepEqual(Array.from(one.files,f=>f.name),['a.pdf']);one.addFiles([{name:'b.pdf',type:'',size:10}]);assert.deepEqual(Array.from(one.files,f=>f.name),['b.pdf']);
});
await test('combobox handles local and abortable async results and creation',async()=>{
 const el=mount('<ui-combobox allow-create min-chars="1"></ui-combobox>').querySelector('ui-combobox');
 el.data=[{value:'prod',label:'Production'},{value:'stage',label:'Staging'}];await el.search('prod');assert.equal(el._results[0].value,'prod');
 let aborted=false;el.source=async(q,signal)=>{signal.addEventListener('abort',()=>aborted=true);return [{value:q,label:'Remote '+q}];};
 await el.search('edge');assert.equal(el._results[0].value,'edge');assert.equal(aborted,true);
 let created='';el.addEventListener('ui-create',e=>created=e.detail.value);el.create('custom');assert.equal(created,'custom');assert.equal(el.hiddenValue.value,'custom');
});
await test('multi-select groups options and removes external chips',()=>{
 const el=mount('<ui-multi-select name="topics"><ui-option value="design" group="Work">Design</ui-option><ui-option value="code" group="Work">Code</ui-option></ui-multi-select>').querySelector('ui-multi-select');
 el.choose(el.options[0]);el.choose(el.options[1]);assert.deepEqual(Array.from(el.value),['design','code']);assert.equal(el.chipBar.querySelectorAll('.ui-multi-chip').length,2);
 assert.equal(el.chipBar.closest('button'),null);assert.ok(el.list.querySelector('.ui-select-group'));el.chipBar.querySelector('button').click();assert.deepEqual(Array.from(el.value),['code']);
});
await test('number input clamps limits and precision',()=>{
 const el=mount('<ui-number-input value="1.5" min="0" max="2" step="0.25" precision="2"></ui-number-input>').querySelector('ui-number-input');
 el.stepBy(1);assert.equal(el.value,1.75);el.value=8;assert.equal(el.value,2);assert.equal(el.increment.disabled,true);el.value=-2;assert.equal(el.value,0);assert.equal(el.hiddenValue.value,'0');
});
await test('OTP input combines segmented values and disabled state',()=>{
 const el=mount('<ui-otp-input length="6" name="code"></ui-otp-input>').querySelector('ui-otp-input');el.setValue('123456');
 assert.equal(el.value,'123456');assert.equal(el.inputs.length,6);assert.equal(el.hiddenValue.value,'123456');el.setAttribute('mask','');el.sync();assert.equal(el.inputs[0].value,'1');
 el.disabled=true;assert.ok(el.inputs.every(i=>i.disabled));el.disabled=false;assert.ok(el.inputs.every(i=>!i.disabled));
});
await test('rich text editor sanitizes markup and unsafe links',()=>{
 const el=mount('<ui-rich-text-editor name="body"></ui-rich-text-editor>').querySelector('ui-rich-text-editor');
 el.value='<p>Hello <strong>world</strong><script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(2)">link</a></p>';
 assert.match(el.value,/<strong>world<\\/strong>/);assert.doesNotMatch(el.value,/script|javascript:|onclick/i);assert.equal(el.setLink('javascript:alert(1)'),false);
 assert.equal(el.hiddenValue.value,el.value);
});
await test('data table filters, sorts, paginates, hides columns and selects rows',()=>{
 const el=mount('<ui-data-table page-size="2" selectable sortable filterable></ui-data-table>').querySelector('ui-data-table');
 el.columns=[{key:'name',label:'Name'},{key:'rank',label:'Rank'}];el.data=[{name:'Beta',rank:2},{name:'Alpha',rank:1},{name:'Gamma',rank:3}];
 el.setFilter('alpha');assert.equal(el.filteredRows.length,1);el.setFilter('');el._sort={key:'rank',direction:'asc'};el.render();assert.equal(el.filteredRows[0].row.name,'Alpha');
 el.go(2);assert.equal(el.page,2);el.setColumnVisible('rank',false);el.table.querySelector('tbody input[type=checkbox]').click();assert.equal(el.selectedRows.length,1);
});
await test('tree view expands, selects, and prevents invalid reparenting',()=>{
 const el=mount('<ui-tree-view selectable multiple drag-drop></ui-tree-view>').querySelector('ui-tree-view');
 el.data=[{id:'root',label:'Root',children:[{id:'child',label:'Child'},{id:'target',label:'Target',children:[]}]}];el.expanded=['root'];
 assert.deepEqual(el.visibleNodes().map(({node})=>node.id),['root','child','target']);el.select('child');assert.deepEqual(Array.from(el.value),['child']);
 assert.equal(el.move('child','target'),true);assert.equal(el.find('child').parent.id,'target');assert.equal(el.move('target','child'),false);
 assert.ok(el.expanded.includes('target'));el.toggle('target');assert.ok(!el.expanded.includes('target'));
});
await test('split panel supports bounded pointer and keyboard sizing with persistence',()=>{
 const el=mount('<ui-split-panel direction="horizontal" sizes="40,60" storage-key="test-panel"><div slot="start">Left</div><div slot="end">Right</div></ui-split-panel>').querySelector('ui-split-panel');
 assert.equal(el.ratio,40);el.ratio=65;assert.equal(el.start.style.flexBasis,'65%');el.persist();assert.equal(w.localStorage.getItem('omorphia:split:test-panel'),'65');
 el.separator.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true}));assert.equal(el.ratio,63);
});
await test('stepper validates and moves between stages',()=>{
 const el=mount('<ui-stepper linear><ui-step label="First" value="first"><ui-input name="title" value="Atlas"></ui-input></ui-step><ui-step label="Second" value="second">Review</ui-step></ui-stepper>').querySelector('ui-stepper');
 assert.equal(el.index,0);assert.equal(el.nextStep(),true);assert.equal(el.index,1);assert.equal(el.nextStep(),true);assert.equal(el.previous(),true);assert.equal(el.index,0);
});
await test('timeline exposes event items, time labels and status',()=>{
 const root=mount('<ui-timeline><ui-timeline-item title="Created" time="09:00" status="complete">Started</ui-timeline-item><ui-timeline-item title="Running" time="09:30" status="current">Building</ui-timeline-item></ui-timeline>');
 const items=root.querySelectorAll('ui-timeline-item');assert.equal(items.length,2);assert.equal(items[0].dataset.status,'complete');assert.equal(items[1].querySelector('time').textContent,'09:30');assert.equal(root.querySelector('ui-timeline').getAttribute('role'),'list');
});
await test('rating supports half steps and max changes',()=>{
 const el=mount('<ui-rating value="2.5" allow-half show-value name="score"></ui-rating>').querySelector('ui-rating');
 assert.equal(el.value,2.5);assert.equal(el.numeric.textContent,'2.5 / 5');el.setValue(4.5);assert.equal(el.hiddenValue.value,'4.5');el.setAttribute('max','3');assert.equal(el.value,3);
});
await test('skeleton and empty state render accessible content',()=>{
 const root=mount('<ui-skeleton variant="text" lines="3" label="Loading projects"></ui-skeleton><ui-empty-state title="Nothing here" description="Create your first project."><ui-button>Create</ui-button></ui-empty-state>');
 const skeleton=root.querySelector('ui-skeleton');assert.equal(skeleton.querySelectorAll('.ui-skeleton-shape').length,3);assert.equal(skeleton.getAttribute('aria-label'),'Loading projects');
 const empty=root.querySelector('ui-empty-state');assert.equal(empty.querySelector('.ui-empty-title').textContent,'Nothing here');assert.equal(empty.querySelector('.ui-empty-actions ui-button').textContent,'Create');assert.equal(empty.children.length,4);
});
await test('tour advances and restores target state when closed',()=>{
 const root=mount('<div id="tour-target">Target</div><ui-tour></ui-tour>'),el=root.querySelector('ui-tour');
 el.steps=[{selector:'#tour-target',title:'First',description:'First step'},{selector:'#tour-target',title:'Second'}];
 assert.equal(el.start(),true);assert.equal(el.target.id,'tour-target');assert.ok(el.target.classList.contains('ui-tour-target'));el.nextStep();assert.equal(el.counter.textContent,'2 of 2');
 el.end();assert.equal(el.open,false);assert.equal(el.target,null);assert.ok(!root.querySelector('#tour-target').classList.contains('ui-tour-target'));
});
console.log('Advanced component checks passed ('+passed+').');dom.window.close();
