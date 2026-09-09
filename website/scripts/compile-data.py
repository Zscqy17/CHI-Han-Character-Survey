"""Rebuild the public catalogue from the canonical tables and private audit.
Run in the survey workspace. Only curated fields are exported.
"""
import csv,json,re
from pathlib import Path
SITE=Path(__file__).resolve().parents[1];OUTPUT=SITE.parent
corpus=list(csv.DictReader((OUTPUT/'manuscript/supplementary_corpus.csv').open()))
inv={r['bibkey']:r for r in json.loads((OUTPUT/'website-audit/inventory.json').read_text())}
checks={r['bibkey']:r for r in json.loads((OUTPUT/'website-audit/source_checks.json').read_text())}
annotations={r['id']:r for r in csv.DictReader((SITE/'data/annotations.tsv').open(),delimiter='\t')}
ja={r['id']:r for r in csv.DictReader((SITE/'data/annotations-jako.tsv').open(),delimiter='\t')}
media=json.loads((SITE/'data/media.json').read_text())
if (SITE/'data/video-media.json').exists():media+=json.loads((SITE/'data/video-media.json').read_text())
if (SITE/'data/paper-illustrations.json').exists():media+=json.loads((SITE/'data/paper-illustrations.json').read_text())
def clean(s):return s.replace('{','').replace('}','').replace('\\&','&').strip()
views={r['id']:r for r in json.loads((SITE/'data/views.json').read_text())}
records=[]
for r in corpus:
 k=r['bibkey'];i=inv[k];c=checks[k];m=[a for a in media if a['paperId']==k]
 script='zh' if r['lang_script'].startswith('zh') else r['lang_script'] if r['lang_script'] in ['ja','ko'] else 'other'
 summary={lang:(annotations[k] if lang in ['en','zh'] else ja[k])[lang] for lang in ['en','zh','ja','ko']}
 sources=[{'kind':'publication','url':c['source_url'],'status':c['status'],'httpStatus':c.get('http_status'),'checkedAt':c['checked_utc'][:10]}]
 if c.get('open_fulltext_url'):sources.append({'kind':'fulltext','url':c['open_fulltext_url'],'status':c.get('open_fulltext_status','linked_from_publication'),'httpStatus':c.get('open_fulltext_http_status'),'checkedAt':c['checked_utc'][:10]})
 if r['doi'] and 'doi.org/'+r['doi']!=c['source_url']:sources.append({'kind':'doi','url':'https://doi.org/'+r['doi'],'status':'identifier','checkedAt':c['checked_utc'][:10]})
 rec=dict(id=k,title=clean(r['title']),authors=clean(r['authors']),year=int(r['year']),venue=clean(r['venue']),tier=r['venue_tier'],script=script,scriptCodes=r['lang_script'].split('|'),modalities=r['modality'].split('|'),tech=r['conversion_tech'].split('|'),features=[v for v in r['ime_features'].split('|') if v!='none'],summary=summary,sources=sources,media=m,pdfFile='papers/'+k+'.pdf',pdfPages=len(i['reviewed_pages']),originalPages=i['reviewed_pages'],sourceSha256=i['pdf_sha256'],audit={'localFulltext':'hash_verified','publicationStatus':c['status'],'identityBasis':c['identity_basis'],'figureCaptionCount':len(i['figures']),'mediaStatus':'displayed' if any(x.get('file') for x in m) else 'source_link_found' if m else 'no_relevant_media_found_in_accessible_sources' if c['status'] in ['reachable','pdf_response'] else 'publisher_unavailable_local_fulltext_checked','checkedAt':c['checked_utc'][:10]})
 rec.update(views=views[k]['views'],viewBasis=views[k]['basis'],contributionType=views[k]['contributionType'],evaluationType=views[k]['evaluationType'])
 records.append(rec)
assert len(records)==len({r['id'] for r in records})==241
assert sum(r['tier']=='EN-A' for r in records)==57
assert sum(r['tier']=='EN-B' for r in records)==184
assert all(all(r['summary'].values()) and r['sources'] for r in records)
(SITE/'data/papers.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
(SITE/'public/data/catalogue.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
fields=['id','title','authors','year','venue','tier','script','views','viewBasis','source_url','publication_status','open_fulltext_url','fulltext_identity','media_status','figure_captions_detected','media_items','checked_at','summary_en','summary_zh','summary_ja','summary_ko']
with (SITE/'public/data/catalogue.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.DictWriter(f,fields);w.writeheader()
 for r in records:w.writerow({**{k:r[k] for k in fields if k in r},'views':' | '.join(r['views']),'source_url':r['sources'][0]['url'],'publication_status':r['audit']['publicationStatus'],'open_fulltext_url':next((s['url'] for s in r['sources'] if s['kind']=='fulltext'),''),'fulltext_identity':'SHA-256 matched prior reading record','media_status':r['audit']['mediaStatus'],'figure_captions_detected':r['audit']['figureCaptionCount'],'media_items':' | '.join(m['id'] for m in r['media']),'checked_at':r['audit']['checkedAt'],**{'summary_'+l:r['summary'][l] for l in r['summary']}})
# Exact per-item source/media audit with no local paths or internal review notes.
(SITE/'public/data/verification.json').write_text(json.dumps([{'id':r['id'],'sources':r['sources'],'audit':r['audit'],'media':[{'id':m['id'],'source':m['sourceUrl'],'page':m.get('page'),'figure':m.get('figure'),'timestamps':m.get('timestamps'),'license':m.get('license'),'disposition':'included' if m.get('file') else 'external_only'} for m in r['media']]} for r in records],ensure_ascii=False,indent=2))
(SITE/'public/data/media.json').write_text(json.dumps(media,ensure_ascii=False,indent=2))
bib=[]
for r in records:
 fields={'title':r['title'],'author':r['authors'],'year':str(r['year']),'howpublished':r['venue'],'url':r['sources'][0]['url']}
 bib.append('@misc{'+r['id']+',\n'+',\n'.join('  '+k+' = {'+v+'}' for k,v in fields.items())+'\n}')
(SITE/'public/data/references.bib').write_text('\n\n'.join(bib)+'\n')
print('Compiled',len(records),'papers;',len(media),'media items')
