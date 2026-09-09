# CJK Input Atlas

Anonymous companion resource for a systematic review of CJK input and conversion, 2000–2026.

During anonymous review, use the temporary review link rather than the GitHub account URL: [temporary review link supplied separately] . The site footer explains this in all four display languages. GitHub Pages files are prepared for later use; publishing them under the personal account is deferred to preserve review anonymity.

The interface uses a white background, black text and a compact media gallery directly below the header. The catalogue and each paper's media follow this order: animated GIFs, available video sources, then static images. GIFs play immediately and have a pause control; readers who request reduced motion start with a still image. Videos load on request, or link to their official source when embedding is unavailable. Known unavailable video links do not displace paper images. Each paper has an original illustration, table or explicitly labeled page preview. The sidebar prioritizes the review’s four algorithm generations, publication periods and interaction methods; XR is a separate scenario. Search is in the sidebar. Paper details place original media before the study interpretation. On phones, expand the filter panel above the gallery.

The frozen catalogue contains 241 unique records: EN-A 57 and EN-B 184. The script groups contain Chinese 155, Japanese 67, Korean 13, and cross-script/general 6. EN-A/EN-B are venue groups, not the language of the publication.

Two independent reading views follow the manuscript's computational and interaction lines: Algorithms (110) and Interaction (181). The views overlap on 50 papers. They are derived editorial navigation labels, not a replacement for the manuscript's coding. Algorithms includes conversion, recognition, data and infrastructure; Interaction includes input controls, user behavior and evaluation evidence. A model used as a system component does not by itself make every interface paper an algorithm contribution. The explicit mapping and basis are in `data/views.json` and `public/data/view-classification.csv`.

The default display language is English. Interface labels, study interpretations, process annotations and media captions support English, Chinese, Japanese and Korean; original paper titles and citations are retained.

## Maintain the website

Requires Node.js 22.13 or later. From this directory:

```sh
npm ci
npm run dev
npm run test
npm run typecheck
npm run build
npm run offline
```

The website is a React/TypeScript static export. `app/atlas.tsx` supplies the complete catalogue, algorithm view, interaction view, paper records and offline interface. `lib/catalogue.ts` contains shared filtering and URL logic. `lib/i18n.ts` holds all four display languages. `public/data/review-taxonomy.json` records the manuscript-aligned filtering scheme, while `public/data/figure-selections.json` records the per-paper visual selection. `lib/processes.ts` holds source-page-supported process descriptions.

`data/papers.json` is the prepared, public dataset. It is sufficient to rebuild this delivered source without the manuscript workspace. Edit records and their four-language fields together. Media provenance is stored per item, including source links, figure/page references, permissions and, where applicable, extraction timestamps and hashes.

Within the original review workspace, `scripts/classify-views.py` and `scripts/compile-data.py` rebuild the dataset from the canonical corpus and private verification records. `scripts/integrate-paper-illustrations.py` imports the visually checked original-paper selections. Those commands require the surrounding review workspace; they are not needed to build the delivered source. They export only curated fields. The manuscript remains untouched.

`npm run build` writes the online static site to `dist/client`. `npm run offline` writes a single classic-script HTML application to `../CJK-Input-Atlas/index.html`; it embeds its JavaScript, CSS and catalogue and uses relative media/PDF links. Copy `public/media` and `public/data` alongside that HTML, with the PDF files in `papers/`. `scripts/package-supplement.py` automates assembly in the review workspace.

## GitHub Pages

An online catalogue does not require readers to download the PDF supplement. The site retains source links for all 241 papers and includes the attributed media and downloadable catalogue data.

```sh
npm run build:pages
```

This builds for `/CHI-Han-Character-Survey` by default and writes `dist/github-pages/`. For another project repository, set `NEXT_PUBLIC_BASE_PATH=/repository-name`; for an `owner.github.io` repository, use an empty value. The script checks exported links and adds directory indexes for all paper and category routes, plus `.nojekyll` for the JavaScript/CSS asset folder. The current Vinext version requires asset-prefix configuration and explicit catalogue links rather than its `basePath` option during static prerendering.

Copy the contents of `dist/github-pages/` into the hosting repository's `docs/`, commit and push, then select **Settings → Pages → Deploy from a branch → main → /docs**. The project URL is `https://OWNER.github.io/REPOSITORY/`. A project URL identifies the GitHub owner; use a separate neutral publishing account if the review URL must remain anonymous. Keep the source alongside the site for maintenance, without local configuration, credentials or the PDF supplement.

## Source and media verification

All 241 local PDFs were matched to the SHA-256 recorded by prior full-text reading. All 241 publication/source URLs received an online request. Restricted access, network failure, source-linked PDF and a reached publication page are distinct statuses; none is silently relabeled as successful open-full-text access. Nine previously missing source links were supplied and matched to the papers.

