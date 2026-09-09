/** Classic, self-contained bundle: no module imports, fetches or web server needed. */
import {build} from 'esbuild';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
const output=path.resolve('../CJK-Input-Atlas');
await mkdir(output,{recursive:true});
const result=await build({entryPoints:['scripts/offline-entry.tsx'],bundle:true,write:false,format:'iife',platform:'browser',target:['es2020'],minify:true,legalComments:'inline',define:{'process.env.NODE_ENV':'"production"','process.env.NEXT_PUBLIC_BASE_PATH':'""'},tsconfig:'tsconfig.json'});
const index=await readFile('dist/client/index.html','utf8');
const cssPaths=[...index.matchAll(/href="([^"]+\.css)"/g)].map(m=>m[1]);
const styles=await Promise.all([...new Set(cssPaths)].map(f=>readFile('dist/client'+f,'utf8')));
if(!styles.length)throw Error('Build the website before the offline HTML.');
const script=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html='<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><title>CJK Input Atlas</title><style>'+styles.join('\n')+'</style></head><body><div id="root"></div><noscript>Please enable JavaScript for the searchable atlas. All 241 PDFs remain available in the papers folder, with catalogue.csv in data.</noscript><script>'+script+'</script></body></html>';
await writeFile(path.join(output,'index.html'),html);
console.log('Created offline index.html',Buffer.byteLength(html),'bytes');
