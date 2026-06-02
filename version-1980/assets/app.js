(function () {
  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[type='search'], input[name='q'], input");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        var target = form.getAttribute("data-search-target") || "./search.html";
        window.location.href = target + "?q=" + encodeURIComponent(input.value.trim());
      });
    });

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";
    var searchInput = document.querySelector("[data-filter-input]");

    if (searchInput && queryValue) {
      searchInput.value = queryValue;
    }

    function applyFilters(scope) {
      var container = scope || document;
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
      if (!cards.length) {
        return;
      }

      var keyword = normalize((container.querySelector("[data-filter-input]") || {}).value);
      var year = normalize((container.querySelector("[data-filter-year]") || {}).value);
      var region = normalize((container.querySelector("[data-filter-region]") || {}).value);
      var genre = normalize((container.querySelector("[data-filter-genre]") || {}).value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && normalize(card.getAttribute("data-year")) !== year) {
          matched = false;
        }
        if (region && normalize(card.getAttribute("data-region")) !== region) {
          matched = false;
        }
        if (genre && normalize(card.getAttribute("data-genre")).indexOf(genre) === -1 && normalize(card.getAttribute("data-tags")).indexOf(genre) === -1) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      var empty = container.querySelector("[data-empty-note]");
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      scope.querySelectorAll("[data-filter-input], [data-filter-year], [data-filter-region], [data-filter-genre]").forEach(function (control) {
        control.addEventListener("input", function () {
          applyFilters(scope);
        });
        control.addEventListener("change", function () {
          applyFilters(scope);
        });
      });
      applyFilters(scope);
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
          dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5600);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  });
})();
