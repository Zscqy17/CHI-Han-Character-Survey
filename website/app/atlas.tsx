'use client';
import {useEffect,useMemo,useState} from 'react';
import raw from '@/data/papers.json';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {ArrowUpRight,Search,ArrowLeft,Download,Play,Pause,Film,ChevronDown} from 'lucide-react';
import {filterPapers,partitionGallery,previewMedia,previewImage,orderedMedia,availableVideo,canPlayVideo,assetHref,homeHref,paperHref,viewHref,validLocale,type Paper,type Media,type Locale,type Localized,type Filters} from '@/lib/catalogue';
import {labels,tags} from '@/lib/i18n';
import {processes} from '@/lib/processes';
const papers=raw as Paper[];
const languageNames={en:'English',zh:'中文',ja:'日本語',ko:'한국어'};
type Label=keyof typeof labels;
function GifPreview({item,lang,asset,href,loading='lazy'}:{item:Media;lang:Locale;asset:(path:string)=>string;href:string;loading?:'eager'|'lazy'}){
 const [playing,setPlaying]=useState(true);
 useEffect(()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)setPlaying(false)},[]);
 return <div className="gif-preview"><a href={href}><img loading={loading} src={asset(!playing&&item.poster?item.poster:item.file!)} alt={item.caption[lang]}/></a>{item.poster&&<Button variant="outline" className="motion-toggle" aria-pressed={playing} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={14}/>:<Play size={14}/>}<span>{labels[playing?'pause':'playGif'][lang]}</span></Button>}</div>;
}
function VideoPreview({item,poster,lang,asset,compact=false}:{item:Media;poster?:string;lang:Locale;asset:(path:string)=>string;compact?:boolean}){
 const [loaded,setLoaded]=useState(false);
 const t=(key:Label)=>labels[key][lang];
 return <div className={(compact?'paper-image ':'')+'video-preview'}>
 {loaded&&item.embedUrl?<iframe title={item.caption[lang]} src={item.embedUrl} allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="no-referrer"/>:loaded&&canPlayVideo(item)?<video controls playsInline preload="metadata" src={item.videoUrl}/>:<>
 {poster?<img src={asset(poster)} alt={t('videoPreview')} loading="lazy"/>:<Film size={32}/>}
 {canPlayVideo(item)?<button className="video-play" onClick={()=>setLoaded(true)} aria-label={t('loadVideo')+': '+item.caption[lang]}><Play size={22}/><span>{t('loadVideo')}</span></button>:<a className="video-play" href={item.videoUrl||item.sourceUrl} target="_blank" rel="noreferrer"><Play size={22}/><span>{t(availableVideo(item)?'watchVideo':'videoUnavailable')} ↗</span></a>}
 </>}</div>;
}
function MediaView({item,paper,lang,asset}:{item:Media;paper:Paper;lang:Locale;asset:(path:string)=>string}){
 const t=(key:Label)=>labels[key][lang];
 const isVideo=item.kind==='video';
 return <figure className={'media-figure '+(isVideo?'video-figure':'')}>
 {item.kind==='gif'&&item.file?<GifPreview item={item} lang={lang} asset={asset} href={asset(item.file)}/>:item.file?<a href={asset(item.file)} target="_blank" rel="noreferrer" aria-label={item.caption[lang]}><img loading="lazy" src={asset(item.file)} alt={item.caption[lang]}/></a>:<><VideoPreview item={item} poster={item.poster||previewImage(paper)?.file} lang={lang} asset={asset}/><p className="section-note">{t(item.status==='unavailable'?'videoUnavailable':'onlineOnly')}</p></>}
 <figcaption><p className="media-caption">{item.caption[lang]}</p><p>{paper.authors} · {paper.year}{item.sourceKind==='page_preview'?<> · {t('pagePreview')}</>:item.figure&&<> · {item.sourceKind==='table'?t('figureTable')+' '+item.figure:item.figure==='example'?t('excerpt'):t('figure')+' '+item.figure}</>}{item.page&&<> · {t('page')} {item.page}</>}</p>
 {item.timestamps&&<p>{t('times')}: {item.timestamps.join(' → ')}</p>}
 {item.frames&&<details><summary>{t('originalFigures')} ({item.frames.length})</summary><ol>{item.frames.map((frame,i)=><li key={i}><a href={asset(frame.file)} target="_blank" rel="noreferrer">{t('figure')} {frame.figure} · {t('page')} {frame.page} ↗</a></li>)}</ol></details>}
 <p><a href={item.sourceUrl} target="_blank" rel="noreferrer">{t('source')} ↗</a>{item.license&&<> · <a href={item.licenseUrl} target="_blank" rel="noreferrer">{item.license}</a></>}</p>{item.sourceKind==='page_preview'?<p>{t('pagePreview')}</p>:item.kind==='image'&&<p>{t('annotation')}</p>}{item.rights==='source_excerpt'&&<p>{t('sourceExcerpt')}</p>}</figcaption></figure>;
}
export default function Atlas({initialPaperId,initialView='all',offline=false}:{initialPaperId?:string;initialView?:string;offline?:boolean}) {
 const [lang,setLang]=useState<Locale>('en');
 const [view,setView]=useState(initialView);
 const [approach,setApproach]=useState('all'),[modality,setModality]=useState('all'),[era,setEra]=useState('all'),[scenario,setScenario]=useState('all');
 const [paperId,setPaperId]=useState(initialPaperId||'');
 const [tier,setTier]=useState('all'),[script,setScript]=useState('all'),[query,setQuery]=useState(''),[media,setMedia]=useState('all');
 const [ready,setReady]=useState(false);
 const [filtersOpen,setFiltersOpen]=useState(false);
 useEffect(()=>{const u=new URL(location.href);const initialReadingView=offline?u.searchParams.get('view'):initialView;const legacyFacet=u.searchParams.get('facet');setLang(validLocale(u.searchParams.get('lang')));if(offline){setPaperId(u.searchParams.get('paper')||'');setView(['algorithms','interaction'].includes(u.searchParams.get('view')||'')?u.searchParams.get('view')!:'all')}setApproach(u.searchParams.get('approach')||(initialReadingView==='algorithms'?legacyFacet:null)||'all');setModality(u.searchParams.get('modality')||(initialReadingView==='interaction'&&legacyFacet!=='xr'?legacyFacet:null)||'all');setEra(u.searchParams.get('era')||'all');setScenario(u.searchParams.get('scenario')||(initialReadingView==='interaction'&&legacyFacet==='xr'?'xr':null)||'all');setTier(['EN-A','EN-B'].includes(u.searchParams.get('tier')||'')?u.searchParams.get('tier')!:'all');setScript(['zh','ja','ko','other'].includes(u.searchParams.get('script')||'')?u.searchParams.get('script')!:'all');setMedia(['image','video','gif'].includes(u.searchParams.get('media')||'')?u.searchParams.get('media')!:'all');setQuery(u.searchParams.get('q')||'');setReady(true)},[offline]);
 useEffect(()=>{if(!ready)return;document.documentElement.lang=lang;document.title=(paperId?papers.find(p=>p.id===paperId)?.title+' · ':'')+'CJK Input Atlas';const u=new URL(location.href);u.searchParams.set('lang',lang);u.searchParams.delete('facet');for(const [k,v] of Object.entries({tier,script,media,approach,modality,era,scenario,q:query})){if(v&&v!=='all')u.searchParams.set(k,v);else u.searchParams.delete(k)}try{history.replaceState(null,'',u)}catch{/* file URLs remain usable when browser history is restricted. */}},[lang,tier,script,media,approach,modality,era,scenario,query,ready,paperId]);
 const t=(key:Label)=>labels[key][lang];
 const tag=(key:string)=>(tags as Record<string,Localized>)[key]?.[lang]||key;
 const asset=(path:string)=>assetHref(path,offline);
 const href=(id:string)=>paperHref(id,lang,offline);
 const home=homeHref(lang,offline);
 const viewLink=(v:string)=>viewHref(v,lang,offline);
 const paper=paperId?papers.find(p=>p.id===paperId):undefined;
 const currentFilters:Filters={tier,script,query,media,view,approach,modality,era,scenario};
 const filtered=useMemo(()=>filterPapers(papers,{tier,script,query,media,view,approach,modality,era,scenario}),[tier,script,query,media,view,approach,modality,era,scenario]);
 const count=(overrides:Partial<Filters>)=>filterPapers(papers,{...currentFilters,...overrides}).length;
 const reset=()=>{setTier('all');setScript('all');setQuery('');setMedia('all');setApproach('all');setModality('all');setEra('all');setScenario('all')};
 const {illustrated,textOnly}=partitionGallery(filtered);
 const status=(value:string)=>(labels as Record<string,Localized>)[value]?.[lang]||value;
 const meta=(p:Paper)=><div className="paper-meta"><span className="tier-badge">{p.tier}</span><span>{p.year}</span><span>{p.scriptCodes.map(tag).join(' / ')}</span></div>;
 return <>
 <a className="skip" href="#content">{t('skip')}</a>
 <header className="site-header"><a className="wordmark" href={home}>CJK Input Atlas</a><nav aria-label={t('viewBasis')}><div className="header-views">{['all','algorithms','interaction'].map(v=><a key={v} href={viewLink(v)} aria-current={!paperId&&view===v?'page':undefined}>{t(v==='all'?'allViews':v as 'algorithms'|'interaction')}</a>)}</div><Select value={lang} onValueChange={v=>setLang(validLocale(v))}><SelectTrigger aria-label={t('language')} className="language-select"><SelectValue>{languageNames[lang]}</SelectValue></SelectTrigger><SelectContent>{Object.entries(languageNames).map(([value,name])=><SelectItem key={value} value={value}>{name}</SelectItem>)}</SelectContent></Select></nav></header>
 <main id="content">
 {paperId?paper?<>
 <a className="back-link" href={home+'#catalogue'}><ArrowLeft size={16}/>{t('back')}</a>
 <section className="detail-hero">{meta(paper)}<h1>{paper.title}</h1><p className="authors">{paper.authors}</p><p className="detail-venue">{paper.venue} · {paper.year}</p><div className="source-actions">{offline&&<a className="primary-link" href={asset(paper.pdfFile)} target="_blank" rel="noreferrer"><Download size={16}/>{t('localPdf')} · {paper.pdfPages} p.</a>}<a className="secondary-link" href={paper.sources[0].url} target="_blank" rel="noreferrer">{t('publication')} <ArrowUpRight size={16}/></a></div></section>
 <div className="detail-layout"><div className="detail-main">
 <section className="detail-section"><h2 className="section-title">{t('media')}</h2>{paper.media.length?orderedMedia(paper).map(m=><MediaView key={m.id} item={m} paper={paper} lang={lang} asset={asset}/>):<p className="media-unavailable">{status(paper.audit.mediaStatus)}</p>}</section>
 <section className="detail-section"><h2 className="section-title">{t('overview')}</h2><p className="study-summary">{paper.summary[lang]}</p></section>
 {processes[paper.id]&&<section className="detail-section"><h2 className="section-title">{t('process')}</h2><h2 className="output-heading">{processes[paper.id].output[lang]}</h2><p className="section-note">{t('processNote')} {t('page')}: {processes[paper.id].pages.join(', ')}.</p><ol className="process-steps">{processes[paper.id].steps.map((s,i)=><li key={i}><span className="step-number">0{i+1}</span><div><h3>{t(s.stage)}</h3>{s.sample&&<p className="sample" lang={paper.script==='ko'?'ko':paper.script==='ja'?'ja':'zh'}>{s.sample}</p>}<p>{s.text[lang]}</p></div></li>)}</ol></section>}

 </div><aside className="detail-aside"><div className="aside-block"><h2>{t('sources')}</h2>{paper.sources.map((s,i)=><div className="source-record" key={i}><a href={s.url} target="_blank" rel="noreferrer">{status(s.kind)} <ArrowUpRight size={13}/></a><small>{status(s.status)}{s.httpStatus?' · HTTP '+s.httpStatus:''}</small></div>)}<small>{t('checked')}: {paper.audit.checkedAt}</small></div>
 {([['methods',paper.modalities],['tech',paper.tech],['features',paper.features]] as [Label,string[]][]).map(([heading,values])=>values.length>0&&<div className="aside-block" key={heading}><h2>{t(heading)}</h2><div className="tag-list">{values.map(v=><span key={v}>{tag(v)}</span>)}</div></div>)}
 <div className="aside-block"><h2>{t('viewBasis')}</h2><div className="detail-view-links">{paper.views.map(v=><a key={v} href={viewLink(v)}>{t(v as 'algorithms'|'interaction')} ↗</a>)}</div><p className="section-note">{status(paper.viewBasis)}</p></div><div className="aside-block audit-block"><h2>{t('audit')}</h2><p>{t('fulltextVerified')}</p><p>{status(paper.audit.mediaStatus)}</p><p>{t('captionCount')}: {paper.audit.figureCaptionCount}</p><p>{t('page')}: {paper.originalPages[0]}–{paper.originalPages.at(-1)}</p><p className="record-id">ID: {paper.id}</p></div></aside></div>
 </>:<div className="empty-state"><h1>{t('notFound')}</h1><a href={home}>{t('back')} →</a></div>:<>

 <section id="catalogue" className="catalogue" aria-label={t('collection')}>
 <aside className="filter-sidebar" aria-label={t('filters')}>
 <Button variant="outline" className="filters-toggle" aria-expanded={filtersOpen} aria-controls="filter-body" onClick={()=>setFiltersOpen(!filtersOpen)}>{t('filters')} <ChevronDown size={16}/></Button>
 <div id="filter-body" className={'filter-body'+(filtersOpen?' expanded':'')}>
 <div className="sidebar-search"><label className="search"><Search size={17}/><Input aria-label={t('search')} placeholder={t('search')} value={query} onChange={e=>setQuery(e.target.value)}/></label><p className="result-count" aria-live="polite">{filtered.length} {t('results')}</p></div>
 <div className="filter-groups">
 {view!=='interaction'&&<div className="filter-group"><h3>{t('algorithmGenerations')}</h3><div className="filter-options" role="group" aria-label={t('algorithmGenerations')}>{[['all',t('allApproaches')],['rule',t('generationRule')],['stat_lm',t('generationStat')],['neural',t('generationNeural')],['llm',t('generationLlm')],['hybrid',tag('hybrid')],['na',tag('na')]].map(([v,l])=><Button key={v} variant="ghost" aria-pressed={approach===v} className="filter-option" onClick={()=>setApproach(v)}><span>{l}</span><span>{count({approach:v})}</span></Button>)}</div><p className="filter-note">{t('generationNote')}</p></div>}
 {view!=='algorithms'&&<div className="filter-group"><h3>{t('interactionMethods')}</h3><div className="filter-options"><Button variant="ghost" className="filter-option" aria-pressed={modality==='all'} onClick={()=>setModality('all')}><span>{t('allModalities')}</span><span>{count({modality:'all'})}</span></Button></div>{([['keyboardTouch',['kb_phonetic','kb_shape','touch_mobile']],['handwritingGesture',['handwriting','gesture']],['alternativeControls',['gaze','bci','speech','emg','braille','other']]] as [Label,string[]][]).map(([heading,values])=><div className="modality-group" key={heading}><h4>{t(heading)}</h4><div className="filter-options" role="group" aria-label={t(heading)}>{values.map(v=><Button key={v} variant="ghost" aria-pressed={modality===v} className="filter-option" onClick={()=>setModality(v)}><span>{tag(v)}</span><span>{count({modality:v})}</span></Button>)}</div></div>)}</div>}
 {view!=='algorithms'&&<div className="filter-group"><h3>{t('scenario')}</h3><div className="filter-options" role="group" aria-label={t('scenario')}>{[['all',t('allScenarios')],['xr',t('xrScenario')]].map(([v,l])=><Button key={v} variant="ghost" className="filter-option" aria-pressed={scenario===v} onClick={()=>setScenario(v)}><span>{l}</span><span>{count({scenario:v})}</span></Button>)}</div><p className="filter-note">{t('modalityNote')}</p></div>}
 <div className="filter-group"><h3>{t('era')}</h3><div className="filter-options" role="group" aria-label={t('era')}>{[['all',t('allEras')],['pre-2006','2000–2005'],['2006-2012','2006–2012'],['2013-2019','2013–2019'],['2020-now','2020–2026']].map(([v,l])=><Button key={v} variant="ghost" className="filter-option" aria-pressed={era===v} onClick={()=>setEra(v)}><span>{l}</span><span>{count({era:v})}</span></Button>)}</div></div>
 <div className="filter-group"><h3>{t('scriptGroup')}</h3><div className="filter-options" role="group" aria-label={t('allScripts')}>{[['all',t('allScripts')],['zh',t('zh')],['ja',t('ja')],['ko',t('ko')],['other',t('other')]].map(([v,l])=><Button key={v} variant="ghost" className="filter-option" aria-pressed={script===v} onClick={()=>setScript(v)}><span>{l}</span><span>{count({script:v})}</span></Button>)}</div></div>
 <div className="filter-group"><h3>{t('venueGroup')}</h3><Tabs orientation="vertical" value={tier} onValueChange={v=>setTier(String(v))}><TabsList variant="line" className="tier-tabs" aria-label={t('venueGroup')}>{[['all',t('all')],['EN-A','EN-A'],['EN-B','EN-B']].map(([v,l])=><TabsTrigger key={v} value={v}>{l}<span>{count({tier:v})}</span></TabsTrigger>)}</TabsList></Tabs></div>
 <div className="filter-group"><h3>{t('mediaFilter')}</h3><div className="filter-options" role="group" aria-label={t('allMedia')}>{['all','gif','video','image'].map(v=><Button key={v} variant="ghost" className="filter-option" aria-pressed={media===v} onClick={()=>setMedia(v)}><span>{t(v==='all'?'allMedia':v as 'image'|'video'|'gif')}</span><span>{count({media:v})}</span></Button>)}</div></div>
 </div><Button variant="outline" className="reset-button" onClick={reset}>{t('reset')}</Button></div>
 </aside>
 <div className="catalogue-results">
 <div id="cases">{illustrated.length>0&&<><h2 className="gallery-heading">{t('galleryTitle')}<span>{illustrated.length} {t('results')}</span></h2><div className="paper-grid">{illustrated.map((p,i)=>{const m=previewMedia(p)!;return <article className="paper-card" key={p.id}>
 <figure>{m.kind==='gif'?<div className="paper-image"><GifPreview item={m} lang={lang} asset={asset} href={href(p.id)} loading={i<3?'eager':'lazy'}/></div>:m.kind==='video'?<VideoPreview item={m} poster={m.poster||previewImage(p)?.file} lang={lang} asset={asset} compact/>:<a className="paper-image" href={href(p.id)} aria-label={t('detail')+': '+p.title}><img src={asset(m.file!)} alt={m.caption[lang]} loading={i<3?'eager':'lazy'}/></a>}<figcaption><span>{m.kind==='video'?t('videoPreview'):m.kind==='gif'?t(m.sourceType==='paper_figure_slideshow'?'figureGif':m.videoUrl?'videoGif':'originalGif'):m.sourceKind==='page_preview'?t('pagePreview'):m.sourceKind==='table'?t('figureTable')+(m.figure?' '+m.figure:''):m.figure?t(m.figure==='example'?'excerpt':'figure')+(m.figure==='example'?'':' '+m.figure):t('imageCaption')}{m.page?' · '+t('page')+' '+m.page:''}</span></figcaption></figure>
 {meta(p)}<h3><a href={href(p.id)}>{p.title}</a></h3><p className="card-authors">{p.authors}</p><div className="card-classification">{p.views.map(v=><span key={v}>{t(v as 'algorithms'|'interaction')}</span>)}{(view==='algorithms'?p.tech:p.modalities).map(v=><span key={v}>{tag(v)}</span>)}</div>{processes[p.id]&&<p className="card-output">{processes[p.id].output[lang]}</p>}
 <div className="record-actions"><a href={href(p.id)}>{t('detail')}</a><a href={p.sources[0].url} target="_blank" rel="noreferrer">{t('source')} <ArrowUpRight size={13}/></a>{p.media.some(m=>m.kind==='video')&&<span className="media-type">{t('video')}</span>}</div>
 </article>})}</div></>}</div>
 {textOnly.length>0&&<div className="text-records"><h2 className="gallery-heading">{t('otherPapers')}<span>{textOnly.length} {t('results')}</span></h2>{textOnly.map((p,i)=><article className="paper-row" key={p.id}><span className="paper-number">{i+1}</span><div>{meta(p)}<h3><a href={href(p.id)}>{p.title}</a></h3><p className="venue">{p.venue}</p><p className="row-summary">{p.summary[lang]}</p><div className="record-actions"><a href={href(p.id)}>{t('detail')}</a><a href={p.sources[0].url} target="_blank" rel="noreferrer">{t('source')} <ArrowUpRight size={13}/></a>{p.media.some(m=>m.kind==='video')&&<span className="media-type">{t('video')}</span>}</div></div></article>)}</div>}
 {!filtered.length&&<div className="empty-state"><p>{t('empty')}</p><Button variant="outline" onClick={reset}>{t('reset')}</Button></div>}
 </div></section>
 <section className="about-section"><div><h2>{t('about')}</h2><p>{t('aboutText')}</p><p>{t('viewOverlap')}</p><p>{t('provenance')}</p><p className="design-reference">{lang==='zh'?'目录组织参考':lang==='ja'?'一覧の構成参考':lang==='ko'?'목록 구성 참고':'Catalogue inspiration'}: <a href="https://xrtexttrove.github.io/" target="_blank" rel="noreferrer">XRTextTrove</a> · <a href="https://dl.acm.org/doi/10.1145/3706598.3713382" target="_blank" rel="noreferrer">TEXT (2025)</a>.</p></div><div className="download-block"><h3>{t('downloads')}</h3>{[['data/catalogue.csv','CSV'],['data/catalogue.json','JSON'],['data/references.bib','BibTeX'],['data/verification.json',t('audit')],['data/media.json',t('media')],['data/view-classification.csv',t('viewBasis')],['data/review-taxonomy.json',t('filters')],['data/figure-selections.json',t('imageCaption')],['data/figure-gif-audit.json',t('figureGif')]].map(([path,name])=><a key={path} href={asset(path)} download><Download size={14}/>{name}<ArrowUpRight size={14}/></a>)}</div></section>
 </>}
 </main><footer><a className="wordmark" href={home}>CJK Input Atlas</a><p>{t('footer')}</p></footer>
 </>;
}
