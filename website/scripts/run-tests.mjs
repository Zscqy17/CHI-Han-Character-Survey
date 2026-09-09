import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
mkdirSync('work',{recursive:true});
await build({entryPoints:['scripts/verify.ts'],bundle:true,platform:'node',format:'esm',outfile:'work/verify.mjs',logLevel:'warning'});
const r=spawnSync(process.execPath,['work/verify.mjs'],{stdio:'inherit'});process.exit(r.status??1);
