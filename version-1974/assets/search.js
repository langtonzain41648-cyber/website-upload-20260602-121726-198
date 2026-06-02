(function () {
    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function card(movie) {
        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>",
            "<span class=\"poster-play\">▶</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>",
            "<p>" + escapeHtml(movie.summary) + "</p>",
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.score) + "</span></div>",
            "<div class=\"tag-row\"><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function runSearch() {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = document.querySelector("[data-search-page-input]");
        var title = document.querySelector("[data-search-title]");
        var results = document.querySelector("[data-search-results]");
        var movies = window.SEARCH_MOVIES || [];

        if (input) {
            input.value = query;
        }
        if (!results || !title) {
            return;
        }

        var normalized = query.toLowerCase();
        var matched = movies.filter(function (movie) {
            if (!normalized) {
                return true;
            }
            return [movie.title, movie.region, movie.type, movie.genre, movie.year, movie.category, movie.summary]
                .join(" ")
                .toLowerCase()
                .indexOf(normalized) !== -1;
        }).slice(0, 120);

        title.textContent = query ? "搜索结果：" + query : "热门影片";
        results.innerHTML = matched.map(card).join("");
        if (matched.length === 0) {
            results.innerHTML = "<div class=\"empty-state is-visible\">没有找到匹配影片</div>";
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", runSearch);
    } else {
        runSearch();
    }
})();
