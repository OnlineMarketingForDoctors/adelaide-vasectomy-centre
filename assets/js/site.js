/* Adelaide Vasectomy Centre — minimal progressive enhancement.
   Everything here is additive: the page is fully readable without it. */

(function () {
  "use strict";

  /* Masthead gains a ground once you leave the hero. */
  var masthead = document.querySelector(".masthead");
  if (masthead) {
    var onScroll = function () {
      masthead.classList.toggle("is-stuck", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* One quiet reveal, once, on the way in. Respects reduced motion. */
  var wantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var risers = document.querySelectorAll(".rise");

  if (!wantsMotion || !("IntersectionObserver" in window)) {
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
