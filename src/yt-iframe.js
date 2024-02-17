let player;
const emitter = mitt();

function initPlayer(videoId) {
  player = new YT.Player("player", {
    height: "390",
    width: "640",
    videoId,
    playerconsts: {
      playsinline: 0,
      rel: 0,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
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
