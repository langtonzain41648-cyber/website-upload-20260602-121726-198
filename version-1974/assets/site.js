(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function showSlide(index) {
                current = index;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function startTimer() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    showSlide((current + 1) % slides.length);
                }, 5200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                    startTimer();
                });
            });

            if (slides.length > 1) {
                startTimer();
            }
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var filterList = document.querySelector("[data-filter-list]");
        var emptyState = document.querySelector("[data-empty-state]");
        if (filterInput && filterList) {
            var cards = Array.prototype.slice.call(filterList.querySelectorAll("[data-card]"));
            filterInput.addEventListener("input", function () {
                var query = filterInput.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var matched = !query || text.indexOf(query) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (emptyState) {
                    emptyState.classList.toggle("is-visible", visible === 0);
                }
            });
        }
    });
})();
