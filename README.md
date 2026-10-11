# Image Compressor

A static, multilingual image compression website designed for deployment on Deplexo using a small Python HTTP server in Docker. The browser tool supports manual quality/width settings and optional target-size compression.

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
- ar/: Arabic homepage and target-size guides for 50KB, 100KB, 200KB, and 500KB

Image files are processed locally in the user's browser. The tool accepts JPG, PNG and WebP and exports JPG or WebP. Keep original files and review exported results.

## Language versions
- English pages remain at the root.
- Arabic pages are under `/ar/` and use Arabic right-to-left layout.
- Matching English and Arabic homepage/target-size pages use reciprocal `hreflang` references; all five Arabic URLs are included in `sitemap.xml`.
- The Arabic homepage uses the shared `../app.js` compressor and `../styles.css`; the size guides link to the homepage with the chosen target preselected.
