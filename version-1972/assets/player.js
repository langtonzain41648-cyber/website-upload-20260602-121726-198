import { H as Hls } from './hls.js';

var player = document.querySelector('[data-player]');

if (player) {
  var video = player.querySelector('video');
  var cover = player.querySelector('[data-cover]');
  var button = player.querySelector('[data-play-button]');
  var source = player.getAttribute('data-play');
  var started = false;
  var instance = null;

  function startPlayback() {
    if (!video || !source) {
      return;
    }

    if (!started) {
      started = true;

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        instance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(source);
        instance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.controls = true;
    }

    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        startPlayback();
      }
    });
  }
}
