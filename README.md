# Emir Brown-Murillo — Poetry

Buildless, accessible static website for GitHub Pages. No domain configuration is included or changed.

## Add a published poem

Add its title, publication, year, and publisher URL to works.json. Run `python update_works.py` to regenerate the list in works.html, newest first. The HTML remains readable without JavaScript. Unpublished collections are identified separately from published poems.

## Pages

- index.html: poetry homepage
- works.html: growing bibliography of published poems, followed by unpublished collections
- constituent.html: PDF reader first, original synopsis and download
- poetry-processor.html: independent browser demo and desktop download link
- about.html: extended third-person biography

CONSTITUENT PDF is copied byte-for-byte from the supplied 43-page attachment.

## Content sources for initial draft

- User-supplied CONSTITUENT synopsis, editorial note and PDF from the referenced chat
- https://qb.foofaraw.press/tag/emir-brown-murillo/
- https://frostplace.org/programs/conference-on-poetry/latin-scholarship/2020-latinx-fellow-emericus-brown/
- User-confirmed Poetry Processor: https://embrown.itch.io/poetry-processor

## Edit page copy on GitHub

Open the HTML file for the page, click the pencil (Edit this file), change the visible text between HTML tags, then commit to main. GitHub Pages publishes the updated copy. Keep tags and file links intact.

For published entries maintained in works.json, update that file as well if you edit their generated HTML; running update_works.py replaces only the Published poems section. Central Dissent and Collections are edited directly in works.html.

The browser demo's UI text is in demo/src/main.tsx and requires rebuilding demo/app.js. See demo/README.md. All regular website copy can be edited without rebuilding.
