(function () {
    var header = document.querySelector('[data-header]');
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var next = carousel.querySelector('[data-hero-next]');
        var prev = carousel.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function run() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                run();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                run();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                run();
            });
        });

        show(0);
        run();
    });

    document.querySelectorAll('[data-search-scope]').forEach(function (panel) {
        var section = panel.parentElement;
        var grid = section ? section.querySelector('[data-card-grid]') : null;
        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var searchInput = panel.querySelector('[data-search-input]');
        var sortSelect = panel.querySelector('[data-sort-select]');
        var filters = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-field]'));
        var emptyState = section.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        function valuesFor(field) {
            var values = [];
            cards.forEach(function (card) {
                var value = card.getAttribute('data-' + field) || '';
                if (value && values.indexOf(value) === -1) {
                    values.push(value);
                }
            });
            return values.sort(function (a, b) {
                return a.localeCompare(b, 'zh-Hans-CN');
            });
        }

        filters.forEach(function (select) {
            var field = select.getAttribute('data-filter-field');
            valuesFor(field).forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        });

        if (query && searchInput) {
            searchInput.value = query;
        }

        function sortCards() {
            var mode = sortSelect ? sortSelect.value : 'default';
            var sorted = cards.slice();
            if (mode === 'year-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                });
            }
            if (mode === 'year-asc') {
                sorted.sort(function (a, b) {
                    return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
                });
            }
            if (mode === 'title-asc') {
                sorted.sort(function (a, b) {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function apply() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var visibleCount = 0;
            sortCards();
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                filters.forEach(function (select) {
                    if (select.value && card.getAttribute('data-' + select.getAttribute('data-filter-field')) !== select.value) {
                        matched = false;
                    }
                });
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visibleCount += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('show', visibleCount === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', apply);
        }
        filters.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        if (sortSelect) {
            sortSelect.addEventListener('change', apply);
        }
        apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var source = video ? video.getAttribute('data-video') : '';
        var initialized = false;
        var hlsInstance = null;

        function initialize() {
            if (!video || !source || initialized) {
                return;
            }
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            video.setAttribute('controls', 'controls');
        }

        function play() {
            initialize();
            if (button) {
                button.classList.add('is-hidden');
            }
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!initialized || video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
