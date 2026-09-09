"""Verify GIF decoding and lossless source-page identity against reviewed PDFs."""
from pathlib import Path
import argparse, concurrent.futures, hashlib, json
import fitz
from PIL import Image

SITE=Path(__file__).resolve().parents[1]

def verify(task):
    paper, pdf_dir=task
    items=[m for m in paper['media'] if m['kind']=='gif']
    assert len(items)==1,paper['id']
    m=items[0]
    file=SITE/'public'/m['file']
    with Image.open(file) as gif:
        assert gif.n_frames>1
        count=gif.n_frames
        for i in range(count):gif.seek(i);gif.load()
    if m.get('frames'):assert count==len(m['frames'])
    page_checks=0
    if m.get('sourceType')=='paper_excerpt_slideshow':
        pdf=Path(pdf_dir)/(paper['id']+'.pdf')
        assert hashlib.sha256(pdf.read_bytes()).hexdigest()==m['sourcePdfSha256']
        with fitz.open(pdf) as doc:
            for f in m['frames']:
                source=SITE/'public'/f['file']
                assert hashlib.sha256(source.read_bytes()).hexdigest()==f['sha256']
                if f.get('kind')=='source_page':
                    page=doc[f['page']-1]
                    pix=page.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False)
                    with Image.open(source) as image:
                        assert image.size==(pix.width,pix.height)
                        assert image.convert('RGB').tobytes()==pix.samples
                    page_checks+=1
    return {'paperId':paper['id'],'gif':m['file'],'decodedFrames':count,
            'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),
            'losslessPagePixelChecks':page_checks,'passed':True}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf-dir',required=True,type=Path)
    parser.add_argument('--report',required=True,type=Path)
    args=parser.parse_args()
    papers=json.loads((SITE/'data/papers.json').read_text())
    with concurrent.futures.ProcessPoolExecutor(max_workers=3) as pool:
        rows=list(pool.map(verify,[(p,str(args.pdf_dir.resolve())) for p in papers]))
    result={'papers':len(rows),'passed':all(r['passed'] for r in rows),
            'losslessPagePixelChecks':sum(r['losslessPagePixelChecks'] for r in rows),
            'decodedFrames':sum(r['decodedFrames'] for r in rows),'records':rows}
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='records'}))

if __name__=='__main__':main()
