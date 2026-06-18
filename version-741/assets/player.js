import { H as Hls } from './hls-vendor-dru42stk.js';

function attachHls(video) {
  var source = video.getAttribute('data-hls');

  if (!source) {
    return;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, function (_, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  }
}

function initPlayers() {
  var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-hls]'));

  videos.forEach(function (video) {
    attachHls(video);

    var shell = video.closest('.player-shell');
    var button = shell ? shell.querySelector('[data-play-overlay]') : null;

    if (button) {
      button.addEventListener('click', function () {
        video.play();
      });

      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });

      video.addEventListener('pause', function () {
        button.classList.remove('is-hidden');
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', initPlayers);
