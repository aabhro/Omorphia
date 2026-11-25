import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(process.cwd()),output=resolve(root,'test-results/visual');mkdirSync(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.webp':'image/webp','.png':'image/png'};
const server=createServer((req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 const file=resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}if(!existsSync(file)){res.writeHead(404).end();return;}
 res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'});res.end(readFileSync(file));});
await new Promise(resolvePromise=>server.listen(0,'127.0.0.1',resolvePromise));
const address=server.address(),browser=await chromium.launch({headless:true,args:['--no-sandbox']}),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+address.port+'/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForSelector('#date-demo');await page.waitForFunction(()=>!!document.querySelector('#date-demo')?.popoverElement?.panel);
 await page.waitForFunction(()=>document.querySelector('#data-table-demo')?.data?.length===6);
 await page.screenshot({path:resolve(output,'showcase-dark.png'),fullPage:true,animations:'disabled'});
 const date=page.locator('#date-demo');await date.evaluate(el=>el.show());
 const geometry=await date.evaluate(el=>{const panel=el.popoverElement.panel,r=panel.getBoundingClientRect(),style=getComputedStyle(panel);return{position:style.position,pointerEvents:style.pointerEvents,width:r.width,height:r.height,left:r.left,top:r.top};});
 assert.equal(geometry.position,'fixed');assert.equal(geometry.pointerEvents,'auto');assert.ok(geometry.width>0&&geometry.height>0);
 assert.ok(geometry.left>=0&&geometry.top>=0&&geometry.left+geometry.width<=1440&&geometry.top+geometry.height<=1000);
 await page.screenshot({path:resolve(output,'date-picker-open.png'),fullPage:true,animations:'disabled'});
 await page.locator('[data-ui-floating-layer] [data-date="2026-11-21"]').click();assert.equal(await date.evaluate(el=>el.open),false);
 await page.waitForFunction(()=>!!document.querySelector('#nested-popover-outer')?.panel&&!!document.querySelector('#nested-popover-inner')?.panel);
 await page.locator('#nested-popover-outer').evaluate(el=>{el.show();document.querySelector('#nested-popover-inner').show();});
 const nested=await page.locator('#nested-popover-inner').evaluate(el=>({parent:!!el.panel._uiFloatParent,z:Number(el.panel.style.zIndex),rect:el.panel.getBoundingClientRect().toJSON()}));
 assert.ok(nested.parent&&nested.z>0&&nested.rect.width>0&&nested.rect.height>0);
 await page.screenshot({path:resolve(output,'nested-popovers-open.png'),fullPage:true,animations:'disabled'});
 await page.locator('#nested-popover-outer').evaluate(el=>el.hide());await page.waitForFunction(()=>document.querySelectorAll('[data-ui-floating-layer] .ui-float[data-open]').length===0);
 await page.locator('html').evaluate(el=>el.setAttribute('data-ui-theme','light'));await page.screenshot({path:resolve(output,'showcase-light.png'),fullPage:true,animations:'disabled'});
 assert.equal(await page.locator('#data-table-demo').evaluate(el=>el.data.length),6);
 assert.ok(await page.locator('#tree-view-demo [data-tree-id]').count()>=6);
 assert.equal(await page.locator('#multi-select-demo').evaluate(el=>el.multiple),true);
 assert.equal(await page.locator('#stepper-demo').evaluate(el=>el.steps.length),3);
 await page.locator('#advanced-library').scrollIntoViewIfNeeded();await page.screenshot({path:resolve(output,'advanced-components.png'),fullPage:true,animations:'disabled'});
 const color=page.locator('#color-picker-demo');await color.evaluate(el=>el.show());assert.equal(await color.evaluate(el=>el.popoverElement.open),true);
 await page.screenshot({path:resolve(output,'advanced-color-picker-open.png'),fullPage:true,animations:'disabled'});await color.evaluate(el=>el.hide());
 const tour=page.locator('#tour-demo');await tour.evaluate(el=>el.start());assert.equal(await tour.evaluate(el=>el.open),true);
 assert.ok(await tour.locator('.ui-tour-panel').isVisible());await page.screenshot({path:resolve(output,'guided-tour-open.png'),fullPage:true,animations:'disabled'});await tour.evaluate(el=>el.end());
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto('http://127.0.0.1:'+address.port+'/index.html',{waitUntil:'domcontentloaded'});await mobile.waitForFunction(()=>document.querySelector('#data-table-demo')?.data?.length===6);
 await mobile.locator('#advanced-library').scrollIntoViewIfNeeded();const width=await mobile.evaluate(()=>({viewport:document.documentElement.clientWidth,page:document.documentElement.scrollWidth}));
 assert.ok(width.page<=width.viewport+1,'advanced showcase must not cause page overflow: '+JSON.stringify(width));
 await mobile.screenshot({path:resolve(output,'advanced-components-mobile.png'),fullPage:true,animations:'disabled'});
 assert.deepEqual(errors,[]);console.log('Playwright visual regression checks passed. Screenshots saved to test-results/visual/.');
}finally{await browser.close();await new Promise(resolvePromise=>server.close(resolvePromise));}
