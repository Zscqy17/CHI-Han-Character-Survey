import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {filterPapers,partitionGallery,previewMedia,previewImage,orderedMedia,mediaRank,canPlayVideo,publicationEra,paperHref,homeHref,viewHref,validLocale,locales,type Paper} from '../lib/catalogue';
import {labels,tags} from '../lib/i18n';
import {processes} from '../lib/processes';
import raw from '../data/papers.json';
const papers=raw as Paper[];
const all={tier:'all',script:'all',media:'all',query:''};
let checks=0;const check=(condition:unknown,message:string)=>{assert.ok(condition,message);checks++};
check(papers.length===241&&new Set(papers.map(p=>p.id)).size===241,'241 unique records');
check(filterPapers(papers,{...all,tier:'EN-A'}).length===57,'EN-A 57');
check(filterPapers(papers,{...all,tier:'EN-B'}).length===184,'EN-B 184');
for(const [script,n] of Object.entries({zh:155,ja:67,ko:13,other:6}))check(filterPapers(papers,{...all,script}).length===n,`script count ${script}`);
check(filterPapers(papers,{...all,query:'  ｋｏｏｓｈｏ  '})[0]?.id==='hagiwara2013koosho','NFKC + whitespace + case-insensitive title search');
check(filterPapers(papers,{...all,query:'no_such_title_00000'}).length===0,'empty search state');
check(filterPapers(papers,{...all,script:'ko',query:'koosho'}).length===0,'search and script intersect');
for(const t of ['EN-A','EN-B'])for(const script of ['zh','ja','ko','other'])for(const view of ['all','algorithms','interaction']){
 const actual=filterPapers(papers,{...all,tier:t,script,view});
 check(actual.every(p=>p.tier===t&&p.script===script&&(view==='all'||p.views.includes(view))),`intersect ${view} ${t} ${script}`);
}
const alg=filterPapers(papers,{...all,view:'algorithms'}),inter=filterPapers(papers,{...all,view:'interaction'});
check(alg.length===110&&inter.length===181,'independent view totals');
check(new Set([...alg,...inter].map(p=>p.id)).size===241,'view union covers corpus');
check(papers.filter(p=>p.views.length===2).length===50,'overlap explicitly counted');
check(filterPapers(papers,{...all,view:'algorithms',facet:'llm'}).some(p=>p.id==='ding2024generative'),'LLM facet reaches GeneInput');
check(filterPapers(papers,{...all,view:'interaction',facet:'xr'}).some(p=>p.id==='yuasa2025flickpose'),'XR facet reaches FlickPose');
check(!filterPapers(papers,{...all,view:'algorithms',facet:'llm'}).some(p=>p.id==='huang2004statistical'),'LLM facet excludes Hanja statistical paper');
for(const p of papers){
 check(locales.every(l=>p.summary[l]&&p.summary[l].length>8),`${p.id} four-language interpretation`);
 check(p.sources.length>0&&p.sources.every(s=>/^https?:\/\//.test(s.url)),`${p.id} source entries`);
 check(p.audit.localFulltext==='hash_verified'&&/^[a-f0-9]{64}$/.test(p.sourceSha256),`${p.id} prior fulltext hash`);
 check([...p.modalities,...p.tech,...p.features,...p.scriptCodes].every(k=>k in tags),`${p.id} all tags localized`);
 check(p.originalPages.length===p.pdfPages&&p.pdfPages>0,`${p.id} full article pages`);
 for(const lang of locales){
  const u=new URL(paperHref(p.id,lang,true),'https://local.invalid/');check(u.searchParams.get('paper')===p.id&&u.searchParams.get('lang')===lang,'offline detail URL stable');
  check(paperHref(p.id,lang).startsWith('/papers/'+p.id+'?'),'public detail URL stable');
 }
 for(const m of p.media){
  check(m.paperId===p.id&&locales.every(l=>!!m.caption[l]),'media identity + four languages');
  if(m.file){check(fs.existsSync('public/'+m.file)&&((!!m.license&&!!m.licenseUrl)||(m.rights==='source_excerpt'&&!!m.sourcePdfSha256&&!!m.sourceKind&&(!!m.rect||!!m.frames?.length))),'included media exists and has license or original-paper excerpt provenance');if(m.poster)check(fs.existsSync('public/'+m.poster),'GIF still exists');}
  if(m.sourceType==='paper_figure_slideshow'){
   check(m.kind==='gif'&&!!m.frames&&m.frames.length>=2&&!m.timestamps,'figure slideshows are distinct from observed video timestamps');
   for(const f of m.frames!){
    check(f.page>=1&&f.page<=p.pdfPages&&f.rect.length===4&&f.rect[2]>f.rect[0]&&f.rect[3]>f.rect[1],'slideshow frame has valid source page and crop');
    check(createHash('sha256').update(fs.readFileSync('public/'+f.file)).digest('hex')===f.sha256,'individual source figure matches verified crop');
   }
  }
 }
}
for(const dictionary of [labels,tags])for(const v of Object.values(dictionary))check(locales.every(l=>v[l]&&v[l].trim()),'four-language UI labels');
for(const [id,flow] of Object.entries(processes)){check(papers.some(p=>p.id===id),'process references known paper');check(flow.pages.every(n=>n>0&&n<=papers.find(p=>p.id===id)!.pdfPages),'process page bounds');for(const s of flow.steps)check(locales.every(l=>s.text[l]),'four-language process');}
check(processes.huang2004statistical.output.en.includes('Hanja'),'Hanja distinguished');
check(processes.ahn2026cheonjiin.output.en==='Hangul composition','Hangul not mislabeled Hanja');
check(processes.han2020write.output.en.startsWith('Physical'),'robot glyph distinguished');
check(papers.find(p=>p.id==='wada2025flick')!.summary.en.includes('not implemented'),'Flick-in boundary preserved');
const gifPapers=filterPapers(papers,{...all,media:'gif'});
check(gifPapers.length===16,'sixteen papers with GIFs');
check(gifPapers.filter(p=>p.media.some(m=>m.sourceType==='paper_figure_slideshow')).length===12,'twelve paper-figure slideshows');
check(partitionGallery(papers).illustrated.slice(0,4).every(p=>previewMedia(p)?.sourceType!=='paper_figure_slideshow'),'real video frames and author animation precede figure slideshows');
for(const id of ['sun2024exploring','sarhangzadeh2024alignment']){
 const p=raw.find(p=>p.id===id)!;
 const gif=p.media.find(m=>m.kind==='gif') as any;
 check(gif.sourceType==='conference_explanation'&&gif.timestamps.length===gif.durationsMs.length,'new GIF frames are timestamped conference explanations');
 check(createHash('sha256').update(fs.readFileSync('public/'+gif.file)).digest('hex')===gif.assetSha256,'new GIF matches verified extracted asset');
 check(p.media.some(m=>m.kind==='video'&&canPlayVideo(m as any)),'new ACL GIF retains playable original source');
}
const publicCatalogue=JSON.parse(fs.readFileSync('public/data/catalogue.json','utf8'));
check(JSON.stringify(raw)===JSON.stringify(publicCatalogue),'public catalogue matches the website records');
const publicMedia=JSON.parse(fs.readFileSync('public/data/media.json','utf8'));
for(const m of JSON.parse(fs.readFileSync('data/video-media.json','utf8'))){
 check(JSON.stringify(publicMedia.find((x:any)=>x.id===m.id))===JSON.stringify(m),'motion media export preserves exact provenance');
 check(JSON.stringify(raw.find(p=>p.id===m.paperId)?.media.find(x=>x.id===m.id))===JSON.stringify(m),'paper record preserves exact motion media');
}
check(filterPapers(papers,{...all,media:'image'}).every(p=>p.media.some(m=>m.kind==='image'&&m.file)),'image filter only included images');
check(filterPapers(papers,{...all,media:'video'}).every(p=>p.media.some(m=>m.kind==='video'&&m.videoUrl)),'video filter actual source entries');
for(const view of ['all','algorithms','interaction'])for(const script of ['all','zh','ja','ko','other'])for(const media of ['all','image','gif','video']){
 const records=filterPapers(papers,{...all,view,script,media});
 const {illustrated,textOnly}=partitionGallery(records);
 check(illustrated.length+textOnly.length===records.length&&new Set([...illustrated,...textOnly].map(p=>p.id)).size===records.length,'gallery and text catalogue preserve every filtered record exactly once');
 check(illustrated.every(p=>{const m=previewMedia(p)!;const file=m.kind==='video'?previewImage(p)?.file:m.file;return file&&fs.existsSync('public/'+file)}),'gallery media has an attributed local image or animation');
 check(illustrated.every((p,i)=>i===0||mediaRank(previewMedia(illustrated[i-1]))<=mediaRank(previewMedia(p))),'GIF then video then image ordering survives every filter intersection');
}
check(partitionGallery(papers).illustrated.slice(0,gifPapers.length).every(p=>previewMedia(p)?.kind==='gif'),'all animated GIFs lead the catalogue');
check(previewMedia(papers.find(p=>p.id==='han2020write')!)?.kind==='video','available video precedes a primary static image');
check(previewMedia(papers.find(p=>p.id==='park2015enhanced')!)?.sourceType==='paper_figure_slideshow','paper-figure slideshow precedes unavailable video');
for(const p of papers){const ordered=orderedMedia(p);check(ordered.every((m,i)=>i===0||mediaRank(ordered[i-1])<=mediaRank(m)),'detail media follows motion priority');for(const m of p.media)if(m.status==='unavailable')check(!canPlayVideo(m),'unavailable sources do not get a playback control');}
check(partitionGallery(papers).illustrated.length===241,'all 241 papers have a traceable visual preview');
check(papers.find(p=>p.id==='jia2014joint')!.media.some(m=>m.kind==='gif'&&m.poster?.endsWith('.png')),'video-frame GIF preserves its real still-frame poster');
const taxonomy=JSON.parse(fs.readFileSync('public/data/review-taxonomy.json','utf8'));
const figureSelections=JSON.parse(fs.readFileSync('public/data/figure-selections.json','utf8'));
check(figureSelections.length===241&&new Set(figureSelections.map((r:any)=>r.id)).size===241,'per-paper figure selection covers every record once');
for(const row of figureSelections){
 const p=papers.find(p=>p.id===row.id)!;
 if(row.selection==='existing_source_media')check(!!previewMedia(p),'reused media still exists');
 else check(row.visuallyChecked&&row.page>=1&&row.page<=p.pdfPages&&row.sourcePdfSha256,'new excerpt has visual check and a valid source page');
}
for(const row of taxonomy.records){
 const paper=papers.find(p=>p.id===row.id)!;
 check(publicationEra(paper.year)===row.era,'publication period matches the manuscript corpus code');
 check(JSON.stringify(paper.tech)===JSON.stringify(row.approaches),'algorithm labels preserve manuscript codes');
 check(!row.modalities.includes('xr')&&row.scenarios.includes('xr')===paper.modalities.includes('xr'),'XR stays a scenario, separate from input signals');
}
for(const approach of ['rule','stat_lm','neural','llm','hybrid','na'])for(const era of ['pre-2006','2006-2012','2013-2019','2020-now']){
 const actual=filterPapers(papers,{...all,view:'algorithms',approach,era});
 const expected=taxonomy.records.filter((r:any)=>r.era===era&&r.approaches.includes(approach)&&papers.find(p=>p.id===r.id)!.views.includes('algorithms'));
 check(actual.length===expected.length&&actual.every(p=>expected.some((r:any)=>r.id===p.id)),'algorithm generation and publication period intersect accurately');
}
for(const modality of ['kb_phonetic','kb_shape','touch_mobile','handwriting','gesture','gaze','bci','speech','emg','braille','other']){
 const actual=filterPapers(papers,{...all,view:'interaction',modality,scenario:'xr'});
 check(actual.every(p=>p.modalities.includes(modality)&&p.modalities.includes('xr')),'interaction method intersects XR scenario');
}
check(validLocale('de')==='en'&&validLocale('ja')==='ja','language defaults');
check(homeHref('ko',true)==='index.html?lang=ko'&&viewHref('interaction','ja',true)==='index.html?view=interaction&lang=ja','offline navigation');
const report={passed:true,checks,papers:241,tiers:{'EN-A':57,'EN-B':184},scripts:{zh:155,ja:67,ko:13,other:6},views:{algorithms:110,interaction:181,both:50},media:{images:papers.flatMap(p=>p.media).filter(m=>m.kind==='image').length,gifs:papers.flatMap(p=>p.media).filter(m=>m.kind==='gif').length,videoSources:papers.flatMap(p=>p.media).filter(m=>m.kind==='video').length},browserTesting:'Not performed; source, data, build and HTTP verification only.'};
fs.mkdirSync('work',{recursive:true});fs.writeFileSync('work/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
