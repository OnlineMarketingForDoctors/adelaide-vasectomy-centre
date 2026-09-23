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

  /* ---- Video: a still with a play button, until it is played ------------ */

  /* The markup ships with the controls attribute so the video works with no
     JS at all. Only once we know JS is running do we take the control bar
     away and put a play button over the poster — and the very first click
     hands the controls straight back. */
  var film = document.querySelector("[data-film]");

  if (film && film.parentElement) {
    film.controls = false;

    var play = document.createElement("button");
    play.type = "button";
    play.className = "film__play";
    play.setAttribute("aria-label", "Play the video");
    play.innerHTML =
      '<span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M8.33 5 L19.33 12 L8.33 19 Z"/></svg></span>';

    film.parentElement.appendChild(play);

    var start = function () {
      film.controls = true;
      play.remove();
      var p = film.play();
      /* Autoplay policy can still reject this; the controls are already back,
         so the reader just presses play themselves. */
      if (p && typeof p.catch === "function") p.catch(function () {});
    };

    play.addEventListener("click", start);
  }

  /* ---- Mobile menu ------------------------------------------------------ */

  /* Below 60rem the header nav is hidden, so without this there is no way to
     reach any other page from a phone. */
  var burger = document.querySelector(".burger");
  var drawer = document.getElementById("drawer");

  if (burger && drawer) {
    var setMenu = function (open) {
      drawer.hidden = !open;
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      /* Stop the page behind the drawer scrolling with it, and give the
         fixed header a solid ground so the drawer cannot show through it. */
      document.body.style.overflow = open ? "hidden" : "";
      document.body.classList.toggle("menu-open", open);
      if (open) {
        var first = drawer.querySelector("a");
        if (first) first.focus();
      } else {
        burger.focus();
      }
    };

    burger.addEventListener("click", function () {
      setMenu(drawer.hidden);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !drawer.hidden) setMenu(false);
    });

    /* Rotating a phone into landscape can cross the breakpoint and leave the
       drawer open over a nav that is visible again. */
    window.addEventListener("resize", function () {
      if (!drawer.hidden && window.innerWidth > 960) setMenu(false);
    }, { passive: true });
  }

  /* ---- Back to top ------------------------------------------------------ */

  var totop = document.querySelector(".totop");
  if (totop) {
    var toggleTop = function () {
      totop.classList.toggle("is-shown", window.scrollY > 700);
    };
    toggleTop();
    window.addEventListener("scroll", toggleTop, { passive: true });

    totop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---- Stage tabs ------------------------------------------------------- */

  var tabbed = document.querySelector("[data-tabs]");
  if (tabbed) {
    var tabs = Array.prototype.slice.call(tabbed.querySelectorAll('[role="tab"]'));

    var show = function (tab, moveFocus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (moveFocus) tab.focus();
    };

    show(tabs[0], false);

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { show(tab, false); });
      /* Arrow keys move between tabs, which is what a tablist is expected to do. */
      tab.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        show(tabs[(i + step + tabs.length) % tabs.length], true);
      });
    });
  }

  /* ---- Click-to-load embeds --------------------------------------------- */

  /* Google Maps and Google Calendar are only fetched once the reader asks for
     them. Nothing leaves the page to a third party on load, which is the point
     on a site meant to stay private. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-embed]"), function (box) {
    var button = box.querySelector(".embed__facade");
    if (!button) return;

    button.addEventListener("click", function () {
      var frame = document.createElement("iframe");
      frame.src = box.getAttribute("data-src");
      frame.title = box.getAttribute("data-title") || "Embedded map";
      frame.loading = "lazy";
      frame.referrerPolicy = "no-referrer-when-downgrade";
      frame.allowFullscreen = true;
      box.appendChild(frame);
      button.remove();
    });
  });

  /* ---- Contents rail highlighting --------------------------------------- */

  var toc = document.querySelector("[data-toc]");
  if (toc && "IntersectionObserver" in window) {
    var links = {};
    Array.prototype.forEach.call(toc.querySelectorAll("a[href^='#']"), function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = links[entry.target.id];
        if (!a) return;
        if (entry.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("is-here"); });
          a.classList.add("is-here");
        }
      });
    }, { rootMargin: "-15% 0px -70% 0px" });

    Object.keys(links).forEach(function (id) {
      var target = document.getElementById(id);
      if (target) spy.observe(target);
    });
  }

  /* ---- Enquiry form: deliberately not connected ------------------------- */

  /* There is no endpoint yet. Rather than let a submission silently vanish,
     the form refuses to submit and points at the phone number instead. To make
     it live: set ENQUIRY_ENDPOINT and replace this handler with a real POST. */
  var ENQUIRY_ENDPOINT = null;

  var enquiry = document.getElementById("enquiry");
  if (enquiry) {
    enquiry.addEventListener("submit", function (e) {
      e.preventDefault();
      if (ENQUIRY_ENDPOINT) return;
      var note = document.getElementById("enquiry-note");
      if (note) {
        note.style.color = "var(--mint)";
        note.textContent =
          "This form isn't connected yet — your message was not sent. " +
          "Please call 1800 764 763 or email info@vasectomyaustralia.com.au.";
      }
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
