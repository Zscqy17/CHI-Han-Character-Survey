"""Derive overlapping review themes from the frozen corpus, without recoding papers."""
import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
CORPUS = SITE.parent / 'manuscript/supplementary_corpus.csv'
rows = list(csv.DictReader(CORPUS.open()))
papers = json.loads((SITE / 'data/papers.json').read_text())
assert len(rows) == 241 and {r['bibkey'] for r in rows} == {p['id'] for p in papers}
by_id = {p['id']: p for p in papers}
taxonomy = json.loads((SITE / 'public/data/review-taxonomy.json').read_text())
definitions = [
    {'code': 'touch_mobile', 'labelKey': 'touchMobileTopic', 'label': 'Touch and mobile input',
     'section': 'Touch and Mobile Input', 'sectionLabel': 'sec:touch',
     'field': 'modality', 'anyOf': ['touch_mobile']},
    {'code': 'alternative_controls', 'labelKey': 'alternativeControlsTopic', 'label': 'Handwriting and alternative controls',
     'section': 'Handwriting and Alternative Controls', 'sectionLabel': 'sec:handwriting-controls',
     'field': 'modality', 'anyOf': ['handwriting', 'gesture', 'gaze', 'bci', 'speech', 'emg', 'braille', 'other']},
    {'code': 'accessibility', 'labelKey': 'accessibilityTopic', 'label': 'Accessibility and user needs',
     'section': 'Accessibility and Participant Coverage', 'sectionLabel': 'sec:accessibility',
     'field': 'user_group', 'anyOf': ['visual_impaired', 'motor_impaired', 'als_locked_in', 'elderly']},
    {'code': 'xr', 'labelKey': 'xrTopic', 'label': 'Immersive input (XR)',
     'section': 'Immersive Entry and Output Checking', 'sectionLabel': 'sec:xr',
     'field': 'modality', 'anyOf': ['xr']},
    {'code': 'other', 'labelKey': 'otherTopics', 'label': 'Others',
     'rule': 'No match to the four review-theme rules above; not a missing paper or an exclusion.'},
]
records = []
for row in rows:
    paper = by_id[row['bibkey']]
    modalities = row['modality'].split('|')
    populations = row['user_group'].split('|')
    approaches = row['conversion_tech'].split('|')
    assert modalities == paper['modalities'] and approaches == paper['tech'], row['bibkey']
    topics = []
    evidence = []
    for definition in definitions[:-1]:
        matches = [code for code in row[definition['field']].split('|') if code in definition['anyOf']]
        if matches:
            topics.append(definition['code'])
            evidence.append({'topic': definition['code'], 'field': definition['field'], 'codes': matches})
    if not topics:
        topics = ['other']
        evidence = [{'topic': 'other', 'rule': 'No match to the four named themes'}]
    records.append({'id': row['bibkey'], 'era': row['era'], 'approaches': approaches,
                    'modalities': [m for m in modalities if m != 'xr'],
                    'scenarios': topics, 'userGroups': populations, 'topicEvidence': evidence})
taxonomy['basis']['coding'] = 'Original review codes are retained. Reading themes are derived from the four interaction sections and can overlap. XR remains a context, not an input signal. Intended users do not establish who participated in a study.'
taxonomy['basis']['topicSource'] = 'supplementary_corpus.csv: modality and user_group'
taxonomy['basis']['sourceCorpusSha256'] = hashlib.sha256(CORPUS.read_bytes()).hexdigest()
taxonomy['scenarioKind'] = 'overlapping_review_themes'
taxonomy['scenario'] = [d['code'] for d in definitions]
taxonomy['topicDefinitions'] = definitions
taxonomy['records'] = records
text = json.dumps(taxonomy, ensure_ascii=False, indent=2) + '\n'
for dest in ['data/review-taxonomy.json', 'public/data/review-taxonomy.json']:
    (SITE / dest).write_text(text)
print(json.dumps({'papers': len(records), 'topics': dict(Counter(t for r in records for t in r['scenarios']))}))
