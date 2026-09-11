# CJK Input Atlas — Kimi deployment (v6)

Download the latest `CJK-Input-Atlas-Kimi-deploy.zip` and `SHA256SUMS` from this repository's Releases. Extract the ZIP and deploy the complete contents of `CJK-Input-Atlas-Kimi/site/` at the root of a neutral temporary domain. The site is ready to serve; no build, database or login is required.

Preserve all HTML, RSC, JavaScript, CSS, media and directory-index files. Test `/`, `/algorithms/`, `/interaction/` and direct visits/refreshes to `/papers/<bibkey>/`. Keep English, Chinese, Japanese and Korean switching, search, GIF playback and category filters working. Do not rewrite every paper URL to the homepage.

This version follows the review figure in five independent, overlapping dimensions: Language / script, Input tags, Computational approach, Evaluation, and Intended population. All 43 option counts match the figure in the unfiltered 241-paper view. XR is explicitly a scenario tag. The computational category code na is displayed as “Others” as requested. The former Interaction topics grouping has been removed from the filter panel. All 241 papers retain a GIF and source links. Paper-figure slideshows are editorial presentations, not recordings of live input.

Keep noindex and robots.txt. Return the temporary review URL privately; do not publish it in this identifiable repository or add the repository/account identity to the review site. GitHub Pages remains disabled.

## Downloads

- Deployment ZIP: https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest/download/CJK-Input-Atlas-Kimi-deploy.zip
- Compressed 241-paper PDF archive (133.5 MB): https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest/download/CJK-Input-Atlas-pdfs-small.zip
- Checksums: https://github.com/Zscqy17/CHI-Han-Character-Survey/releases/latest/download/SHA256SUMS

The PDF archive is a separate attachment. It is not needed to deploy the website, and uploading it does not automatically connect PDF files to the site's external source links. It contains all 241 PDFs, the matching BibTeX and a title/file index. Existing page text and all 2,196 pages are preserved; image compression is lossy.

## Source

The deployment ZIP includes `source/`. Media are stored once in `site/media/`. To rebuild with Node.js 22.13 or later:

```sh
node restore-source-media.mjs
cd source
npm ci
npm test
npm run typecheck
NEXT_PUBLIC_BASE_PATH='' npm run build:pages
```

Deploy `source/dist/github-pages/`. The repository's existing `docs/` is the older v4 GitHub Pages snapshot; use this release's `site/` for the update.
