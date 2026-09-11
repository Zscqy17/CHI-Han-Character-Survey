"""Optimize a static or offline export; keep canonical source media unchanged."""
from pathlib import Path
from PIL import Image
import argparse, concurrent.futures, hashlib, json, shutil, subprocess, zipfile
import numpy as np

parser=argparse.ArgumentParser()
parser.add_argument('directory',type=Path)
parser.add_argument('--reuse-archive',type=Path,help='Reuse verified encodings from a matching offline ZIP')
parser.add_argument('--cache',type=Path,default=Path('/tmp/cjk-web-compression'))
args=parser.parse_args(); root=args.directory.resolve(); cache=args.cache
report_path=root/'data/offline-media-encoding.json'
if report_path.exists():
    print('Offline media already optimized; rebuild a fresh export before changing settings.')
    raise SystemExit(0)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files=sorted(p for p in (root/'media').rglob('*') if p.suffix in {'.png','.webp','.gif'})
def process(p):
    rel=p.relative_to(root); within=p.relative_to(root/'media'); before=p.stat().st_size
    original_sha=sha(p); target=p; method='unchanged'; pixel_exact=True; max_diff=0; rmse=0.0
    if p.suffix=='.png':
        candidate=cache/'pngs'/within.with_suffix('.webp');candidate.parent.mkdir(parents=True,exist_ok=True)
        if not candidate.exists():Image.open(p).save(candidate,format='WEBP',lossless=True,method=6,exact=True)
        a=Image.open(p).convert('RGBA');b=Image.open(candidate).convert('RGBA')
        assert a.size==b.size and a.tobytes()==b.tobytes(),str(rel)
        if candidate.stat().st_size<before:
            target=p.with_suffix('.lossless.webp'); assert not target.exists(),str(target)
            method='lossless PNG to WebP'
    elif p.suffix=='.webp':
        candidate=cache/'webps'/within;candidate.parent.mkdir(parents=True,exist_ok=True)
        if not candidate.exists():subprocess.run(['cwebp','-quiet','-lossless','-near_lossless','60','-m','6','-exact',str(p),'-o',str(candidate)],check=True)
        quality=60
        if before-candidate.stat().st_size>=5000:
            refined=cache/'webps40'/within;refined.parent.mkdir(parents=True,exist_ok=True)
            if not refined.exists():subprocess.run(['cwebp','-quiet','-lossless','-near_lossless','40','-m','6','-exact',str(p),'-o',str(refined)],check=True)
            if refined.stat().st_size<candidate.stat().st_size:candidate=refined;quality=40
        a=np.asarray(Image.open(p).convert('RGBA')).astype(np.int16)
        b=np.asarray(Image.open(candidate).convert('RGBA')).astype(np.int16)
        assert a.shape==b.shape,str(rel)
        diff=a-b;maximum=int(np.abs(diff).max());error=float(np.sqrt(np.mean(diff.astype(np.float32)**2)))
        if candidate.stat().st_size<before and maximum<=7 and error<=1.5:
            method=f'WebP near-lossless {quality}; original dimensions';max_diff=maximum;rmse=error;pixel_exact=maximum==0
    else:
        candidate=cache/'gifs'/within;candidate.parent.mkdir(parents=True,exist_ok=True)
        if not candidate.exists():subprocess.run(['gifsicle','-O3','--careful',str(p),'-o',str(candidate)],check=True,stderr=subprocess.DEVNULL)
        if candidate.stat().st_size<before:
            a=Image.open(p);b=Image.open(candidate)
            exact=a.size==b.size and a.n_frames==b.n_frames and a.info.get('loop')==b.info.get('loop')
            if exact:
                for i in range(a.n_frames):
                    a.seek(i);b.seek(i)
                    if a.info.get('duration')!=b.info.get('duration') or a.convert('RGBA').tobytes()!=b.convert('RGBA').tobytes():exact=False;break
            if exact:method='lossless GIF optimization; identical rendered frames and timing'
    if method!='unchanged':
        shutil.copyfile(candidate,target)
        if target!=p:p.unlink()
    return {'sourceFile':rel.as_posix(),'file':target.relative_to(root).as_posix(),'sourceSha256':original_sha,'sha256':sha(target),'sourceBytes':before,'bytes':target.stat().st_size,'encoding':method,'pixelExact':pixel_exact,'maximumChannelDifference':max_diff,'rgbaRmse':round(rmse,6)}
if args.reuse_archive:
    with zipfile.ZipFile(args.reuse_archive) as z:
        records=json.loads(z.read('data/offline-media-encoding.json'))['records']
        assert {r['sourceFile'] for r in records}=={p.relative_to(root).as_posix() for p in files}
        for r in records:
            original=root/r['sourceFile'];target=root/r['file']
            assert sha(original)==r['sourceSha256'],r['sourceFile']
            data=z.read(r['file']);assert hashlib.sha256(data).hexdigest()==r['sha256'],r['file']
            if target!=original:assert not target.exists(),r['file']
            target.write_bytes(data)
            if target!=original:original.unlink()
else:
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:records=list(pool.map(process,files))
replacements={}
for item in records:
    if item['sourceFile']!=item['file']:replacements[item['sourceFile']]=item['file']
    if item['sourceSha256']!=item['sha256']:replacements[json.dumps(item['sourceSha256'])]=json.dumps(item['sha256'])
# All application media references and asset hashes are JSON strings in the inline
# bundle and exported datasets. Preserve original asset hashes in this manifest.
for p in root.rglob('*'):
    if p.suffix not in {'.html','.js','.rsc','.json','.md','.csv','.bib','.txt'}:continue
    content=p.read_text();updated=content
    for old,new in replacements.items():updated=updated.replace(old,new)
    if updated!=content:p.write_text(updated)
report={'description':'Delivery encoding only. Original media remain in the research workspace. No resizing, cropping, frame removal or timing changes.','pngEncoding':'lossless WebP','webpEncoding':'near-lossless 60/40, accepted only when maximum channel difference <= 7/255 and RGBA RMSE <= 1.5/255','gifEncoding':'lossless, decoded frame pixels and durations verified','mediaFiles':len(records),'bytesBefore':sum(r['sourceBytes'] for r in records),'bytesAfter':sum(r['bytes'] for r in records),'records':records}
report_path.write_text(json.dumps(report,ensure_ascii=False,separators=(',',':'))+'\n')
meta_path=root/('OFFLINE-PACKAGE.json' if (root/'OFFLINE-PACKAGE.json').exists() else 'deployment.json')
if meta_path.exists():
    meta=json.loads(meta_path.read_text());meta['mediaEncodingManifest']='data/offline-media-encoding.json';meta['htmlBytes']=(root/'index.html').stat().st_size;meta_path.write_text(json.dumps(meta,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='records'},indent=2))
