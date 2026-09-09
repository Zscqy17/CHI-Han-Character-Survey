# CJK Input Atlas

Anonymous companion resource for a systematic review of CJK input and conversion, 2000–2026.

During anonymous review, use the temporary review link rather than the GitHub account URL: [review link supplied separately] . The site footer explains this in all four display languages. GitHub Pages files are prepared for later use; publishing them under the personal account is deferred to preserve review anonymity.

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

The media audit extracted figure-caption locations and outbound resources from all reviewed full texts, requested every publication/source page, and inspected promising publisher/author resources. The included figures and extracted video frames were visually checked. A figure-caption count is a detection result, not a count of reusable or independently validated interface images. Publisher blocks leave online-media coverage unresolved; “not found” refers only to checked accessible sources, not proof that no media exists.

The package includes a per-paper visual index, 2 GIFs and 8 video-source entries. Additional figures and tables are extracted from the user-provided article PDFs, with figure numbers, page coordinates, source-file hashes and visual-check records. A page preview is explicitly labeled when no suitable illustration is identified. One GIF contains four real ACL presentation frames at 02:15, 02:35, 02:55 and 03:25, showing Pinyin-to-Hanzi explanation. It is explicitly labeled as presentation slides, not a live typing experiment. Source-slide text, including its intermediate syllable-order mismatch, is preserved. The other is the original author-repository Flick-in animation (kana input). Two referenced historical video URLs are unavailable; the relevant records say so. External videos require Internet access and are loaded only on request.

KooSHO/FlickPose kana or consonant conversion, Hanzi input, Hanja conversion, Hangul composition, kana-only entry and physical robot glyph drawing remain distinct. Process steps are only supplied where the source supports them; missing stages are not invented.

## Attribution and anonymity

See `public/data/media-credits.md` for media attribution and applicable licenses. Source papers retain their original authorship and rights. The supplied review package contains third-party PDFs as requested. The website includes attributed original-paper excerpts and separately licensed media, and links to papers at their sources. Newly extracted figures are recorded as source excerpts, without assigning an unverified open license. This package does not grant new rights over the papers.

No review-author names, affiliations, emails, personal paths, private reading notes, repository links or credentials are in the published dataset. Original-paper author/project links remain legitimate citation evidence. Standard PDF metadata and interactive annotations are removed from packaged copies; printed paper content is retained. One multi-article issue is reduced to the reviewed article, original PDF pages 37–50.

No analytics, login, uploads, remote fonts or application database are used. Robots directives request no indexing. Live video players contact their external hosts only after the reader requests them.

Catalogue organization was informed by [XRTextTrove](https://xrtexttrove.github.io/) and [TEXT (2025)](https://dl.acm.org/doi/10.1145/3706598.3713382). No assets or code were copied from that site. This atlas is a review companion resource; it makes no independent effectiveness claim.

Automated validation covers unique counts, view overlap, script coverage, filtering intersections, language data, media provenance, page bounds, stable links, static output, archive integrity and preserved manuscript hashes. Browser-driven interaction/visual testing was not performed.
