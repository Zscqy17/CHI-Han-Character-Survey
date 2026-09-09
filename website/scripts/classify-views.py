"""Editorial website views, aligned with the review's conversion and interaction lines.
This derived classification does not modify manuscript coding or force exclusivity.
"""
import csv,json,re
from pathlib import Path
SITE=Path(__file__).resolve().parents[1]
rows=list(csv.DictReader((SITE.parent/'manuscript/supplementary_corpus.csv').open()))
# Model/data/security evaluations belong to the algorithm view; layout-only,
# tool-comparison and candidate-cost benchmarks are interaction evidence.
interaction_bench=set('higashida2015one po2009six jia2013kyss yao2019seeime cao2020evaluation'.split())
algorithm_extra=set('shi2019vipboard sano2007recognition mladenov2008integrated komatsu2005corpus ikegami2015hybrid ikegami2017flick ikegami2024fast hagiwara2013koosho hsu2006spoken jiang2008multimodal lin2011auxiliary sha2011automatic wang2012improving sim2014multimodal yang2014chinese huang2015input xiao2016pinyin huang2017research huang2017researchb huang2018research meng2018smart yang2020subsequent chen2025investigating li2026asynchronous zhang2026tone gao2024character guo2021calibration huang2022calibration yang2024reconstructing wu2025mind yuasa2025flickpose takeuchi2026kuchimoji ahn2026cheonjiin li2020approach yu2019asynchronous knockel2024silent wei2009linux li2010prompting zhu2012design'.split())
# Explicitly inspected systems connect a model/recognizer with a new input,
# candidate, correction or output-control interface, including design-only work.
interaction_extra=set('ezaki2000pen fu2009fast wang2010accurate mladenov2008integrated ikegami2012modeless higashida2015one yang2018interaction lo2002cross matic2002quickstroke ge2005online zhou2006improved lin2008novel gong2009design po2009six wei2009linux li2010prompting wang2012approach zhu2012design anon2015smart huang2017research huang2018moon meng2018smart yao2019seeime zhang2019smarthandwriting cao2020evaluation jia2013kyss'.split())
records=[]
for r in rows:
 k=r['bibkey'];benchmark=r['eval_type'] in ['corpus_benchmark','system_benchmark','security_measurement']
 alg=(benchmark and k not in interaction_bench) or k in algorithm_extra
 interaction=(not benchmark and k not in ['sano2007recognition','xiao2016pinyin','yang2020subsequent','knockel2024silent']) or k in interaction_bench or k in interaction_extra
 assert alg or interaction,k
 tracks=(['algorithms'] if alg else [])+(['interaction'] if interaction else [])
 reason='joint_model_and_input_system' if len(tracks)==2 else 'conversion_recognition_data_or_infrastructure' if alg else 'input_control_user_or_evaluation_evidence'
 records.append({'id':k,'views':tracks,'basis':reason,'contributionType':r['contribution_type'],'evaluationType':r['eval_type']})
(SITE/'data/views.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
with (SITE/'public/data/view-classification.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,['id','views','basis','contributionType','evaluationType']);w.writeheader();w.writerows([{**r,'views':' | '.join(r['views'])} for r in records])
print({v:sum(v in r['views'] for r in records) for v in ['algorithms','interaction']},'both',sum(len(r['views'])==2 for r in records))
