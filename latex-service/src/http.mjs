import { MAX_REQUEST_BODY_BYTES, MAX_SOURCE_BYTES } from "./config.mjs";

export class HttpError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export async function readCompileRequest(request) {
  validateContentType(request);
  validateContentLength(request);

  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

    totalBytes += buffer.byteLength;

    if (totalBytes > MAX_REQUEST_BODY_BYTES) {
      throw new HttpError(
        413,
        "REQUEST_TOO_LARGE",
        "Compilation request is too large.",
      );
    }

    chunks.push(buffer);
  }

  const body = parseJsonBody(chunks);

  validateBody(body);

  return {
    source: body.source,
  };
}

export function sendJson(response, statusCode, body) {
  if (response.headersSent) {
    response.end();
    return;
  }

  const content = Buffer.from(JSON.stringify(body), "utf8");

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": content.byteLength,
    "Cache-Control": "no-store",
  });
  response.end(content);
}

export function sendPdf(response, pdf) {
  response.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Length": pdf.byteLength,
    "Cache-Control": "no-store",
  });
  response.end(pdf);
}

function validateContentType(request) {
  const contentType = request.headers["content-type"]
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    throw new HttpError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type must be application/json.",
    );
  }
}

function validateContentLength(request) {
  const header = request.headers["content-length"];

  if (header === undefined) {
    return;
  }

  const contentLength = Number(header);

  if (!Number.isInteger(contentLength) || contentLength < 0) {
    throw new HttpError(
      400,
      "INVALID_CONTENT_LENGTH",
      "Content-Length must be a non-negative integer.",
    );
  }

  if (contentLength > MAX_REQUEST_BODY_BYTES) {
    throw new HttpError(
      413,
      "REQUEST_TOO_LARGE",
      "Compilation request is too large.",
    );
  }
}

function parseJsonBody(chunks) {
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(
      400,
      "INVALID_JSON",
      "Request body must contain valid JSON.",
    );
  }
}

function validateBody(body) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_BODY", "Request body must be an object.");
  }

  if (typeof body.source !== "string" || body.source.trim().length === 0) {
    throw new HttpError(
      400,
      "INVALID_SOURCE",
      "source must be a non-empty string.",
    );
  }

  if (Buffer.byteLength(body.source, "utf8") > MAX_SOURCE_BYTES) {
    throw new HttpError(413, "SOURCE_TOO_LARGE", "LaTeX source is too large.");
  }
}
