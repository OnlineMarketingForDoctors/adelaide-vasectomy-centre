/* Adelaide Vasectomy Centre — minimal progressive enhancement.
   Everything here is additive: the page is fully readable without it. */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Masthead gains a ground once you leave the hero ------------------ */

  var masthead = document.querySelector(".masthead");
  if (masthead) {
    var onScroll = function () {
      masthead.classList.toggle("is-stuck", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Reviews carousel ------------------------------------------------- */

  var marquee = document.querySelector("[data-marquee]");
  var track = marquee && marquee.querySelector("[data-track]");

  if (track) {
    var originals = Array.prototype.slice.call(track.children);

    /* Only clamp-and-expand the reviews that actually overflow. Measuring
       beats guessing which ones are "long": the cut-off point moves with
       viewport, font size and the reader's zoom. */
    var addToggle = function (card) {
      var text = card.querySelector(".rev__text");
      if (!text || text.scrollHeight <= text.clientHeight + 1) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rev__more";
      btn.textContent = "Read more";
      btn.setAttribute("aria-expanded", "false");
      card.appendChild(btn);
    };

    originals.forEach(addToggle);

    /* A seamless loop needs the track to hold exactly two identical runs, so
       translating it -50% lands run two precisely where run one started. */
    if (!reduced) {
      originals.forEach(function (card) {
        var copy = card.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        /* Hidden from assistive tech, so it must not be reachable by keyboard
           either — but it stays clickable for anyone who sees it. */
        Array.prototype.forEach.call(copy.querySelectorAll("button"), function (b) {
          b.tabIndex = -1;
        });
        track.appendChild(copy);
      });

      /* Drive the duration off measured width so the drift runs at a steady
         speed no matter how many reviews there are or how wide the viewport. */
      var pace = function () {
        var half = track.scrollWidth / 2;
        if (half > 0) track.style.animationDuration = Math.round(half / 42) + "s";
      };
      pace();
      window.addEventListener("resize", pace, { passive: true });
    }

    var held = { hover: false, focus: false, open: false };
    var sync = function () {
      marquee.classList.toggle("is-held", held.hover || held.focus || held.open);
    };

    marquee.addEventListener("mouseenter", function () { held.hover = true; sync(); });
    marquee.addEventListener("mouseleave", function () { held.hover = false; sync(); });
    marquee.addEventListener("focusin", function () { held.focus = true; sync(); });
    marquee.addEventListener("focusout", function () { held.focus = false; sync(); });

    marquee.addEventListener("click", function (e) {
      var btn = e.target.closest(".rev__more");
      if (!btn) return;

      var card = btn.closest(".rev");
      var open = card.classList.toggle("is-open");
      btn.textContent = open ? "Show less" : "Read more";
      btn.setAttribute("aria-expanded", String(open));

      /* Nobody can read an expanded review that is still sliding away. */
      held.open = !!track.querySelector(".rev.is-open");
      sync();
    });
  }

  /* ---- One quiet reveal, once, on the way in ---------------------------- */

  var risers = document.querySelectorAll(".rise");

  if (reduced || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(risers, function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );

  Array.prototype.forEach.call(risers, function (el) {
    observer.observe(el);
  });
})();
