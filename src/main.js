const playlistInput = document.getElementById("playlist-input");
const playbackQueueElement = document.getElementById("playback-queue");

if (!playlistInput) throw new Error("#playlist-input element not found");
if (!playbackQueueElement) throw new Error("#playback-queue element not found");

const playbackQueue = [];
let currentVideoIndex;
let hasStartedPlaying = false;

async function loadPlaylist() {
  const playlistUrlOrPlaylistId = playlistInput.value;
  console.log(playlistUrlOrPlaylistId);

  // TODO: retrieve from the constiable above if is a url
  const playlistId = "PLc39W8Ei8TbFHOXAK1Oa_VV59AGL9DZzd";

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

      if (!hasStartedPlaying) {
        loadVideoById(playbackQueue[0].videoId);
        currentVideoIndex = 0;
        hasStartedPlaying = true;
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

  console.log(playbackQueue);
}

emitter.on("video-ended", () => {
  if (currentVideoIndex <= playbackQueue.length) {
    const nextVideo = playbackQueue[currentVideoIndex++];
    loadVideoById(nextVideo.videoId);
  }
});
