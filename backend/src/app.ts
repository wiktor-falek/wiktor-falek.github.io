import Fastify from "fastify";
import { z } from "zod";
import { fetchPlaylistById } from "./youtubeApi.js";

const app = Fastify({
  logger: false,
});

app.get("/playlist/:playlistId", async (req, res) => {
  const schema = z.object({
    params: z.object({
      playlistId: z.string().length(34),
    }),
    query: z.object({
      paginationToken: z.string().optional(),
    }),
  });

  const validation = schema.safeParse(req);

  if (!validation.success) {
    return res.status(400).send({
      error: "Invalid playlistId",
      stacktrace: validation.error.errors,
    });
  }

  const { playlistId } = validation.data.params;
  const { paginationToken } = validation.data.query;

  try {
    const playlist = await fetchPlaylistById(playlistId, paginationToken);
    res.status(200).send(playlist);
  } catch (e) {
    res.status(400).send(e);
  }
});

export default app;
