#!/usr/bin/env python3
"""Assemble the site's pages from one shared shell.

Why this exists: the header, nav and footer appear on nine pages. Hand-copying
them means they drift, and a nav change becomes a nine-file edit. This script
wraps each body in tools/pages/<slug>.html with the shared chrome and writes
plain static HTML.

It is NOT a deploy step. Vercel serves the committed output directly and
vercel.json pins buildCommand to null. Run it by hand after editing a body:

    python3 tools/build.py

Then commit the generated files.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BODIES = ROOT / "tools" / "pages"

BOOKING = ("https://bookings.gettimely.com/vasectomyaustralia/bb/book"
           "?location=173700&amp;product=2854571%3ASV&amp;staff=288783")

# slug -> (output path, <title>, meta description, nav key)
PAGES = {
    "patient-information": (
        "patient-information/index.html",
        "Patient Information | No-Scalpel Vasectomy Explained",
        "What happens before, during and after a no-scalpel vasectomy at the "
        "Adelaide Vasectomy Centre — consultation, procedure, and recovery.",
        "patient-information"),
    "about-us": (
        "about-us/index.html",
        "About Us | Adelaide Vasectomy Centre",
        "Dr Geoff Cashion and Dr Matt Valentine — training, qualifications and "
        "experience behind the Adelaide Vasectomy Centre.",
        "about-us"),
    "vasectomy-fees": (
        "vasectomy-fees/index.html",
        "Vasectomy Fees | $597 Out Of Pocket",
        "One fee, no surprises: $830 less the $233 Medicare rebate is $597 out "
        "of pocket. How to claim your rebate, and why private health costs more.",
        "vasectomy-fees"),
    "book-online": (
        "book-online/index.html",
        "Book Online | Adelaide Vasectomy Centre",
        "Book your no-scalpel vasectomy in Beulah Park, Adelaide. Consultation "
        "and procedure on the same day, no GP referral needed.",
        "book-online"),
    "location": (
        "location/index.html",
        "Location | 252A Magill Rd, Beulah Park",
        "The Adelaide Vasectomy Centre is at 252A Magill Rd, Beulah Park SA 5067.",
        "location"),
    "contact-us": (
        "contact-us/index.html",
        "Contact Us | Adelaide Vasectomy Centre",
        "Call 1800 SNIPME, email us, or send an enquiry to the Adelaide "
        "Vasectomy Centre.",
        "contact-us"),
    "recovery": (
        "recovery/index.html",
        "After Your Vasectomy | Recovery Instructions",
        "What to do in the hours, days and weeks after your vasectomy — rest, "
        "pain relief, lifting, and your semen analysis at three months.",
        "recovery"),
    "privacy-policy": (
        "privacy-policy/index.html",
        "Privacy Policy | Adelaide Vasectomy Centre",
        "How the Adelaide Vasectomy Centre collects, uses, stores and shares "
        "your personal and health information.",
        "privacy-policy"),
}

NAV_ITEMS = [
    ("patient-information", "Patient info"),
    ("about-us", "About"),
    ("vasectomy-fees", "Fees"),
    ("location", "Location"),
    ("contact-us", "Contact"),
]


def nav(active, depth):
    up = "../" * depth
    out = []
    for slug, label in NAV_ITEMS:
        cur = ' aria-current="page"' if slug == active else ""
        out.append(f'    <a class="masthead__link" href="{up}{slug}/"{cur}>{label}</a>')
    return "\n".join(out)


def footer_links(depth):
    up = "../" * depth
    items = [(f"{up}patient-information/", "Patient info"),
             (f"{up}about-us/", "About"),
             (f"{up}vasectomy-fees/", "Fees"),
             (f"{up}recovery/", "After your vasectomy"),
             (f"{up}location/", "Location"),
             (f"{up}contact-us/", "Contact"),
             (f"{up}privacy-policy/", "Privacy policy"),
             ("tel:1800764763", "1800 764 763")]
    return "\n".join(f'        <li><a href="{h}">{t}</a></li>' for h, t in items)


SHELL = """<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<!-- Layer 2 of the no-index policy. See CLAUDE.md. Never remove, never override. -->
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />

<title>{title}</title>
<meta name="description" content="{description}" />
<meta name="theme-color" content="#08181D" />

<link rel="icon" href="{up}assets/brand/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="{up}assets/brand/favicon_adelaidevasectomy_com_au_64x64.png" sizes="64x64" type="image/png" />
<link rel="apple-touch-icon" href="{up}assets/brand/apple-touch-icon.png" />

<!-- Fonts are self-hosted, not loaded from Google: no third-party request per
     visitor on a site that is meant to stay private. -->
<link rel="preload" href="{up}assets/fonts/fraunces-latin-1.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="{up}assets/fonts/instrument-sans-latin-7.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="{up}assets/css/fonts.css" />
<link rel="stylesheet" href="{up}assets/css/site.css" />
<link rel="stylesheet" href="{up}assets/css/pages.css" />
</head>

<body>

<a class="skip" href="#main">Skip to content</a>

<header class="masthead is-stuck">
  <a class="masthead__logo" href="{up}" aria-label="Adelaide Vasectomy Centre — home">
    <img src="{up}assets/brand/logo.svg" alt="Adelaide Vasectomy Centre" width="516" height="93" />
  </a>
  <nav class="masthead__nav" aria-label="Primary">
{nav}
    <a class="btn btn--primary" href="{booking}">Book online</a>
  </nav>
</header>

<main id="main">
{body}
</main>

<footer class="foot">
  <div class="wrap wrap--wide">
    <div class="foot__row">
      <a class="foot__logo" href="{up}" aria-label="Adelaide Vasectomy Centre — home">
        <img src="{up}assets/brand/logo.svg" alt="Adelaide Vasectomy Centre" width="516" height="93" loading="lazy" />
      </a>
      <ul class="foot__links">
{footer}
      </ul>
    </div>
    <p class="foot__fine">
      &copy; 2026 Adelaide Vasectomy Centre. All rights reserved.<br />
      The information on this page is general in nature and is not a substitute
      for individual medical advice. Talk to us about your own circumstances
      before deciding on a vasectomy.
    </p>
  </div>
</footer>

<script src="{up}assets/js/site.js" defer></script>
</body>
</html>
"""


def build():
    written = []
    for slug, (out, title, desc, active) in PAGES.items():
        src = BODIES / f"{slug}.html"
        if not src.exists():
            print(f"  SKIP {slug} (no body at {src.relative_to(ROOT)})")
            continue

        depth = out.count("/")
        up = "../" * depth
        body = src.read_text(encoding="utf-8").rstrip("\n")
        # bodies use {{UP}} and {{BOOKING}} placeholders for root-relative assets
        body = body.replace("{{UP}}", up).replace("{{BOOKING}}", BOOKING)

        html = SHELL.format(title=title, description=desc, up=up,
                            nav=nav(active, depth), footer=footer_links(depth),
                            booking=BOOKING, body=body)

        dest = ROOT / out
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding="utf-8")
        written.append((out, len(html)))

    for out, size in written:
        print(f"  {out:38s} {size/1024:6.1f} KB")
    print(f"\n{len(written)} page(s) written")
    return 0 if written else 1


if __name__ == "__main__":
    sys.exit(build())
