(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var scope = root.parentElement || document;
            var input = root.querySelector("[data-filter-input]");
            var year = root.querySelector("[data-filter-year]");
            var type = root.querySelector("[data-filter-type]");
            var category = root.querySelector("[data-filter-category]");
            var empty = root.querySelector("[data-filter-empty]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));

            function matchesYear(card, value) {
                if (!value) {
                    return true;
                }
                var cardYear = Number(card.getAttribute("data-year")) || 0;
                if (value === "old") {
                    return cardYear && cardYear < 2020;
                }
                return String(cardYear) === value;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var categoryValue = category ? category.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-category"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var ok = true;
                    ok = ok && (!query || haystack.indexOf(query) !== -1);
                    ok = ok && matchesYear(card, yearValue);
                    ok = ok && (!typeValue || haystack.indexOf(typeValue.toLowerCase()) !== -1);
                    ok = ok && (!categoryValue || card.getAttribute("data-category") === categoryValue);
                    card.classList.toggle("hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [input, year, type, category].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
