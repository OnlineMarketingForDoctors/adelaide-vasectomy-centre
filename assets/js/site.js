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

      /* Into the reserved footer row, not onto the end of the card — appending
         to the card would add the button's height on top of that row and make
         these cards taller than the ones without a button. */
      (card.querySelector(".rev__foot") || card).appendChild(btn);
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

  /* ---- Parallax on the full-bleed plate --------------------------------- */

  /* The image is 124% of its frame, so it has 12% of headroom top and bottom.
     Drifting it +/-7% as the frame crosses the viewport stays inside that
     margin, which means no gap can ever appear at either edge. */
  var plates = document.querySelectorAll(".plate img");

  if (plates.length && !reduced) {
    var ticking = false;

    var drift = function () {
      ticking = false;
      var vh = window.innerHeight;

      Array.prototype.forEach.call(plates, function (img) {
        var frame = img.parentElement;
        var r = frame.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;

        /* 0 as the frame enters at the bottom, 1 as it leaves at the top. */
        var progress = (vh - r.top) / (vh + r.height);
        var shift = (0.5 - progress) * 14;
        img.style.transform = "translate3d(0, " + shift.toFixed(2) + "%, 0)";
      });
    };

    var request = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(drift);
    };

    drift();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
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
