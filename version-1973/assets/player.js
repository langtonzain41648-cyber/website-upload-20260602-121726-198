
async function loadHlsPlayer() {
  const video = document.querySelector("[data-player-video]");
  const startButton = document.querySelector("[data-player-start]");
  const message = document.querySelector("[data-player-message]");

  if (!video || !startButton) {
    return;
  }

  const source = video.getAttribute("data-source");
  let hlsInstance = null;
  let initialized = false;

  function showMessage(text) {
    if (message) {
      message.textContent = text || "";
    }
  }

  async function attachSource() {
    if (initialized) {
      return;
    }
    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    try {
      const module = await import("./hls-dru42stk.js");
      const Hls = module.H;
      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage("网络错误，请检查连接后重试。");
            hlsInstance.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage("媒体错误，正在尝试恢复播放。");
            hlsInstance.recoverMediaError();
            return;
          }
          showMessage("播放器初始化失败，请刷新页面重试。");
          hlsInstance.destroy();
        });
        return;
      }
      showMessage("当前浏览器不支持 HLS 播放。");
    } catch (error) {
      showMessage("播放器资源加载失败，请刷新页面重试。");
    }
  }

  startButton.addEventListener("click", async function () {
    startButton.classList.add("is-hidden");
    await attachSource();
    try {
      await video.play();
    } catch (error) {
      showMessage("请再次点击视频区域开始播放。");
    }
  });

  video.addEventListener("play", function () {
    startButton.classList.add("is-hidden");
    showMessage("");
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

loadHlsPlayer();
