(function () {
  window.setupMoviePlayer = function (source) {
    var shell = document.querySelector('[data-player-shell]');

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-player-trigger]');
    var hls = null;

    if (!video) {
      return;
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function attachSource() {
      if (shell.getAttribute('data-ready') === '1') {
        return;
      }

      shell.setAttribute('data-ready', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.attachMedia(video);

        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(source);
        });

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });

        hls.on(window.Hls.Events.ERROR, function (_event, data) {
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

        return;
      }

      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
    }

    function startPlayback() {
      attachSource();

      if (trigger) {
        trigger.classList.add('is-hidden');
      }

      playVideo();
    }

    if (trigger) {
      trigger.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (shell.getAttribute('data-ready') !== '1') {
        startPlayback();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
