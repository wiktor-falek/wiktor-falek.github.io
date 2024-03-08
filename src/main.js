const playlistInput = document.querySelector("#playlist-input");
const currentlyPlayingParagraph = document.querySelector("#currently-playing");
const playbackQueueDiv = document.querySelector("#playback-queue");
const playbackQueueElementsUl = document.querySelector(
  "#playback-queue #playback-queue-elements"
);
const buttonsDiv = document.querySelector("#buttons");

if (!playlistInput) throw new Error("#playlist-input element not found");
if (!playbackQueueDiv) throw new Error("#playback-queue element not found");
if (!currentlyPlayingParagraph)
  throw new Error("#currently-playing element not found");
if (!playbackQueueElementsUl)
  throw new Error("#playback-queue #playback-queue-elements element not found");
if (!buttonsDiv) throw new Error("#buttons element not found");

const emitter = mitt();
let player;
let playbackQueue = [];
let hasStartedPlaying = false;
let initialVideoIndex = 0;
let currentVideoIndex = 0;

const key = atob("QUl6YVN5QmVodng4RVJLZHRhMndjYmlON3NyQUlXc1RlQXdvRGt3");
function fetchPlaylistById(id, pageToken) {
  let url =
    "https://www.googleapis.com/youtube/v3/playlistItems?" +
    "part=snippet&" +
    "maxResults=50&" +
    "playlistId=" +
    id +
    "&" +
    "key=" +
    key;

  if (pageToken) {
    url += "&pageToken=" + pageToken;
  }

  return fetch(url);
}

function initPlayer(videoId) {
  const player = new YT.Player("player", {
    height: "390",
    width: "640",
    videoId,
    playerVars: {
      // https://developers.google.com/youtube/player_parameters#Parameters
      playsinline: 0,
      rel: 0,
      fs: 0,
    },
    events: {
      onReady: (event) => event.target.playVideo(),
      onStateChange: (event) => {
        if (event.data == YT.PlayerState.ENDED) {
          emitter.emit("video-ended");
        }
      },
    },
  });

  return player;
}

function loadVideoById(videoId) {
  if (!player) {
    player = initPlayer(videoId);
    buttonsDiv.classList.remove("hidden");
  } else {
    try {
      player.loadVideoById(videoId);
    } catch {
      // throws player.loadVideoById is not a function in firefox, but works anyways
    }
  }
}

async function loadPlaylist() {
  const playlistUrlOrPlaylistId = playlistInput.value;
  let playlistId;

  if (playlistUrlOrPlaylistId.startsWith("PL")) {
    playlistId = playlistUrlOrPlaylistId;
  } else {
    try {
      const url = new URL(playlistUrlOrPlaylistId);
      const id = url.searchParams.get("list");

      if (!id) {
        alert("Invalid url, please input the playlist url");
        return;
      }

      playlistId = id;

      if (!hasStartedPlaying) {
        const index = parseInt(url.searchParams.get("index"));
        if (!Number.isNaN(index)) {
          initialVideoIndex = index - 1; // offset 1 based indexing that youtube uses
        }
      }
    } catch (e) {
      alert("Invalid playlist url", e);
      return;
    }
  }

  let nextPageToken;

  do {
    try {
      const res = await fetchPlaylistById(playlistId, nextPageToken);
      const data = await res.json();

      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        const video = {
          title: item.snippet.title,
          videoId: item.snippet.resourceId.videoId,
        };
        playbackQueue.push(video);

        const index = playbackQueue.length - 1;

        // update dom
        const playbackQueueElementLi = document.createElement("li");

        const queueElementText =
          (index + 1).toString().padStart(4, "0") + " - " + video.title;
        playbackQueueElementLi.innerText = queueElementText;

        playbackQueueElementLi.setAttribute("index", index.toString());
        playbackQueueElementLi.addEventListener("click", (e) => {
          const index = parseInt(e.target?.getAttribute("index"));
          if (!Number.isNaN(index)) {
            startPlayback(index);
          }
          currentVideoIndex = index;
        });

        playbackQueueElementsUl.appendChild(playbackQueueElementLi);
      }

      if (!hasStartedPlaying && initialVideoIndex <= playbackQueue.length) {
        startPlayback(initialVideoIndex);
        hasStartedPlaying = true;
      }

      nextPageToken = data.nextPageToken;
    } catch (e) {
      console.error(e);
      alert("Failed to fetch videos");
    }
  } while (nextPageToken);

  if (!hasStartedPlaying) {
    startPlayback(0);
    hasStartedPlaying = true;
  }
}

function startPlayback(index) {
  const previousVideoIndex = currentVideoIndex;
  currentVideoIndex = index;

  const { videoId, title } = playbackQueue[index];
  loadVideoById(videoId);

  // update DOM
  currentlyPlayingParagraph.innerHTML = title;

  const previouslySelectedPlaybackQueueElementLi = document.querySelector(
    `#playback-queue-elements li[index="${previousVideoIndex}"]`
  );
  previouslySelectedPlaybackQueueElementLi.classList.remove("selected");

  const playbackQueueElementLi = document.querySelector(
    `#playback-queue-elements li[index="${index}"]`
  );

  playbackQueueElementLi.classList.add("selected");
}

function previousTrack() {
  if (currentVideoIndex > 0) {
    startPlayback(currentVideoIndex - 1);
  }
}

function nextTrack() {
  if (currentVideoIndex + 1 < playbackQueue.length) {
    startPlayback(currentVideoIndex + 1);
  }
}

emitter.on("video-ended", () => {
  if (currentVideoIndex <= playbackQueue.length) {
    nextTrack();
  }
});