The media audit extracted figure-caption locations and outbound resources from all reviewed full texts, requested every publication/source page, and inspected promising publisher/author resources. The selected figure crops and extracted video frames were visually checked. New full-page slideshow frames preserve the original PDF geometry and are checked pixel-for-pixel against the corresponding source-page renders; contact-sheet spot checks supplement that check. A figure-caption count is a detection result, not a count of reusable or independently validated interface images. Publisher blocks leave online-media coverage unresolved; “not found” refers only to checked accessible sources, not proof that no media exists.

The package includes a per-paper visual index, 241 GIFs (one per paper) and 14 video-source entries. Three GIFs select actual ACL conference frames: Jia & Zhao (2014), Sun et al. (2024), and Sarhangzadeh & Watanabe (2024). They are labeled as explanatory slides, with original video timestamps, attribution, licenses and asset hashes. The fourth is the unchanged Flick-in author animation showing kana entry. Twelve additional GIFs cycle through the numbered figures of twelve source papers (122 frames including a continued figure). These are explicitly labeled paper-figure slideshows. They retain figure/page provenance and provide individually downloadable original crops; 3-second pauses are editorial, not observed input timings. Another 225 GIFs combine each paper's reviewed illustration, table or preview with relevant full source pages (1,126 frames). They are separately labeled paper-excerpt slideshows; full pages retain panels and labels where independent cropping is uncertain. All 241 papers now have exactly one GIF. Video-derived GIFs and the author animation precede figure slideshows, then paper-excerpt slideshows, videos and static images. GIFs load and play near the viewport and show posters when scrolled away. Korean slideshow descriptions distinguish Hangul entry from Hanja conversion. New 2024 GIFs show Pinyin homophone mappings and kana–Kanji alignment/decoding; they do not reconstruct unobserved typing. The original Jia slide's syllable-order mismatch is retained.

Additional source links include the official KooSHO demonstration, the ACL 2022 PinyinGPT lecture, JoyFlick's WISS 2020 predecessor and its later Minecraft extension. These relations are labeled explicitly. JoyFlick MOD shows Kanji candidates but submits the Latin text JoyFlick. External videos require Internet access. Two historical video URLs remain marked unavailable. See `public/data/media-search-log.json` for the additional search outcomes. Motion media can be synchronized into catalogue exports using `python3 scripts/sync-motion-media.py`.

KooSHO/FlickPose kana or consonant conversion, Hanzi input, Hanja conversion, Hangul composition, kana-only entry and physical robot glyph drawing remain distinct. Process steps are only supplied where the source supports them; missing stages are not invented.

## Attribution and anonymity

See `public/data/media-credits.md` for media attribution and applicable licenses. Source papers retain their original authorship and rights. The supplied review package contains third-party PDFs as requested. The website includes attributed original-paper excerpts and separately licensed media, and links to papers at their sources. Newly extracted figures are recorded as source excerpts, without assigning an unverified open license. This package does not grant new rights over the papers.

No review-author names, affiliations, emails, personal paths, private reading notes, repository links or credentials are in the published dataset. Original-paper author/project links remain legitimate citation evidence. Standard PDF metadata and interactive annotations are removed from packaged copies; printed paper content is retained. One multi-article issue is reduced to the reviewed article, original PDF pages 37–50.

No analytics, login, uploads, remote fonts or application database are used. Robots directives request no indexing. Live video players contact their external hosts only after the reader requests them.

Catalogue organization was informed by [XRTextTrove](https://xrtexttrove.github.io/) and [TEXT (2025)](https://dl.acm.org/doi/10.1145/3706598.3713382). No assets or code were copied from that site. This atlas is a review companion resource; it makes no independent effectiveness claim.

Automated validation covers unique counts, view overlap, script coverage, filtering intersections, language data, media provenance, page bounds, stable links, static output, archive integrity and preserved manuscript hashes. Browser-driven interaction/visual testing was not performed.

## Complete GIF coverage

`public/data/gif-coverage.json` records all 241 paper-to-GIF associations. Existing video-derived/author GIFs (4) and reviewed figure sequences (12) are retained; 225 source-excerpt sequences complete coverage. A paper-excerpt GIF starts with the selected source illustration, table or preview and then cycles through source pages. Figure-caption detection selects pages; it does not assert that every figure was separately extracted. Papers with no recoverable caption use labeled overview pages. GIF timing is editorial. Four-language study descriptions retain Hanzi/Kanji/Hanja, kana, Hangul and physical-glyph boundaries.

GIF generation and PDF identity checks use Python, Pillow and PyMuPDF, independently of the website build:

```sh
python3 scripts/build-corpus-gifs.py --pdf-dir /path/to/reviewed-pdfs --audit-dir /path/to/media-audit
python3 scripts/verify-corpus-gifs.py --pdf-dir /path/to/reviewed-pdfs --report /path/to/gif-verification.json
python3 scripts/sync-motion-media.py
```

Generation targets records without a GIF and writes source-audit records for review. To curate a regenerated sequence, merge the reviewed record into `data/video-media.json` and run the sync script. Existing GIFs are retained. Website builds consume the frozen included assets and do not require PDFs or Python.
