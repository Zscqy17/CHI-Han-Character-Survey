# CJK Input Atlas — review supplement

**Start here:** unzip the whole archive, then open `index.html`. No installation, account or local server is needed. `paper-index.html` is a plain HTML index that also works without JavaScript.

The website uses a white background and black text, with a visual entry for every paper directly below the header. Original figures and tables are prioritized; page previews are explicitly labeled. Filters follow the review’s four algorithm generations, publication periods and interaction methods; XR is a separate scenario. Search is in the sidebar. On phones, expand Filters to change the classification.

- 241 paper PDFs in `papers/`: EN-A 57, EN-B 184.
- Complete atlas, Algorithms and Interaction pages. The last two contain 110 and 181 records with 50 shared papers; counts overlap.
- Display languages: English (default), 中文, 日本語 and 한국어.
- Search original titles, then combine venue, script, algorithm/modality and media filters.
- Each record links to its included PDF and original publication source.
- A per-paper visual index, 2 GIFs and 8 video-source entries. External videos need Internet access; two historical source URLs are unavailable and marked accordingly.

The Hanzi GIF uses four real ACL 2014 presentation frames (02:15, 02:35, 02:55, 03:25); it is a model explanation, not a live typing experiment. The second GIF is an original Flick-in kana-entry animation. Hanzi, Kanji, Hanja, kana, Hangul and physical glyph output are distinguished throughout.

`data/catalogue.csv` contains the catalogue and four-language interpretations. `data/verification.json` records per-paper link/media checks; `data/view-classification.csv` records the editorial reading-view assignment; `data/paper-files.json` maps every PDF to its source hash and packaged hash. `data/media-credits.md` gives attribution and licenses. `SHA256SUMS.txt` checks every delivered file except itself.

All PDFs were validated against the prior full-text records. Standard metadata and interactive annotations were removed from copies; extracted page text was compared with the original. The reviewed article in one bound issue was extracted from original PDF pages 37–50. Printed authorship and original research content remain intact.

Source papers retain their authorship and rights; inclusion in this review package does not grant a new license over them. The public website uses original-paper links, attributed figure excerpts and separately licensed media. Do not replace source attribution with the review authors’ names.

Maintainable React/TypeScript source is in `source/`; see `SOURCE-README.md`. The resource is aligned with the review’s conversion and interaction strands and makes no new effectiveness claim. Restricted publisher access is reported honestly; a local full-text check does not imply that its publisher page is freely accessible.
