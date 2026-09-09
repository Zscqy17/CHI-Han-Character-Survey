# GitHub Pages deployment

GitHub Pages serves this static website directly from a repository. Readers open a normal HTTPS link; they do not need a GitHub account or the offline PDF supplement.

**Current review policy:** use the temporary anonymous review link supplied separately. GitHub Pages publication under the existing account is deferred because its address identifies that account. The instructions below are retained for later publication or a separate neutral publishing account.

## Build and publish

1. Install Node.js 22.13 or later. In the website source directory, run:

   ```sh
   npm ci
   npm test
   npm run typecheck
   npm run build:pages
   ```

2. Copy the contents of `dist/github-pages/` into `docs/` at the root of the hosting repository. Commit and push the new `docs/` and the maintained source.
3. In the repository, select **Settings → Pages → Build and deployment → Deploy from a branch → main → /docs → Save**.
4. Wait for the Pages build to finish. Open the URL shown under Pages and check the catalogue, paper detail pages, media and language switch.

The default build targets this project address:

`https://zscqy17.github.io/CHI-Han-Character-Survey/`

This is the intended address, not proof that publishing has completed. The URL contains the GitHub account name. It should only be used in an anonymous submission if that identity exposure is acceptable; otherwise use a separate neutral publishing account.

For a different project repository, build with `NEXT_PUBLIC_BASE_PATH=/repository-name npm run build:pages`. For a repository named `owner.github.io`, use `NEXT_PUBLIC_BASE_PATH='' npm run build:pages`.

## Updating the resource

Edit the prepared data in `data/papers.json`, the four display languages in `lib/i18n.ts`, or the components in `app/atlas.tsx`. Keep the public data mirrors and media provenance consistent with any record changes. Rebuild and replace `docs/` before committing. No database, API keys, Sites account or full-text PDF directory is needed for the online website.

The gallery and detail pages put GIFs first, video sources second, and images third. GIFs play by default, respect reduced-motion preferences, and have a pause control. External video players load only after a click; source-only or unavailable videos keep their status labels. All 241 paper records retain an original-source link and an attributed visual preview.

GitHub Pages uses directory indexes, so the build adds `algorithms/index.html`, `interaction/index.html` and a `papers/<bibkey>/index.html` for every paper. Preserve `.nojekyll`, `_next/`, `media/`, `data/`, all `.rsc` files, and the original `.html` files. `docs/` is the complete publishing directory; do not publish `dist/server/`.

Official documentation: [About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) and [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
