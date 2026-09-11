/** Classic inline bundle for file://, with local media and no runtime fetches. */
import {build} from 'esbuild';
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseArgs} from 'node:util';
import path from 'node:path';
const {values}=parseArgs({options:{output:{type:'string',default:'../CJK-Input-Atlas'},'without-pdfs':{type:'boolean',default:false}}});
const output=path.resolve(values.output);
const includedPdfs=!values['without-pdfs'];
await mkdir(output,{recursive:true});
const result=await build({entryPoints:['scripts/offline-entry.tsx'],bundle:true,write:false,format:'iife',platform:'browser',target:['es2020'],minify:true,legalComments:'inline',metafile:true,define:{'process.env.NODE_ENV':'"production"','process.env.NEXT_PUBLIC_BASE_PATH':'""','process.env.ATLAS_INCLUDE_PDFS':JSON.stringify(String(includedPdfs))},tsconfig:'tsconfig.json'});
if(Object.values(result.metafile.outputs).some(o=>o.imports.length))throw Error('Offline JavaScript must not depend on module imports.');
const index=await readFile('dist/client/index.html','utf8');
const cssPaths=[...new Set([...index.matchAll(/href="([^"]+\.css)"/g)].map(m=>m[1]))];
if(!cssPaths.length)throw Error('Build the website before the offline HTML.');
const styles=[];
for(const cssPath of cssPaths){
 const filename=path.resolve('dist/client',cssPath.replace(/^\//,''));
 let css=await readFile(filename,'utf8');
 for(const match of [...css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)]){
  const url=match[2];if(url.startsWith('data:')||url.startsWith('#'))continue;
  if(/^(https?:)?\/\//.test(url))throw Error('Offline CSS has an external resource: '+url);
  const source=url.startsWith('/')?path.resolve('dist/client',url.slice(1)):path.resolve(path.dirname(filename),url);
  const content=await readFile(source);
  const target='assets/'+createHash('sha256').update(content).digest('hex').slice(0,12)+path.extname(source);
  await mkdir(path.join(output,'assets'),{recursive:true});await writeFile(path.join(output,target),content);
  css=css.replace(match[0],`url("./${target}")`);
 }
 if(/@import\s/.test(css))throw Error('Offline CSS must be fully bundled.');
 styles.push(css);
}
const script=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html='<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><title>CJK Input Atlas</title><style>'+styles.join('\n')+'</style></head><body><div id="root"></div><noscript>Enable JavaScript for search and filters, or open the <a href="paper-index.html">offline paper directory</a>.</noscript><script>'+script+'</script></body></html>';
await writeFile(path.join(output,'index.html'),html);
for(const folder of ['media','data'])await cp('public/'+folder,path.join(output,folder),{recursive:true});
const papers=JSON.parse(await readFile('data/papers.json','utf8'));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const directory=papers.map(p=>`<li><a href="index.html?paper=${encodeURIComponent(p.id)}&amp;lang=en">${escape(p.title)}</a> · ${p.year} · ${p.tier}<br><a href="${p.media.find(m=>m.kind==='gif').file}">GIF (offline)</a> · <a href="${escape(p.sources[0].url)}">Original source (Internet required)</a></li>`).join('\n');
await writeFile(path.join(output,'paper-index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Paper directory · CJK Input Atlas</title><style>body{font:16px system-ui;max-width:1000px;margin:30px auto;padding:20px;color:#111;background:white}li{margin:18px 0}a{color:inherit}</style><h1>All 241 papers</h1><p><a href="index.html">Open the searchable atlas</a></p><ol>'+directory+'</ol></html>');
const report={format:'file-url-offline-web',entry:'index.html',papers:papers.length,gifs:papers.flatMap(p=>p.media).filter(m=>m.kind==='gif').length,locales:['en','zh','ja','ko'],includedPdfs,serverRequired:false,runtimeModuleImports:0,htmlBytes:Buffer.byteLength(html)};
await writeFile(path.join(output,'OFFLINE-PACKAGE.json'),JSON.stringify(report,null,2)+'\n');
if(!includedPdfs)await cp('offline-README.md',path.join(output,'README.md'));

console.log(JSON.stringify(report));
