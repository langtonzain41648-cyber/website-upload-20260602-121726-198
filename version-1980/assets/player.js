(function () {
  function setMessage(player, text) {
    var message = player.querySelector("[data-player-message]");
    if (message) {
      message.textContent = text;
    }
  }

  function attachNative(video, source) {
    video.src = source;
  }

  function attachWithHls(video, source, HlsClass) {
    if (!HlsClass || !HlsClass.isSupported || !HlsClass.isSupported()) {
      attachNative(video, source);
      return;
    }

    if (video.__hlsPlayer) {
      video.__hlsPlayer.destroy();
      video.__hlsPlayer = null;
    }

    var hls = new HlsClass({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    video.__hlsPlayer = hls;
    hls.attachMedia(video);
    hls.loadSource(source);
  }

  function prepare(player) {
    if (player.__prepared) {
      return;
    }

    var video = player.querySelector("video");
    var source = player.getAttribute("data-stream") || "";

    if (!video || !source) {
      setMessage(player, "播放暂时不可用");
      return;
    }

    player.__prepared = true;
    setMessage(player, "正在加载");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      attachNative(video, source);
      setMessage(player, "高清在线播放");
      return;
    }

    try {
      attachWithHls(video, source, window.Hls);
      setMessage(player, "高清在线播放");
    } catch (error) {
      setMessage(player, "播放暂时不可用");
      attachNative(video, source);
    }
  }

  function bindPlayer(player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector("[data-player-overlay]");

    if (!video || !overlay) {
      return;
    }

    function play() {
      prepare(player);
      var playResult = video.play();
      if (playResult && typeof playResult.then === "function") {
        playResult.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", function () {
      overlay.classList.add("is-hidden");
      play();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });

    video.addEventListener("error", function () {
      setMessage(player, "播放暂时不可用");
      overlay.classList.remove("is-hidden");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll("[data-player]").forEach(bindPlayer);
    });
  } else {
    document.querySelectorAll("[data-player]").forEach(bindPlayer);
  }
})();
