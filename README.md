# Alex Goryachev — website

Static site (HTML + CSS + GSAP), deployed on Vercel. No build step is needed to deploy: the HTML files in the root are the site.

Pages: `speaking`, `enterprise`, `higher-education`, `member-organizations`, `about`, `work-with-alex` (`/` redirects to `/speaking` until a Home page exists).

## Editing
Page content lives in `_source/pages/`; the shared header, footer and booking form live in `_source/partials/`. After editing, rebuild the root HTML files:

```
python _source/build.py
```

- `_source/crop.py` makes the face-centred photo crops in `assets/img/alex/` (needs Pillow).
- `_source/og.py` makes the 1200×630 share images in `assets/img/og/` (needs Pillow).
- Share links use `SITE_URL` in `_source/build.py`. When www.alexgoryachev.com points at Vercel, change it there, rebuild, and update `robots.txt` / `sitemap.xml`.
- The booking forms are front-end only; connect them to a form service before launch.
