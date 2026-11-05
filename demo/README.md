# Independent Poetry Processor browser demo

Static files in this folder run on GitHub Pages, including under a subdirectory. No ChatGPT Sites scripts, API, service worker, authentication, or hosting are used.

The look follows desktop 2.0.26: Dark Mode colors, compact workspace tabs, document tabs, toolbar and line-numbered editor. This is a scoped demo, not a replacement for the full desktop or existing mobile app. It supports local drafts, .poem import/export, text and .ppbackup notebook import/export, local counts and reading mode. Cloud, League, desktop analysis, dictionary and manuscript editing are not included.

`notebook.ts` and `ppx.ts` reuse the existing mobile document validation and file conversion. Existing notebooks can be moved manually using Back up notebook on the old site, then Open in this demo. Browser storage cannot transfer automatically between domains.

To rebuild after editing source, install dependencies in this folder and run `npm run build`. The committed app.js is ready to serve without a server build. Back up drafts before clearing browser data.
