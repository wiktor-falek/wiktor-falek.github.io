import "dotenv/config";

interface PlaylistResponse {
  nextPageToken: string;
  items: PlaylistItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

interface PlaylistItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
  };
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
    standard: Thumbnail;
    maxres: Thumbnail;
  };
}

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export async function fetchPlaylistById(
  playlistId: string,
  pageToken?: string
) {
  let url =
    "https://www.googleapis.com/youtube/v3/playlistItems?" +
    "part=snippet&" +
    "maxResults=50&" +
    `playlistId=${playlistId}&` +
    `key=${process.env.YOUTUBE_DATA_API_KEY}`;

  if (pageToken) {
    url += "&pageToken=" + pageToken;
  }

  const res = await fetch(url);
  const data = (await res.json()) as PlaylistResponse;

  const { nextPageToken, pageInfo } = data;

  const items = data.items.map((item) => ({
    id: item.id,
    title: item.snippet.title,
    thumbnails: item.thumbnails,
  }));

  return {
    nextPageToken,
    pageInfo,
    items,
  };
}
