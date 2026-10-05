import { createServer } from "node:http";

const PORT = 3000;

// Every request that reaches the server runs through this function.
// `req` is what the client sent; `res` is what we send back.
const server = createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
