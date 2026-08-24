import { spawn } from "node:child_process";
import { COMPILE_TIMEOUT_MS, MAX_DIAGNOSTIC_BYTES } from "../config.mjs";

export function runPdflatex(workDirectory) {
  return new Promise((resolve) => {
    const outputCollector = createOutputCollector(MAX_DIAGNOSTIC_BYTES);

    const child = spawn(
      "pdflatex",
      [
        "-no-shell-escape",
        "-halt-on-error",
        "-interaction=nonstopmode",
        "-file-line-error",
        "-output-directory=.",
        "resume.tex",
      ],
      {
        cwd: workDirectory,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin",
          HOME: workDirectory,
          TMPDIR: workDirectory,
          TEXMFOUTPUT: workDirectory,
          openin_any: "p",
          openout_any: "p",
        },
      },
    );

    let timedOut = false;
    let processError = null;
    let settled = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, COMPILE_TIMEOUT_MS);

    child.stdout?.on("data", (chunk) => {
      outputCollector.append(chunk);
    });

    child.stderr?.on("data", (chunk) => {
      outputCollector.append(chunk);
    });

    child.once("error", (error) => {
      processError = error;
      settle(null);
    });

    child.once("close", (exitCode) => {
      settle(exitCode);
    });

    function settle(exitCode) {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);

      resolve({
        exitCode,
        timedOut,
        error: processError,
        diagnostic: sanitizeDiagnostic(outputCollector.value(), workDirectory),
      });
    }
  });
}

function createOutputCollector(maxBytes) {
  const chunks = [];
  let collectedBytes = 0;
  let truncated = false;

  return {
    append(chunk) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      const remainingBytes = maxBytes - collectedBytes;

      if (remainingBytes <= 0) {
        truncated = true;
        return;
      }

      if (buffer.byteLength > remainingBytes) {
        chunks.push(buffer.subarray(0, remainingBytes));
        collectedBytes += remainingBytes;
        truncated = true;
        return;
      }

      chunks.push(buffer);
      collectedBytes += buffer.byteLength;
    },

    value() {
      const output = Buffer.concat(chunks).toString("utf8");

      return truncated ? `${output}\n[diagnostic truncated]` : output;
    },
  };
}

function sanitizeDiagnostic(diagnostic, workDirectory) {
  const withoutWorkDirectory = diagnostic
    .split(workDirectory)
    .join("<workdir>");

  let sanitized = "";

  for (const character of withoutWorkDirectory) {
    const code = character.charCodeAt(0);
    const allowedControlCharacter =
      character === "\n" || character === "\r" || character === "\t";
    const forbiddenControlCharacter = code < 32 || (code >= 127 && code <= 159);

    if (!forbiddenControlCharacter || allowedControlCharacter) {
      sanitized += character;
    }
  }

  return sanitized.trim();
}
