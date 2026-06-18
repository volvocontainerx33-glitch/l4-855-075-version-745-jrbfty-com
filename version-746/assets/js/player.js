(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.watch-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var trigger = player.querySelector('[data-play-trigger]');
      var stream = player.getAttribute('data-stream');
      var hls = null;
      var initialized = false;

      function attach() {
        if (!video || !stream || initialized) {
          return;
        }
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      }

      function start() {
        attach();
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (trigger) {
              trigger.classList.remove('is-hidden');
            }
          });
        }
      }

      attach();

      if (trigger) {
        trigger.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('play', function () {
          if (trigger) {
            trigger.classList.add('is-hidden');
          }
        });
        video.addEventListener('pause', function () {
          if (trigger && video.currentTime === 0) {
            trigger.classList.remove('is-hidden');
          }
        });
        video.addEventListener('ended', function () {
          if (trigger) {
            trigger.classList.remove('is-hidden');
          }
        });
      }
    });
  });
}());
