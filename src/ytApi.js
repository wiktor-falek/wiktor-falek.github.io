const API_KEY = "AIzaSyBehvx8ERKdta2wcbiN7srAIWsTeAwoDkw";

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

// function fetchPlaylistById(playlistId, pageToken) {
//   let url = `http://localhost:3000/playlist/${playlistId}`;

//   if (pageToken) {
//     url += `&pageToken=${pageToken}`;
//   }

//   return fetch(url);
// }
