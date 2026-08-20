# Adelaide Vasectomy Centre

## Non-negotiable: this site must never be indexed

This site is not to appear in any search engine, ever, until the owner
explicitly says otherwise. Treat this as a hard requirement of every task, not
a nice-to-have. If a change would weaken any of the layers below, stop and ask
first.

### The four layers

**1. `X-Robots-Tag` response header on every response.**
This is the primary defence, because it covers non-HTML responses too — PDFs,
images, JSON, downloads — which a `<meta>` tag cannot reach.
Configured in `vercel.json` (Vercel) and `public/_headers` (Netlify /
Cloudflare Pages). Keep both files in sync.

**2. `<meta name="robots">` on every single page.**
Every HTML document must carry this inside `<head>`:

```html
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
```

Put it in the shared layout / base template so new pages inherit it
automatically. Never add a page that opts out. If the project gains a framework
with per-page metadata (e.g. Next.js `metadata`), set the noindex default at
the root layout and never override it to `index` on a child route.

**3. `robots.txt` deliberately does NOT disallow crawling.**
Read the comments in `robots.txt` before editing it. `Disallow: /` is the
common wrong answer here: it blocks crawling but not indexing, and it prevents
crawlers from ever reading the `noindex` directives in layers 1 and 2 — so
adding it would make the site *more* likely to be indexed, not less.

**4. No discovery surface.**
Do not add a `sitemap.xml`. Do not add search-engine verification files or
analytics/Search Console properties. Do not submit URLs anywhere. Do not add
structured data / JSON-LD, canonical tags pointing at this site, or Open Graph
tags intended to drive indexing.

### The only true guarantee

The layers above depend on crawlers choosing to obey them. Well-behaved
crawlers (Google, Bing) do; scrapers and AI training crawlers frequently do
not. If the requirement is that nobody at all can see the site, the site must
not be publicly reachable: use Vercel Deployment Protection (password or SSO)
or equivalent HTTP auth. Ask the owner if that level is wanted.

### Before every deploy

Verify the header is actually being served, rather than assuming:

```sh
curl -sSI https://<deployed-url>/ | grep -i x-robots-tag
```

A missing header means layer 1 is not live — fix it before announcing the
deploy.
