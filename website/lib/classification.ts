import {quad as q, type Localized} from './catalogue';
export type ClassificationKey='script'|'modality'|'approach'|'evaluation'|'population';
export interface ClassificationDimension {key:ClassificationKey;label:Localized;options:{code:string;label:Localized}[]}
const options=(rows:[string,string,string,string,string][])=>rows.map(([code,...names])=>({code,label:q(...names)}));
export const classificationDimensions:ClassificationDimension[]=[
 {key:'script',label:q('Language / script','语言／文字','言語・文字','언어 / 문자'),options:options([
 ['zh_simp','Simplified Chinese','简体中文','簡体字中国語','간체 중국어'],['zh_trad','Traditional Chinese','繁体中文','繁体字中国語','번체 중국어'],['zh_classical','Classical Chinese','文言文','漢文','한문'],['ja','Japanese','日文','日本語','일본어'],['ko','Korean','韩文','韓国語','한국어'],['multi_cjk','Multi-CJK','多种中日韩文字','複数のCJK文字','복수 CJK 문자'],['general','General','通用','汎用','일반']])},
 {key:'modality',label:q('Input tags','输入标签','入力タグ','입력 태그'),options:options([
 ['kb_phonetic','Phonetic keyboard','语音编码键盘','音韻キーボード','음운 키보드'],['kb_shape','Shape keyboard','字形编码键盘','字形キーボード','자형 키보드'],['touch_mobile','Touch/mobile','触控／移动端','タッチ・モバイル','터치 / 모바일'],['handwriting','Handwriting','手写','手書き','필기'],['speech','Speech','语音','音声','음성'],['gaze','Gaze','眼动','視線','시선'],['bci','BCI','脑机接口','脳コンピューターインターフェース','뇌–컴퓨터 인터페이스'],['emg','EMG','肌电','筋電','근전도'],['gesture','Gesture','手势','ジェスチャー','제스처'],['xr','XR (scenario)','XR（场景）','XR（利用場面）','XR (시나리오)'],['braille','Braille','盲文','点字','점자'],['other','Other','其他','その他','기타']])},
 {key:'approach',label:q('Computational approach','计算方法','計算手法','계산 방법'),options:options([
 ['rule','Rule-based','规则方法','規則ベース','규칙 기반'],['stat_lm','Statistical','统计方法','統計的手法','통계적 방법'],['hybrid','Hybrid','混合方法','ハイブリッド','혼합'],['neural','Neural','神经方法','ニューラル','신경망'],['llm','LLM','大语言模型','大規模言語モデル','대규모 언어 모델'],['na','Others','其他','その他','기타']])},
 {key:'evaluation',label:q('Evaluation','评价方式','評価','평가'),options:options([
 ['lab_study','Lab study','实验室研究','実験室研究','실험실 연구'],['conversion_accuracy','Output/classifier accuracy','输出／分类准确率','出力・分類精度','출력 / 분류 정확도'],['task_time','Task time','任务时间','タスク時間','과제 시간'],['error_rate','Error rate','错误率','誤り率','오류율'],['wpm','Entry speed','输入速度','入力速度','입력 속도'],['kspc','Action effort','操作成本','操作負担','조작 부담'],['subjective_ux','Subjective UX','主观用户体验','主観的UX','주관적 UX'],['field_study','Field study','实地研究','フィールド研究','현장 연구'],['other_eval','Other evaluation','其他评价','その他の評価','기타 평가'],['no_eval','No eval. identified','未发现评价','評価の記載なし','확인된 평가 없음']])},
 {key:'population',label:q('Intended population','目标人群','対象利用者','대상 사용자'),options:options([
 ['general','General','通用人群','一般利用者','일반 사용자'],['motor_impaired','Motor impaired','运动障碍人群','運動障害者','운동 장애인'],['visual_impaired','Visual impaired','视觉障碍人群','視覚障害者','시각 장애인'],['als_locked_in','ALS/locked-in','ALS／闭锁综合征人群','ALS・閉じ込め症候群','ALS / 감금 증후군'],['elderly','Older adults','老年人','高齢者','고령자'],['children','Children','儿童','子ども','아동'],['non_native_learners','Non-native learners','非母语学习者','非母語学習者','비원어민 학습자'],['other','Other','其他','その他','기타']])},
];
export const classificationNote=q('Tags can overlap. XR is a scenario; intended populations do not identify recruited participants.','标签可重叠。XR 表示应用场景；目标人群不等同于实际招募的参与者。','タグは重複する場合があります。XRは利用場面であり、対象利用者は実際の参加者とは限りません。','태그는 중복될 수 있습니다. XR은 사용 시나리오이며, 대상 사용자는 실제 모집된 참가자와 다를 수 있습니다.');
