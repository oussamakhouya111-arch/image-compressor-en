# Image Compressor

A static, English-language image compression website designed for deployment on Deplexo using a small Python HTTP server in Docker.

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
- app.js: browser-side image processing
- styles.css: responsive styling
- how-to-compress-images.html and jpg-vs-webp.html: useful informational pages
- about.html, contact.html, privacy.html, terms.html: site information pages
- robots.txt and sitemap.xml: crawl guidance
- favicon.svg: site icon

Image files are processed locally in the user's browser. The tool accepts JPG, PNG and WebP and exports JPG or WebP. Keep original files and review exported results.
