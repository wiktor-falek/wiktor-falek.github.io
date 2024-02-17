const API_KEY = "AIzaSyBehvx8ERKdta2wcbiN7srAIWsTeAwoDkw";

function loadVideoById(videoId) {
  if (!player) {
    initPlayer(videoId);
  } else {
    player.loadVideoById(videoId);
  }
}

function fetchPlaylistById(id, pageToken) {
  let url =
    "https://www.googleapis.com/youtube/v3/playlistItems?" +
    "part=snippet&" +
    "maxResults=50&" +
    "playlistId=" +
    id +
    "&" +
    "key=" +
    API_KEY;

  if (pageToken) {
    url += "&pageToken=" + pageToken;
  }

  return fetch(url);
}
