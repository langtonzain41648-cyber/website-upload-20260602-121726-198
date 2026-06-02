(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function() {
    var video = document.querySelector("[data-video-player]");
    if (!video) {
      return;
    }

    var source = video.querySelector("source");
    var sourceUrl = source ? source.getAttribute("src") : video.getAttribute("src");
    var action = document.querySelector("[data-player-trigger]");

    if (sourceUrl) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function playVideo() {
      if (action) {
        action.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function() {
          if (action) {
            action.classList.remove("is-hidden");
          }
        });
      }
    }

    if (action) {
      action.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function() {
      if (action) {
        action.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function() {
      if (action && video.currentTime === 0) {
        action.classList.remove("is-hidden");
      }
    });
  });
})();
