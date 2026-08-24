import { createServer } from "node:http";
import { handleCompile } from "./compile-handler.mjs";
import { PORT } from "./config.mjs";
import { HttpError, sendJson } from "./http.mjs";

const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url ?? "/", "http://localhost").pathname;

    if (request.method === "GET" && path === "/health") {
      sendJson(response, 200, {
        status: "ok",
      });
      return;
    }

    if (request.method === "POST" && path === "/compile") {
      await handleCompile(request, response);
      return;
    }

    sendJson(response, 404, {
      code: "NOT_FOUND",
      message: "Route not found.",
    });
  } catch (error) {
    handleServerError(response, error);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`LaTeX compilation service listening on port ${PORT}.`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => {
      process.exit(0);
    });
  });
}

function handleServerError(response, error) {
  if (error instanceof HttpError) {
    sendJson(response, error.statusCode, {
      code: error.code,
      message: error.message,
    });
    return;
  }

  console.error("Unexpected LaTeX service error.");

  sendJson(response, 500, {
    code: "INTERNAL_ERROR",
    message: "Unexpected compilation service error.",
  });
}
