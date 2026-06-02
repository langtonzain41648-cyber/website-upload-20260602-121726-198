function startMoviePlayer(sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var button = document.querySelector("[data-play-button]");
    if (!video || !button || !sourceUrl) {
        return;
    }

    var initialized = false;

    function playVideo() {
        if (!initialized) {
            initialized = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }
        button.classList.add("hide");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
        if (!initialized) {
            playVideo();
        }
    });
}
