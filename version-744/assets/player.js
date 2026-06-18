(function () {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play-button]');
  var dataNode = document.getElementById('stream-data');
  if (!video || !button || !dataNode) return;

  var streamUrl = '';
  try {
    streamUrl = JSON.parse(dataNode.textContent).url || '';
  } catch (error) {
    streamUrl = '';
  }

  var attached = false;
  var hls = null;

  function attachStream() {
    if (attached || !streamUrl) return;
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function beginPlay() {
    attachStream();
    button.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', beginPlay);
  video.addEventListener('click', function () {
    if (video.paused) beginPlay();
  });
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0) button.classList.remove('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') hls.destroy();
  });
})();
