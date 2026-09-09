"""Sync curated motion media into frozen catalogue exports, without recoding papers."""
import csv
import json
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
def read(path):
    return json.loads((SITE / path).read_text())
def write(path, data):
    (SITE / path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

motion = read('data/video-media.json')
papers = read('data/papers.json')
motion_ids = {m['id'] for m in motion}
assert len(motion_ids) == len(motion)
assert all(m['paperId'] in {p['id'] for p in papers} for m in motion)
for p in papers:
    current = {m['id']: m for m in p['media']}
    for m in motion:
        if m['paperId'] == p['id']:
            current[m['id']] = m
    p['media'] = list(current.values())
    dates = [m['checkedAt'] for m in p['media'] if m.get('checkedAt')]
    if dates:
        p['audit']['mediaCheckedAt'] = max(dates)
write('data/papers.json', papers)
write('public/data/catalogue.json', papers)
all_media = read('public/data/media.json')
merged = {m['id']: m for m in all_media}
merged.update({m['id']: m for m in motion})
write('public/data/media.json', list(merged.values()))

verification = read('public/data/verification.json')
by_id = {p['id']: p for p in papers}
for row in verification:
    p = by_id[row['id']]
    row['audit'] = p['audit']
    row['media'] = [{
        'id': m['id'], 'source': m['sourceUrl'], 'page': m.get('page'),
        'figure': m.get('figure'), 'timestamps': m.get('timestamps'),
        'license': m.get('license'), 'disposition': 'included' if m.get('file') else 'external_only',
        **({'sourceType': m['sourceType'], 'frames': m['frames'], 'sourcePdfSha256': m['sourcePdfSha256']} if m.get('frames') else {}),
        **({'checkedAt': m['checkedAt']} if m.get('checkedAt') else {})
    } for m in p['media']]
write('public/data/verification.json', verification)

for name, item_field in [('catalogue.csv', 'media_items'), ('media-audit.csv', 'included_or_linked_items')]:
    path = SITE / 'public/data' / name
    with path.open(encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        fields = reader.fieldnames
        rows = list(reader)
    for row in rows:
        p = by_id[row['id']]
        row[item_field] = ' | '.join(m['id'] for m in p['media'])
        if name == 'media-audit.csv':
            row['media_result'] = p['audit']['mediaStatus']
            row['checked_date'] = p['audit'].get('mediaCheckedAt', p['audit']['checkedAt'])
    with path.open('w', encoding='utf-8-sig' if name == 'catalogue.csv' else 'utf-8', newline='') as f:
        writer = csv.DictWriter(f, fields, lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)

credits = SITE / 'public/data/media-credits.md'
text = credits.read_text().split('## Additional conference videos and key frames')[0].rstrip()
text = text.replace('The ACL key-frame GIF crops actual video frames', 'The ACL key-frame GIFs select actual video frames')
text = text.replace('https://aclanthology.org/faq/#what-is-the-copyright-for-materials-in-the-acl-anthology', 'https://aclanthology.org/faq/copyright/')
lines = ['## Additional conference videos and key frames',
         'Added 2026-09-09. Video GIFs preserve original video frames and include a separate timestamp strip. Paper-figure slideshows retain original figure order. Paper-excerpt slideshows start with a reviewed illustration, table or preview, followed by source pages. Full-page views preserve multipart figures when separate crop boundaries are uncertain. All slideshows retain source links; their timing is editorial. External-only records do not assign a reuse license to the videos.']
for m in motion:
    if not m.get('checkedAt'):
        continue
    p = by_id[m['paperId']]
    lines += [f"### {m['id']}", f"{p['authors']} ({p['year']}). *{p['title']}*.",
              f"[Source]({m['sourceUrl']})." + (f" [Original video]({m['videoUrl']})." if m.get('videoUrl') else ''), m['caption']['en']]
    if m.get('file'):
        lines += [f"File: `{m['file']}`.", m['adaptation'], f"GIF SHA-256: `{m['assetSha256']}`."]
        if m.get('frames'):
            lines += [f"Original PDF SHA-256: `{m['sourcePdfSha256']}`. Attributed source excerpts; no new license is assigned."]
            lines += [f"- {('Figure '+str(f['figure'])) if f.get('figure') else 'Source page'}, PDF page {f['page']}: `{f['file']}`." for f in m['frames']]
        else:
            lines += [f"Timestamps (seconds): {m['timestamps']}.",
                      f"License: [{m['license']}]({m['licenseUrl']}); [publisher policy]({m['licenseBasis']}).",
                      f"Source SHA-256: `{m['sourceSha256']}`."]
    else:
        lines += ['External source only; no local reproduction.']
credits.write_text(text + '\n\n' + '\n\n'.join(lines) + '\n')
print(f'Synced {len(motion)} motion media records across {len(papers)} papers.')
