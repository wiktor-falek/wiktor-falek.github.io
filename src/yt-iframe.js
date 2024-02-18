let player;
const emitter = mitt();

function initPlayer(videoId) {
  const player = new YT.Player("player", {
    height: "390",
    width: "640",
    videoId,
    playerVars: {
      playsinline: 0,
      rel: 0,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });

  return player;
}

function onYouTubeIframeAPIReady() {}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    emitter.emit("video-ended");
  }
}

function stopVideo() {
  player.stopVideo();
}

function loadVideoById(videoId) {
  if (!player) {
    player = initPlayer(videoId);
  } else {
    try {
      player.loadVideoById(videoId);
    } catch {
      // throws player.loadVideoById is not a function in firefox, but works anyways
    }
  }
}
