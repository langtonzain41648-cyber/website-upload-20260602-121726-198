(function () {
    function initializeMoviePlayer(streamUrl) {
        var shell = document.querySelector("[data-player]");
        var video = document.querySelector("[data-player-video]");
        var trigger = document.querySelector("[data-player-trigger]");
        var hls = null;
        var attached = false;

        if (!shell || !video || !trigger || !streamUrl) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            attached = true;
        }

        function startPlayback() {
            attachStream();
            trigger.classList.add("is-hidden");
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        trigger.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                startPlayback();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.initializeMoviePlayer = initializeMoviePlayer;
})();
