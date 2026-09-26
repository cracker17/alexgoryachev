# Alex Goryachev — website

Static site (HTML + CSS + GSAP), deployed on Vercel. No build step is needed to deploy: the HTML files in the root are the site.

Pages: `speaking`, `enterprise`, `higher-education`, `member-organizations`, `about`, `work-with-alex` (`/` serves the Speaking page via a Vercel rewrite until a Home page exists).

## Editing
Page content lives in `_source/pages/`; the shared header, footer and booking form live in `_source/partials/`. After editing, rebuild the root HTML files:

```
python _source/build.py
```

- `_source/crop.py` makes the face-centred photo crops in `assets/img/alex/` (needs Pillow).
- `_source/og.py` makes the 1200×630 share images in `assets/img/og/` (needs Pillow).
- Share links use `SITE_URL` in `_source/build.py`. When www.alexgoryachev.com points at Vercel, change it there, rebuild, and update `robots.txt` / `sitemap.xml`.
- The booking forms are front-end only; connect them to a form service before launch.

## Ad landing pages
- `/ai-keynote-speaker-singapore` and `/ai-higher-education-speaker-apac` (noindex, not in the sitemap), plus `/thank-you`.
- **Before running ads**, fill in `assets/js/lp.js` → `CONFIG`:
  - `web3formsKey` — free key from web3forms.com (leads arrive by email; until it's set the form falls back to a pre-filled email).
  - `metaPixelId` — optional; nothing loads while it's empty. Events: PageView, ViewContent (program click), Contact (step 1 done), Lead (submit + thank-you, deduplicated by event ID).
- Match the headline to the ad with `?h=`: Singapore `summit | gov | conference | bureau | virtual`; higher ed `governance | faculty | leaders | keynote`. Unknown values fall back to the default headline.
- Every lead email carries the answers plus `utm_*`, `fbclid`, the headline variant, landing URL and referrer.

## Checking changes
```
python _source/tools/serve.py                 # local preview on http://localhost:8123
node _source/tools/check.mjs [page ...]       # errors, broken images, overflow, animations, face check at 4 widths
```
