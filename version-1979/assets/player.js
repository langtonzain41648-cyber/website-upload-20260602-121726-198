(function () {
    function setup(wrapper) {
        const video = wrapper.querySelector('.movie-video');
        const button = wrapper.querySelector('.player-overlay');
        if (!video || !button) {
            return;
        }
        const stream = video.getAttribute('data-stream');
        let hls = null;

        function attach() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            video.setAttribute('data-ready', '1');
        }

        function start() {
            attach();
            wrapper.classList.add('is-playing');
            button.hidden = true;
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    wrapper.classList.remove('is-playing');
                    button.hidden = false;
                });
            }
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            wrapper.classList.add('is-playing');
            button.hidden = true;
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                wrapper.classList.remove('is-playing');
                button.hidden = false;
            }
        });
        video.addEventListener('ended', function () {
            wrapper.classList.remove('is-playing');
            button.hidden = false;
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('.player-shell').forEach(setup);
})();
