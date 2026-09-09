"""Import visually checked figure excerpts from the private asset audit.
This script needs the original review workspace; website builds use the frozen data.
"""
from pathlib import Path
import hashlib,json,shutil,struct,re
SITE=Path(__file__).resolve().parents[1]
OUTPUT=SITE.parent
papers={p['id']:p for p in json.loads((SITE/'data/papers.json').read_text())}
records=[]
for name in ['a','b','c']:
 records+=json.loads((OUTPUT/'website-audit'/('figure-batch-'+name)/'records.json').read_text())
assert len(records)==241 and {r['paperId'] for r in records}==set(papers)
dest=SITE/'public/media/paper-figures';dest.mkdir(parents=True,exist_ok=True)
media=[];audit=[]
for r in records:
 p=papers[r['paperId']]
 if r.get('reused'):
  assert any(m.get('file') and m.get('figure')!='example' for m in p['media']),p['id']
  audit.append({'id':p['id'],'selection':'existing_source_media'})
  continue
 source=Path(r['file'])
 assert source.is_file() and r['visuallyChecked'],p['id']
 image_bytes=source.read_bytes();assert image_bytes[:8]==b'\x89PNG\r\n\x1a\n'
 if r.get('assetSha256'):assert hashlib.sha256(image_bytes).hexdigest()==r['assetSha256'],p['id']
 # A single IME candidate bar is legitimately shallow; preserve its source crop.
 width,height=struct.unpack('>II',image_bytes[16:24]);assert width>=160 and height>=24 and width*height>=10000,p['id']
 page=int(r['page']);assert 1<=page<=p['pdfPages']
 pdf=OUTPUT/'CJK-Input-Atlas'/p['pdfFile']
 pdfhash=hashlib.sha256(pdf.read_bytes()).hexdigest()
 assert pdfhash==r['sourcePdfSha256'],p['id']
 assert len(r['rect'])==4 and r['rect'][2]>r['rect'][0] and r['rect'][3]>r['rect'][1]
 target=dest/(p['id']+'.png');shutil.copyfile(source,target)
 kind=r['kind'];assert kind in ['figure','table','page_preview']
 figure=re.sub(r'^(?:figure|fig|table|tbl|图|表)[.\s]*','',str(r.get('figure') or ''),flags=re.I).strip()
 if kind=='figure':
  captions={'en':f'Figure {figure} from the original paper.','zh':f'原论文图 {figure}。','ja':f'原論文の図 {figure}。','ko':f'원 논문의 그림 {figure}.'}
 elif kind=='table':
  captions={'en':f'Table {figure} from the original paper.','zh':f'原论文表 {figure}。','ja':f'原論文の表 {figure}。','ko':f'원 논문의 표 {figure}.'}
 else:
  captions={'en':'Original page preview; a separate illustration was not identified.','zh':'原文页面预览，未识别到可单独展示的配图。','ja':'原文ページのプレビュー。独立して表示できる図は確認されませんでした。','ko':'원문 페이지 미리보기. 별도로 표시할 그림은 확인되지 않았습니다.'}
 item={'id':p['id']+'-paper-illustration','paperId':p['id'],'kind':'image','file':'media/paper-figures/'+target.name,'sourceKind':kind,'galleryPrimary':True,'page':page,'originalPdfPage':p['originalPages'][page-1],'figure':figure or None,'caption':captions,'captionOriginal':r.get('captionOriginal',''),'sourceUrl':p['sources'][0]['url'],'rights':'source_excerpt','sourcePdfSha256':pdfhash,'fileSha256':hashlib.sha256(target.read_bytes()).hexdigest(),'rect':r['rect'],'visuallyChecked':True,'width':width,'height':height}
 media.append(item)
 item.update({k:r[k] for k in ['pageRotation','rectCoordinateSpace'] if k in r})
 audit.append({'id':p['id'],'selection':kind,'mediaId':item['id'],'page':page,'originalPdfPage':item['originalPdfPage'],'figure':figure or None,'rect':r['rect'],'sourcePdfSha256':pdfhash,'imageSha256':item['fileSha256'],'visuallyChecked':True,**{k:r[k] for k in ['pageRotation','rectCoordinateSpace'] if k in r}})
(SITE/'data/paper-illustrations.json').write_text(json.dumps(media,ensure_ascii=False,indent=2))
(SITE/'public/data/figure-selections.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
credits=SITE/'public/data/media-credits.md'
intro=credits.read_text().split('## Original paper excerpts')[0].rstrip()
lines=['## Original paper excerpts', 'These source excerpts were selected from the user-provided article PDFs for the review companion. Rights remain with the original rights holders; this section does not assign an open license. Figures, tables and page previews are identified separately. Figure coordinates, source hashes and visual checks are in `figure-selections.json`.', '']
for m in media:
 p=papers[m['paperId']]
 figure=(' '+m['figure']) if m.get('figure') else ''
 lines.append(f"- **{p['id']}** — [{p['title']}]({m['sourceUrl']}). {p['authors']} ({p['year']}). {m['sourceKind']}{figure}, included article PDF page {m['page']}. File: `{m['file']}`.")
credits.write_text(intro+'\n\n'+'\n\n'.join(lines)+'\n')
print('Imported',len(media),'original paper images; existing assets reused',241-len(media))
