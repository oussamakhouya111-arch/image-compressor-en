# Image Compressor

A static, English-language image compression website designed for deployment on Deplexo using a small Python HTTP server in Docker. The browser tool supports manual quality/width settings and optional target-size compression.

## Deplexo settings
- App type: Web service
- Build method: Dockerfile
- Root directory: leave blank
- Dockerfile path: leave blank (uses the Dockerfile at repository root)
- Start command: leave blank (the Dockerfile starts the HTTP server)
- Port: 3000; the server reads the PORT environment variable.

## SEO
Canonical URLs and the sitemap currently use https://compressimagefiles.co99.win. If you change the public hostname, update canonical URLs in all HTML pages, plus robots.txt and sitemap.xml.

## Files
- index.html: home page and compressor
- app.js: browser-side image processing, including automatic target-size compression
- compress-image-to-50kb.html, compress-image-to-100kb.html, compress-image-to-200kb.html, and compress-image-to-500kb.html: target-size landing pages
- styles.css: responsive styling
- how-to-compress-images.html and jpg-vs-webp.html: useful informational pages
- about.html, contact.html, privacy.html, terms.html: site information pages
- robots.txt and sitemap.xml: crawl guidance
- favicon.svg: scalable site icon used across pages
- favicon-96.png: 96×96 PNG favicon declared on the English homepage for search/browser icon support
- ar/: initial Arabic localization, including the homepage and 50KB/100KB target-size guides

Image files are processed locally in the user's browser. The tool accepts JPG, PNG and WebP and exports JPG or WebP. Keep original files and review exported results.

## Language versions
- English pages remain at the root.
- Arabic pages are under `/ar/` and use Arabic right-to-left layout.
- Arabic and English equivalents use `hreflang`; all three Arabic URLs are included in `sitemap.xml`.
- Shared compression behavior stays in `app.js`; Arabic pages load `../app.js` and `../styles.css`.
