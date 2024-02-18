import app from "./app.js";

app.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Listening on ${address}`)
})