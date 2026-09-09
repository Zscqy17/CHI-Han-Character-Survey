"""Create attributed paper-excerpt GIFs for every paper that has no animation.

Run with --pdf-dir pointing to the reviewed PDFs, named <bibkey>.pdf.
Only original pixels are used. Uncertain figure boundaries retain the entire
source page. Existing figure/video animations and paper classifications persist.
"""
from pathlib import Path
from datetime import date
import argparse, concurrent.futures, hashlib, json, re
import fitz
from PIL import Image, ImageDraw, ImageFont

SITE = Path(__file__).resolve().parents[1]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def run_one(task):
    paper, pdf_dir, audit_dir = task
    pid = paper['id']
    pdf = Path(pdf_dir) / (pid + '.pdf')
    pdf_hash = digest(pdf)
    doc = fitz.open(pdf)
    assert len(doc) == paper['pdfPages'], pid
    primary = next((m for m in paper['media'] if m['kind'] == 'image' and m.get('galleryPrimary')), None)
    primary = primary or next(m for m in paper['media'] if m['kind'] == 'image' and m.get('file'))
    if primary.get('sourcePdfSha256'):
        assert primary['sourcePdfSha256'] == pdf_hash, pid
    selected_pages = set()
    detected = {}
    # Detect on current PDFs, including Chinese figure captions absent from older
    # inventory exports. Broad references select whole pages, never a guessed crop.
    pattern = re.compile(r'^\s*(?:fig(?:ure)?\.?\s*[0-9]+|[图圖]\s*[0-9一二三四五六七八九十百]+)', re.I)
    for number, page in enumerate(doc, 1):
        lines = [line.strip() for line in page.get_text().splitlines()]
        matches = [line for line in lines if pattern.match(line)]
        if matches:
            selected_pages.add(number)
            detected[str(number)] = matches
    if primary.get('page'):
        selected_pages.add(primary['page'])
    # No recoverable figure caption: keep a source overview and a second page.
    fallback = not detected
    if fallback:
        selected_pages.update([1, min(2, len(doc))])

    frame_dir = SITE / 'public/media/paper-sequences' / pid
    frame_dir.mkdir(parents=True, exist_ok=True)
    frames = []
    primary_file = SITE / 'public' / primary['file']
    frames.append(dict(file=primary['file'], kind=primary.get('sourceKind') or 'figure',
                       figure=primary.get('figure'), page=primary.get('page', 1),
                       rect=primary.get('rect'), sha256=digest(primary_file),
                       sourceAssetId=primary['id'], sourceUrl=primary['sourceUrl'],
                       sourcePdfSha256=primary.get('sourcePdfSha256'),
                       captionOriginal=primary.get('captionOriginal', ''),
                       visualCheck='previously_reviewed_source_asset'))
    for number in sorted(selected_pages):
        if primary.get('sourceKind')=='page_preview' and number==primary.get('page'):
            continue
        page = doc[number - 1]
        # Preserve full displayed page: multipart figures, labels and axes cannot
        # be lost to automated crop boundaries. Detail links keep the readable view.
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        target = frame_dir / f'page-{number}.webp'
        im.save(target, lossless=True, method=4)
        frames.append(dict(file=str(target.relative_to(SITE / 'public')),
                           kind='source_page', figure=None, page=number,
                           rect=list(page.rect), pageRotation=page.rotation,
                           rectCoordinateSpace='displayed_page_pdf_points',
                           sourcePdfSha256=pdf_hash, sha256=digest(target),
                           detectedFigureReferences=detected.get(str(number), []),
                           visualCheck='full_page_render_preserves_source_geometry'))
    # All reviewed articles have multiple pages; retain a second actual source view
    # if the primary asset is itself an identical first-page preview.
    if len(frames) < 2:
        raise ValueError(f'{pid}: insufficient distinct source views')

    font_paths = ['/System/Library/Fonts/Supplemental/Arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']
    font_path = next((p for p in font_paths if Path(p).exists()), None)
    font = ImageFont.truetype(font_path, 18) if font_path else ImageFont.load_default()
    small = ImageFont.truetype(font_path, 14) if font_path else ImageFont.load_default()
    canvases = []
    for f in frames:
        im = Image.open(SITE / 'public' / f['file']).convert('RGB')
        im.thumbnail((1000, 680), Image.Resampling.LANCZOS)
        canvas = Image.new('RGB', (1040, 760), 'white')
        canvas.paste(im, ((1040-im.width)//2, 42+(680-im.height)//2))
        draw = ImageDraw.Draw(canvas)
        kind = 'SOURCE PAGE' if f['kind'] in ('source_page', 'page_preview') else ('TABLE' if f['kind']=='table' else 'FIGURE')
        fig_label = ' ' + str(f['figure']) if f.get('figure') else ''
        draw.text((16, 10), f'PAPER EXCERPT SLIDESHOW | {kind}{fig_label} | PDF page {f["page"]}', font=font, fill='black')
        draw.line((0, 729, 1040, 729), fill='#bbbbbb')
        draw.text((16, 739), f'{pid} | Editorial slideshow of source material. Slide duration is not input timing.', font=small, fill='black')
        canvases.append(canvas)
    file = f'media/{pid}-paper-slideshow.gif'
    poster = f'media/{pid}-paper-slideshow-poster.webp'
    canvases[0].save(SITE / 'public' / poster, lossless=True, method=4)
    durations = [4000] + [3000] * (len(canvases)-1)
    canvases[0].save(SITE / 'public' / file, save_all=True, append_images=canvases[1:],
                     duration=durations, loop=0, optimize=True, disposal=2)
    with Image.open(SITE / 'public' / file) as animation:
        assert animation.n_frames == len(frames)
        for i in range(animation.n_frames):
            animation.seek(i); animation.load()
    pages = ', '.join(str(n) for n in sorted(selected_pages))
    captions = dict(
        en=f'Paper-excerpt slideshow: the selected original illustration, table or preview, followed by source pages {pages}. Full pages preserve figure panels and labels where separate cropping is uncertain. This is an editorial slideshow, not a recorded input session. '+paper['summary']['en'],
        zh=f'原文图页轮播：先展示已选原文配图、表格或预览，再展示原文第 {pages} 页。整页保留裁切边界不确定的子图和标注。这是原文素材的编辑轮播，不是连续输入录像。'+paper['summary']['zh'],
        ja=f'原文図・ページのスライドショー：選定済みの図・表・プレビューの後に原文の {pages} ページを表示する。切り出し境界が不確かな図のパネルやラベルはページ全体で保持する。編集したスライドショーであり、連続入力の録画ではない。'+paper['summary']['ja'],
        ko=f'원문 그림·페이지 슬라이드쇼: 선정한 그림·표·미리보기 다음에 원문 {pages} 페이지를 표시한다. 잘라내기 경계가 불확실한 그림의 패널과 표기는 전체 페이지로 보존한다. 편집 슬라이드쇼이며 연속 입력 녹화가 아니다. '+paper['summary']['ko'])
    record = dict(id=pid+'-paper-slideshow', paperId=pid, kind='gif',
                  sourceType='paper_excerpt_slideshow', sourceKind='page_sequence',
                  file=file, poster=poster, sourceUrl=paper['sources'][0]['url'],
                  rights='source_excerpt', sourcePdfSha256=pdf_hash, frames=frames,
                  caption=captions, checkedAt=date.today().isoformat(), durationsMs=durations,
                  assetSha256=digest(SITE / 'public' / file),
                  adaptation='Previously reviewed original asset followed by full source-page renders. White attribution strips added independently. No synthesized characters, intermediate states or motion interpolation. 4/3-second durations are editorial.',
                  coverage=dict(sourcePages=sorted(selected_pages), detectedFigurePageCount=len(detected),
                                fallbackOverviewPages=fallback, individuallyCroppedAllFigures=False))
    doc.close()
    folder = Path(audit_dir) / pid; folder.mkdir(parents=True, exist_ok=True)
    (folder / 'record.json').write_text(json.dumps(record, ensure_ascii=False, indent=2)+'\n')
    # One contact strip per paper, including every actual GIF frame, for review.
    cols = 4; rows = (len(canvases)+cols-1)//cols
    sheet = Image.new('RGB', (1120, rows*225), '#eee')
    draw = ImageDraw.Draw(sheet)
    for i, canvas in enumerate(canvases):
        thumb = canvas.copy(); thumb.thumbnail((280,205))
        x,y = (i%cols)*280,(i//cols)*225
        sheet.paste(thumb, (x+(280-thumb.width)//2,y+18))
        draw.text((x+6,y+2), f'{i+1}: {frames[i]["kind"]} p{frames[i]["page"]}', fill='black')
    sheet.save(folder/'contact.jpg',quality=85)
    print(f'{pid}: {len(frames)} frames', flush=True)
    return record

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf-dir',type=Path,required=True)
    parser.add_argument('--audit-dir',type=Path,required=True)
    parser.add_argument('--workers',type=int,default=3)
    args=parser.parse_args()
    args.audit_dir.mkdir(parents=True,exist_ok=True)
    papers=json.loads((SITE/'data/papers.json').read_text())
    targets=[p for p in papers if not any(m['kind']=='gif' for m in p['media'])]
    with concurrent.futures.ProcessPoolExecutor(max_workers=args.workers) as pool:
        records=list(pool.map(run_one,[(p,str(args.pdf_dir.resolve()),str(args.audit_dir.resolve())) for p in targets]))
    (args.audit_dir/'generated-records.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'papers':len(records),'frames':sum(len(m['frames']) for m in records),
                      'gifBytes':sum((SITE/'public'/m['file']).stat().st_size for m in records)}))

if __name__=='__main__':
    main()
