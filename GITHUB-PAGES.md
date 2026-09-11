# Hosting configuration

GitHub Pages is disabled during anonymous review. Use the prebuilt release and [Kimi deployment instructions](KIMI-DEPLOY.md) for a neutral temporary review domain. Do not publish the review URL in this repository.

`docs/` was an obsolete compiled snapshot and has been removed. If GitHub Pages is explicitly requested after review, build the source with the appropriate base path; do not restore an older snapshot:

```sh
cd website
npm ci
npm run build:pages
```

This defaults to `/CHI-Han-Character-Survey`. Deploy the generated `dist/github-pages/` only after separately configuring hosting. Building does not enable GitHub Pages.
