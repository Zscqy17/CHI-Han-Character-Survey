import {quad as q, type Localized} from './catalogue';
export interface Process { pages:number[]; output:Localized; steps:{stage:'input'|'conversion'|'candidate'|'output';text:Localized;sample?:string}[] }
export const processes:Record<string,Process>={
 hagiwara2013koosho:{pages:[1,2,3],output:q('Kanji · Japanese','Kanji · 日文汉字','漢字・日本語','한자·일본어'),steps:[
 {stage:'input',text:q('Write consonant letters in the air.','在空中书写辅音字母。','空中に子音字母を書く。','공중에 자음 글자를 쓴다.'),sample:'H K B K R'},
 {stage:'conversion',text:q('Recognize letter trajectories and search a word lattice.','识别字母轨迹并搜索词格。','字母軌跡を認識し、単語格子を探索する。','글자 궤적을 인식하고 단어 격자를 탐색한다.')},
 {stage:'candidate',text:q('Touch a displayed candidate to confirm it.','触摸显示的候选进行确认。','表示された候補をタッチして確定する。','표시된 후보를 터치하여 확정한다.')},
 {stage:'output',text:q('The selected Kanji phrase becomes a search query; Fig. 3 illustrates this path.','选中的汉字词语成为检索词；图 3 展示这一路径。','選んだ漢字語を検索に使う。図3はこの経路の例。','선택한 한자 단어를 검색어로 사용한다. 그림 3은 이 경로의 예이다.'),sample:'福袋'}]},
 huang2004statistical:{pages:[1,2,3],output:q('Hanja / retained Hangul','Hanja／保留 Hangul','漢字／保持されるHangul','한자 / 유지된 한글'),steps:[
 {stage:'input',text:q('A Hangul sentence in a terminology domain.','术语领域的 Hangul 句子。','専門用語領域のHangul文。','전문 용어 분야의 한글 문장.')},
 {stage:'conversion',text:q('Transfer and language models jointly infer tokenization and Hanja correspondences.','转换模型与语言模型联合推断切分及 Hanja 对应。','変換モデルと言語モデルが分割と漢字対応を推定する。','변환 모델과 언어 모델이 분할과 한자 대응을 함께 추론한다.')},
 {stage:'output',text:q('Context determines Hanja conversion or Hangul retention. Page 1 gives 수술 / 手術 as one sense example.','上下文决定转换为 Hanja 或保留 Hangul。第 1 页列出 수술／手術 的词义示例。','文脈で漢字変換かHangul保持を決める。1ページに수술／手術の語義例がある。','문맥에 따라 한자로 변환하거나 한글을 유지한다. 1페이지는 수술 / 手術의 의미 예를 제시한다.'),sample:'수술 → 手術'}]},
 yuasa2025flickpose:{pages:[6,7,8,9],output:q('Kana → Kanji · Japanese','假名 → Kanji · 日文','仮名 → 漢字・日本語','가나 → 한자·일본어'),steps:[
 {stage:'input',text:q('Select a key with one hand and a symbol with the other hand pose.','一只手选键，另一只手通过姿态选字。','片手でキーを選び、もう一方の手の姿勢で文字を選ぶ。','한 손으로 키를 고르고 다른 손 자세로 문자를 선택한다.')},
 {stage:'conversion',text:q('The dictionary converts entered kana into Japanese words.','词典将输入的假名转换为日文词语。','辞書で入力済みの仮名を日本語の語へ変換する。','사전으로 입력된 가나를 일본어 단어로 변환한다.')},
 {stage:'candidate',text:q('Use conversion and word-candidate controls in the panels.','通过面板上的转换与词语候选控件操作。','パネルの変換・単語候補操作を使う。','패널의 변환 및 단어 후보 제어를 사용한다.')},
 {stage:'output',text:q('Confirm written Japanese in the text field.','在文本框中确认日文文字。','テキスト欄の日本語を確定する。','텍스트 필드에서 일본어를 확정한다.')}]},
 jia2014joint:{pages:[2,3,4,5,6],output:q('Pinyin → Hanzi','拼音 → 汉字','拼音 → 漢字','병음 → 한자'),steps:[
 {stage:'input',text:q('A Pinyin sequence that can contain typing errors.','可能包含键入错误的拼音序列。','入力誤りを含みうる拼音列。','오타를 포함할 수 있는 병음 시퀀스.')},
 {stage:'conversion',text:q('A joint graph combines segmentation and typo alternatives with Chinese word probabilities.','联合图把切分、错拼替代与中文词语概率结合。','統合グラフが分割・誤入力候補・中国語単語確率を結ぶ。','결합 그래프가 분할·오타 대안·중국어 단어 확률을 통합한다.')},
 {stage:'candidate',text:q('Decode and rank Chinese candidate paths.','解码并排序中文候选路径。','漢字候補経路を復号して順位付けする。','한자 후보 경로를 디코딩하고 순위를 매긴다.')},
 {stage:'output',text:q('Chinese character sequences; the video excerpts explain the model rather than show a live typing trial.','生成汉字序列；视频摘帧解释模型，并非实时输入实验。','漢字列を生成する。動画抜粋はモデルの説明で、実時間入力実験ではない。','한자 시퀀스를 생성한다. 영상 발췌는 모델 설명이며 실시간 입력 실험이 아니다.')}]},
 ding2024generative:{pages:[1,2,3,4],output:q('Pinyin → Hanzi · generation','拼音 → 汉字 · 生成','拼音 → 漢字・生成','병음 → 한자·생성'),steps:[
 {stage:'input',text:q('Full, abbreviated or mistyped Pinyin, with optional context.','全拼、缩写或错拼，可附加上下文。','完全・省略・誤入力の拼音。文脈も利用できる。','전체·축약·오타 병음과 선택적 문맥.')},
 {stage:'conversion',text:q('A generative model conditions Chinese decoding on the input.','生成模型根据输入约束中文解码。','生成モデルが入力に条件付けて中国語を復号する。','생성 모델이 입력을 조건으로 중국어를 디코딩한다.')},
 {stage:'output',text:q('Conversion, continuation or rewriting, depending on the task.','根据任务执行转换、续写或改写。','課題に応じて変換・続筆・書換えを行う。','과제에 따라 변환·이어 쓰기·재작성을 수행한다.')}]},
 yao2019enabling:{pages:[1,2,3,4],output:q('Kana → Kanji · Japanese','假名 → Kanji · 日文','仮名 → 漢字・日本語','가나 → 한자·일본어'),steps:[
 {stage:'input',text:q('Romaji input is represented as kana.','罗马字输入表示为假名。','ローマ字入力を仮名で表す。','로마자 입력을 가나로 표현한다.')},
 {stage:'conversion',text:q('Incremental vocabulary selection reduces neural language-model work.','增量词表选择减少神经语言模型计算。','逐次語彙選択でニューラル言語モデルの計算を減らす。','점진적 어휘 선택으로 신경 언어 모델 계산을 줄인다.')},
 {stage:'candidate',text:q('A word lattice supports conversion and word prediction.','词格支持转换与词语预测。','語格子で変換と語予測を行う。','단어 격자로 변환과 단어 예측을 수행한다.')},
 {stage:'output',text:q('Japanese written-word candidates.','日文书写词语候选。','日本語の表記語候補。','일본어 표기 단어 후보.')}]},
 ahn2026cheonjiin:{pages:[5,6,7],output:q('Hangul composition','Hangul 组合','Hangul合成','한글 조합'),steps:[
 {stage:'input',text:q('EEG signals select five cursor commands.','脑电信号选择五种光标命令。','EEG信号で5種のカーソル命令を選ぶ。','EEG 신호로 다섯 커서 명령을 선택한다.')},
 {stage:'conversion',text:q('Cursor commands operate the Cheonjiin keyboard.','光标命令操控千地人键盘。','カーソル命令でCheonjiinキーボードを操作する。','커서 명령으로 천지인 키보드를 조작한다.')},
 {stage:'output',text:q('Hangul syllables. The study does not demonstrate Hanja conversion.','Hangul 音节；本研究未展示 Hanja 转换。','Hangul音節。漢字変換は実証しない。','한글 음절. 한자 변환은 입증하지 않는다.')}]},
 han2020write:{pages:[1,2,3,4],output:q('Physical Han-character drawing','物理汉字字形绘制','物理的な漢字描画','물리적 한자 그리기'),steps:[
 {stage:'input',text:q('Brain–computer selections command a robot arm.','脑机选择控制机械臂。','脳コンピューターの選択でロボットアームを指示する。','뇌–컴퓨터 선택으로 로봇 팔을 제어한다.')},
 {stage:'output',text:q('The robot draws a Han-character shape. This is physical handwriting, not encoded text conversion.','机械臂绘制汉字字形；属于物理书写，并非编码文本转换。','ロボットが漢字の形を描く。符号化文字への変換ではなく物理的な筆記。','로봇이 한자 모양을 그린다. 부호화된 텍스트 변환이 아닌 물리적 필기이다.'),sample:'福'}]},
};
