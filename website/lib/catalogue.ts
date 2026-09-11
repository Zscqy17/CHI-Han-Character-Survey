import reviewTaxonomy from '../data/review-taxonomy.json';
export const locales = ['en','zh','ja','ko'] as const;
export type Locale = typeof locales[number];
export type Localized = Record<Locale,string>;
export interface MediaFrame {file:string;figure?:string|null;page:number;rect?:number[]|null;sha256:string;kind?:string;sourceAssetId?:string;sourcePdfSha256?:string|null;}
export interface Media { id:string; paperId:string; kind:'image'|'gif'|'video'; file?:string; poster?:string; sourceUrl:string; videoUrl?:string; embedUrl?:string; page?:number; figure?:string; caption:Localized; license?:string; licenseUrl?:string; adaptation?:string; timestamps?:number[]; status?:string; sourceKind?:'figure'|'table'|'page_preview'|'figure_sequence'|'page_sequence'; sourceType?:'conference_explanation'|'paper_figure_slideshow'|'paper_excerpt_slideshow'; frames?:MediaFrame[]; rights?:string; captionOriginal?:string; sourcePdfSha256?:string; rect?:number[]; galleryPrimary?:boolean; }
export interface Source {kind:string;url:string;status:string;httpStatus?:number|null;checkedAt:string;}
export interface Paper {views:string[];viewBasis:string;contributionType:string;evaluationType:string;id:string;title:string;authors:string;year:number;venue:string;tier:string;script:string;scriptCodes:string[];modalities:string[];tech:string[];features:string[];summary:Localized;sources:Source[];media:Media[];pdfFile:string;pdfPages:number;originalPages:number[];sourceSha256:string;audit:{localFulltext:string;publicationStatus:string;identityBasis:string;figureCaptionCount:number;mediaStatus:string;checkedAt:string};}
export interface Filters {tier:string;script:string;query:string;media:string;view?:string;facet?:string;approach?:string;modality?:string;era?:string;scenario?:string;}
export const interactionTopics = reviewTaxonomy.topicDefinitions.map(({code,labelKey})=>({code,labelKey}));
const topicsByPaper = new Map(reviewTaxonomy.records.map(r=>[r.id,r.scenarios]));
export function paperTopics(paper:Pick<Paper,'id'>):string[]{return topicsByPaper.get(paper.id)||[];}
export function availableVideo(m:Media){return m.kind==='video'&&m.status!=='unavailable'&&!!(m.videoUrl||m.embedUrl);}
export function canPlayVideo(m:Media){return availableVideo(m)&&!!(m.embedUrl||(m.status==='official_video_accessible'&&m.videoUrl?.endsWith('.mp4')));}
export function mediaRank(m?:Media){return !m?4:m.kind==='gif'&&m.file?(m.sourceType==='paper_figure_slideshow'?0.5:m.sourceType==='paper_excerpt_slideshow'?0.75:0):availableVideo(m)?1:m.kind==='image'&&m.file?2:3;}
export function previewImage(paper:Paper){return paper.media.find(m=>m.kind==='image'&&m.galleryPrimary&&m.file)||paper.media.find(m=>m.kind==='image'&&m.file);}
export function orderedMedia(paper:Paper){return [...paper.media].sort((a,b)=>mediaRank(a)-mediaRank(b)||(Number(!!b.galleryPrimary)-Number(!!a.galleryPrimary)));}
export function previewMedia(paper:Paper){return orderedMedia(paper).find(m=>mediaRank(m)<3);}
export function partitionGallery(papers:Paper[]){return {illustrated:papers.filter(p=>!!previewMedia(p)).sort((a,b)=>mediaRank(previewMedia(a))-mediaRank(previewMedia(b))),textOnly:papers.filter(p=>!previewMedia(p))};}
export function publicationEra(year:number){return year<2006?'pre-2006':year<2013?'2006-2012':year<2020?'2013-2019':'2020-now';}
export function filterPapers(papers:Paper[], f:Filters) {
 const q=f.query.normalize('NFKC').toLocaleLowerCase().trim();
 return papers.filter(p=>(!f.view||f.view==='all'||p.views.includes(f.view))
  &&(!f.facet||f.facet==='all'||(f.view==='algorithms'?p.tech:p.modalities).includes(f.facet))
  &&(!f.approach||f.approach==='all'||p.tech.includes(f.approach))
  &&(!f.modality||f.modality==='all'||p.modalities.includes(f.modality))
  &&(!f.era||f.era==='all'||publicationEra(p.year)===f.era)
  &&(!f.scenario||f.scenario==='all'||paperTopics(p).includes(f.scenario))
  &&(f.tier==='all'||p.tier===f.tier)&&(f.script==='all'||p.script===f.script)
  &&(!q||p.title.normalize('NFKC').toLocaleLowerCase().includes(q))
  &&(f.media==='all'||p.media.some(m=>f.media==='image'?m.kind==='image':f.media==='gif'?m.kind==='gif':m.kind==='video')));
}
export function validLocale(value:string|null):Locale{return locales.includes(value as Locale)?value as Locale:'en';}
const siteBase=(process.env.NEXT_PUBLIC_BASE_PATH||'').replace(/\/$/,'');
export function assetHref(path:string,offline=false){return (offline?'./':siteBase+'/')+path;}
export function paperHref(id:string,lang:Locale,offline=false){return offline?`index.html?paper=${encodeURIComponent(id)}&lang=${lang}`:`${siteBase}/papers/${encodeURIComponent(id)}?lang=${lang}`;}
export function homeHref(lang:Locale,offline=false){return offline?`index.html?lang=${lang}`:`${siteBase}/?lang=${lang}`;}
export const quad=(en:string,zh:string,ja:string,ko:string):Localized=>({en,zh,ja,ko});

export function viewHref(view:string,lang:Locale,offline=false){return view==='all'?homeHref(lang,offline):offline?`index.html?view=${view}&lang=${lang}`:`${siteBase}/${view}?lang=${lang}`;}
