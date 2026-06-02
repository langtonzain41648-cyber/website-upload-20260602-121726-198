
(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const header = document.querySelector(".site-header");
    if (!button || !header) {
      return;
    }
    button.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  function initHero() {
    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length === 0) {
      return;
    }
    let index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const next = Number(dot.getAttribute("data-hero-dot"));
        show(next);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initCatalogFilters() {
    const toolbar = document.querySelector("[data-catalog-toolbar]");
    const list = document.querySelector("[data-card-list]");
    if (!toolbar || !list) {
      return;
    }
    const cards = Array.from(list.querySelectorAll(".catalog-card"));
    const keywordInput = toolbar.querySelector("[data-card-filter]");
    const yearSelect = toolbar.querySelector("[data-year-filter]");
    const sortSelect = toolbar.querySelector("[data-card-sort]");
    const countNode = toolbar.querySelector("[data-result-count]");

    function cardMatches(card) {
      const keyword = normalizeText(keywordInput && keywordInput.value);
      const year = yearSelect ? yearSelect.value : "";
      const haystack = normalizeText([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region
      ].join(" "));
      const keywordMatches = !keyword || haystack.includes(keyword);
      const yearMatches = !year || String(card.dataset.year) === String(year);
      return keywordMatches && yearMatches;
    }

    function sortCards(visibleCards) {
      const mode = sortSelect ? sortSelect.value : "year";
      visibleCards.sort(function (a, b) {
        if (mode === "views") {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        if (mode === "heat") {
          return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
        }
        if (mode === "title") {
          return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
        }
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
    }

    function update() {
      const visibleCards = [];
      cards.forEach(function (card) {
        const visible = cardMatches(card);
        card.hidden = !visible;
        if (visible) {
          visibleCards.push(card);
        }
      });
      sortCards(visibleCards);
      visibleCards.forEach(function (card) {
        list.appendChild(card);
      });
      if (countNode) {
        countNode.textContent = visibleCards.length + " 部";
      }
    }

    [keywordInput, yearSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });
    update();
  }

  function createSearchCard(item) {
    const article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a class="poster-link" href="' + item.url + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
      '  <span class="poster-frame">',
      '    <span class="poster-fallback">高清国产影片</span>',
      '    <img class="poster-image" src="' + item.poster + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">',
      '    <span class="poster-badge">' + escapeHtml(item.yearText || item.year) + '</span>',
      '    <span class="poster-duration">热度 ' + escapeHtml(item.heat) + '</span>',
      '  </span>',
      '</a>',
      '<div class="card-body">',
      '  <div class="card-meta"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
      '  <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '  <p>' + escapeHtml(item.oneLine || item.genre || '') + '</p>',
      '  <div class="card-foot"><span>' + escapeHtml(item.type) + '</span><span>' + Number(item.views || 0).toLocaleString() + ' 次</span></div>',
      '</div>'
    ].join("");
    return article;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    const resultsNode = document.querySelector("[data-search-results]");
    const summaryNode = document.querySelector("[data-search-summary]");
    const input = document.querySelector("[data-search-input]");
    if (!resultsNode || !summaryNode || !input || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function search(query) {
      const keywords = normalizeText(query).split(/\s+/).filter(Boolean);
      resultsNode.innerHTML = "";
      if (keywords.length === 0) {
        summaryNode.textContent = "请输入关键词开始搜索。";
        return;
      }
      const matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        const haystack = normalizeText([
          item.title,
          item.yearText,
          item.region,
          item.type,
          item.genre,
          item.category,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" "));
        return keywords.every(function (keyword) {
          return haystack.includes(keyword);
        });
      }).sort(function (a, b) {
        return Number(b.heat || 0) - Number(a.heat || 0);
      }).slice(0, 120);

      summaryNode.textContent = "搜索到 " + matches.length + " 条结果";
      matches.forEach(function (item) {
        resultsNode.appendChild(createSearchCard(item));
      });
    }

    let searchTimer = null;
    input.addEventListener("input", function () {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(function () {
        search(input.value);
      }, 180);
    });
    search(initialQuery);
  }

  function initBackTop() {
    document.querySelectorAll("[data-back-top]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCatalogFilters();
    initSearchPage();
    initBackTop();
  });
})();
