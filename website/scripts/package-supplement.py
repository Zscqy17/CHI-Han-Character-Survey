"""Assemble the review supplement after npm run build and npm run offline."""
from pathlib import Path
import csv,json,hashlib,shutil,zipfile,datetime,re
import fitz
SITE=Path(__file__).resolve().parents[1];OUTPUT=SITE.parent;ROOT=OUTPUT.parent;DEST=OUTPUT/'CJK-Input-Atlas'
corpus=json.loads((SITE/'data/papers.json').read_text());syn={r['bibkey']:r for r in csv.DictReader((OUTPUT/'manuscript/supplementary_synthesis.csv').open())}
assert (DEST/'index.html').exists(),'Run npm run offline first'
(DEST/'papers').mkdir(exist_ok=True)
for folder in ['media','data']:
 shutil.copytree(SITE/'public'/folder,DEST/folder,dirs_exist_ok=True)
manifest=[]
previous={r['id']:r for r in json.loads((DEST/'data/paper-files.json').read_text())} if (DEST/'data/paper-files.json').exists() else {}
for r in corpus:
 prior=previous.get(r['id']);existing=DEST/r['pdfFile']
 if prior and prior.get('pdfTextPreserved',prior.get('printedTextVerified')) and prior['sourceSha256']==r['sourceSha256'] and existing.exists() and hashlib.sha256(existing.read_bytes()).hexdigest()==prior['packageSha256']:
  manifest.append(prior);continue
 source=ROOT/syn[r['id']]['source_pdf'];original=fitz.open(source);copy=fitz.open(source)
 # A single source is a bound issue; all other entries retain the whole article.
 numbers=r['originalPages'] if r['id']=='petrovi2013metoda' else list(range(1,len(original)+1))
 if len(numbers)!=len(copy):copy.select([n-1 for n in numbers])
 for page in copy:
  for annotation in list(page.annots() or []):page.delete_annot(annotation)
  for widget in list(page.widgets() or []):page.delete_widget(widget)
 for name in copy.embfile_names():copy.embfile_del(name)
 copy.set_metadata({});copy.del_xml_metadata();copy.xref_set_key(-1,'Info','null')
 dest=DEST/r['pdfFile'];save_method='metadata_cleanup'
 try:copy.save(dest,garbage=3,deflate=True,no_new_id=True)
 except Exception:
  copy.close();copy=fitz.open()
  if len(numbers)==len(original):copy.insert_pdf(original,links=True,annots=False,widgets=False)
  else:
   for n in numbers:copy.insert_pdf(original,from_page=n-1,to_page=n-1,links=True,annots=False,widgets=False)
  copy.set_metadata({});copy.del_xml_metadata();copy.xref_set_key(-1,'Info','null');copy.save(dest,garbage=3,deflate=True,no_new_id=True);save_method='xref_repair_and_metadata_cleanup'
 copy.close()
 with fitz.open(dest) as saved:
  assert len(saved)==len(numbers)
  assert all(saved[j].get_text()==original[n-1].get_text() for j,n in enumerate(numbers)),r['id']+' text changed'
  assert not saved.get_xml_metadata(),r['id']+' XMP not cleared'
  assert all(not saved.metadata.get(k) for k in ['author','title','subject','keywords','creator','producer','creationDate','modDate']),r['id']+' metadata not cleared'
 manifest.append({'id':r['id'],'file':r['pdfFile'],'pages':len(numbers),'originalPdfPages':numbers,'sourceSha256':r['sourceSha256'],'packageSha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size,'metadataRemoved':True,'printedTextVerified':True,'saveMethod':save_method})
 original.close()
(DEST/'data/paper-files.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
shutil.copyfile(SITE/'README.md',DEST/'SOURCE-README.md')
for f in SITE.glob('supplement-README*.md'):shutil.copyfile(f,DEST/f.name.replace('supplement-',''))
# Keep a self-sufficient, anonymous source snapshot; omit hosting IDs and private audit.
source=DEST/'source';source.mkdir(exist_ok=True)
for folder in ['app','lib','components','hooks','data','scripts','public']:
 shutil.copytree(SITE/folder,source/folder,dirs_exist_ok=True,ignore=shutil.ignore_patterns('__pycache__'))
for name in ['package.json','package-lock.json','tsconfig.json','vite.config.ts','next.config.ts','components.json','README.md','.gitignore']:
 if (SITE/name).exists():shutil.copyfile(SITE/name,source/name)
if (SITE/'work/verification.json').exists():shutil.copyfile(SITE/'work/verification.json',DEST/'data/validation.json')
# The online export is separately reproducible; a static HTML fallback directory
# makes original paper links available even when JavaScript is disabled.
from html import escape
html=['<!doctype html><html lang="en"><meta charset="UTF-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Paper file index · CJK Input Atlas</title><style>body{font:16px system-ui;max-width:1000px;margin:40px auto;padding:20px;background:#fff;color:#111;line-height:1.6}li{margin:16px 0}a{color:#111}</style><h1>All 241 paper files</h1><p><a href="index.html">Open the four-language atlas</a></p><ol>']
for r in corpus:html.append('<li><a href="'+r['pdfFile']+'">'+escape(r['title'])+'</a> · '+str(r['year'])+' · '+r['tier']+' · <a href="'+escape(r['sources'][0]['url'],quote=True)+'">Original source</a></li>')
html.append('</ol></html>');(DEST/'paper-index.html').write_text('\n'.join(html))
checksums=[]
for f in sorted(DEST.rglob('*')):
 if f.is_file() and f.name!='SHA256SUMS.txt':checksums.append(hashlib.sha256(f.read_bytes()).hexdigest()+'  '+f.relative_to(DEST).as_posix())
(DEST/'SHA256SUMS.txt').write_text('\n'.join(checksums)+'\n')
archive=OUTPUT/'CJK-Input-Atlas-supplement.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for f in sorted(DEST.rglob('*')):
  if f.is_file():
   info=zipfile.ZipInfo('CJK-Input-Atlas/'+f.relative_to(DEST).as_posix(),date_time=(2026,9,8,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16;z.writestr(info,f.read_bytes())
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
report={'paperFiles':len(manifest),'pdfPages':sum(r['pages'] for r in manifest),'archiveBytes':archive.stat().st_size,'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':len(checksums)+1,'pdfTextPreserved':True,'pdfMetadataCleared':True}
(OUTPUT/'website-audit/package-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
