const playlistInput = document.getElementById("playlist-input");
const playbackQueueElement = document.getElementById("playback-queue");

if (!playlistInput) throw new Error("#playlist-input element not found");
if (!playbackQueueElement) throw new Error("#playback-queue element not found");

let playbackQueue = [];
let currentVideoIndex;
let initialVideoIndex = 0;

let hasStartedPlaying = false;
function startPlayback(index) {
  if (!hasStartedPlaying) {
    loadVideoById(playbackQueue[index].videoId);
    currentVideoIndex = index;
    hasStartedPlaying = true;
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
          initialVideoIndex = index - 1; // offset 1 based indexing youtube uses
        }
      }
    } catch (e) {
      alert("Invalid playlist url", e);
      return;
    }
  }

  async function fetchPlaylistRecursively(nextPageToken) {
    try {
      const res = await fetchPlaylistById(playlistId, nextPageToken);
      const data = await res.json();

      for (let i = 0; i < data.items.length; i++) {
        const video = data.items[i];
        playbackQueue.push({
          title: video.snippet.title,
          videoId: video.snippet.resourceId.videoId,
        });
      }

      if (initialVideoIndex <= playbackQueue.length) {
        startPlayback(initialVideoIndex);
      }

      if (data.nextPageToken) {
        await fetchPlaylistRecursively(data.nextPageToken);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to fetch the playlist:", e);
    }
  }

  await fetchPlaylistRecursively();

  // if hasn't started already due to index being out of bounds
  startPlayback(0);

  console.log(playbackQueue);
}

emitter.on("video-ended", () => {
  if (currentVideoIndex <= playbackQueue.length) {
    const nextVideo = playbackQueue[currentVideoIndex++];
    loadVideoById(nextVideo.videoId);
  }
});
