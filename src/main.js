const playlistInput = document.querySelector("#playlist-input");
const playbackQueueElement = document.querySelector("#playback-queue");
const currentlyPlayingParagraph = document.querySelector("#currently-playing");

if (!playlistInput) throw new Error("#playlist-input element not found");
if (!playbackQueueElement) throw new Error("#playback-queue element not found");
if (!playbackQueueElement)
  throw new Error("#currently-playing element not found");

let playbackQueue = createPlaybackQueue();
let hasStartedPlaying = false;
let initialVideoIndex = 0;
let currentVideoIndex = 0;

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
  const { videoId, title } = playbackQueue[currentVideoIndex];
  loadVideoById(videoId);
  currentVideoIndex = index;

  // update DOM
  currentlyPlayingParagraph.innerHTML = title;

  const allPlaybackQueueElementLi = document.querySelectorAll(
    "#playback-queue-elements li"
  );

  for (let i = 0; i < allPlaybackQueueElementLi.length; i++) {
    allPlaybackQueueElementLi[i].classList.remove("selected");
  }

  const playbackQueueElementLi = document.querySelector(
    `#playback-queue-elements li[index="${index}"]`
  );
  if (playbackQueueElementLi === null) {
    console.error(
      "#playback-queue-elements li[index=${index}] element not found"
    );
  }
  playbackQueueElementLi.classList.add("selected");
}

function previousTrack() {
  if (currentVideoIndex > 0) {
    startPlayback(--currentVideoIndex);
  }
}

function nextTrack() {
  if (currentVideoIndex + 1 < playbackQueue.length) {
    startPlayback(++currentVideoIndex);
  }
}

emitter.on("video-ended", () => {
  if (currentVideoIndex <= playbackQueue.length) {
    const nextVideo = playbackQueue[++currentVideoIndex];
    loadVideoById(nextVideo.videoId);
  }
});
