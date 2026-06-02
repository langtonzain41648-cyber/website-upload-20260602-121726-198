(function () {
    const header = document.querySelector('.site-header');
    const menuButton = document.querySelector('.menu-toggle');

    if (header && menuButton) {
        menuButton.addEventListener('click', function () {
            const opened = header.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const prev = document.querySelector('.hero-control.prev');
    const next = document.querySelector('.hero-control.next');
    let slideIndex = 0;
    let slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        slideIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === slideIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === slideIndex);
        });
    }

    function startSlides() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(slideTimer);
        slideTimer = window.setInterval(function () {
            showSlide(slideIndex + 1);
        }, 5600);
    }

    if (slides.length) {
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-go')) || 0);
                startSlides();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(slideIndex - 1);
                startSlides();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(slideIndex + 1);
                startSlides();
            });
        }
        startSlides();
    }

    const filterInput = document.querySelector('.filter-input');
    const cards = Array.from(document.querySelectorAll('.searchable-card'));
    const empty = document.querySelector('.filter-empty');

    function applyFilter(value) {
        const query = String(value || '').trim().toLowerCase();
        let visible = 0;
        cards.forEach(function (card) {
            const text = String(card.getAttribute('data-search') || card.textContent || '').toLowerCase();
            const matched = !query || text.indexOf(query) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    if (filterInput && cards.length) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || '';
        if (q) {
            filterInput.value = q;
        }
        applyFilter(filterInput.value);
        filterInput.addEventListener('input', function () {
            applyFilter(filterInput.value);
        });
    }
})();
