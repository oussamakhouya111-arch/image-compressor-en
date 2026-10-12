# Image Compressor

A static, multilingual image-compression website. JPG, PNG, and WebP files are processed in the visitor's browser; the tool exports JPG or WebP and can try to meet a target file size.

## Deployment on Deplexo

- App type: Web service
- Build method: Dockerfile
- Root directory: leave blank
- Dockerfile: use the repository-root `Dockerfile`
- Start command: use the Dockerfile's default command
- Port: `3000` (the server reads the `PORT` environment variable)

The Dockerfile starts Python's built-in static HTTP server. No Python packages need to be installed.

## Languages and pages

- English pages are at the repository root.
- Arabic pages are under `/ar/` and use a right-to-left layout.
- French pages are under `/fr/`.

Each language has a homepage, four target-size pages (50, 100, 200, and 500 KB), a compression guide, a JPG-versus-WebP guide, About, Contact, Privacy, and Terms pages.

Language selectors link to the equivalent page in the other languages. Matching pages use `hreflang` alternates and language-specific canonical URLs.

## Main files

- `index.html`: English compressor and homepage
- `ar/index.html`, `fr/index.html`: localized compressor homepages
- `app.js`: browser-side image processing and localized status/error messages
- `styles.css`: responsive site styling, including RTL layout adjustments
- `compress-image-to-{50,100,200,500}kb.html`: English target-size pages
- `ar/` and `fr/`: Arabic and French target-size and information pages
- `about.html`, `contact.html`, `privacy.html`, `terms.html`: English site-information pages
- `robots.txt` and `sitemap.xml`: crawler guidance and the current list of 33 HTML URLs
- `favicon.svg` and `favicon-96.png`: site icons
- `Dockerfile`: static web-server deployment setup

## SEO hostname

The HTML metadata, structured data, `robots.txt`, and `sitemap.xml` currently use `https://compressimagefiles.co99.win` as the official hostname. If the public hostname changes, update canonical URLs, `hreflang` URLs, Open Graph URLs, structured-data URLs, `robots.txt`, and `sitemap.xml` together.

## Notes

Keep original image files and review compressed results. Compression quality and size depend on the source image and selected settings; a target size is not guaranteed for every input.
