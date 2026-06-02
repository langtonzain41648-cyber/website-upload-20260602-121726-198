(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".global-search-form").forEach(function(form) {
    form.addEventListener("submit", function(event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      var target = form.getAttribute("data-search-url") || form.getAttribute("action") || "search.html";
      event.preventDefault();
      window.location.href = target + "?q=" + encodeURIComponent(input.value.trim());
    });
  });

  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
    var prev = carousel.querySelector("[data-slide-prev]");
    var next = carousel.querySelector("[data-slide-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        startTimer();
      });
    }

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  }

  var filterPanel = document.querySelector("[data-filter-panel]");
  if (filterPanel) {
    var textInput = filterPanel.querySelector("[data-filter-input]");
    var yearSelect = filterPanel.querySelector("[data-year-filter]");
    var typeSelect = filterPanel.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var empty = document.querySelector("[data-empty-state]");

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && textInput) {
      textInput.value = q;
    }

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function runFilter() {
      var term = normalize(textInput ? textInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matchesTerm = !term || haystack.indexOf(term) !== -1;
        var matchesYear = !year || cardYear === year;
        var matchesType = !type || cardType === type;
        var show = matchesTerm && matchesYear && matchesType;
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [textInput, yearSelect, typeSelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", runFilter);
        control.addEventListener("change", runFilter);
      }
    });

    runFilter();
  }
})();
