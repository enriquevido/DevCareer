import { spawn } from "node:child_process";
import { MAX_DIAGNOSTIC_BYTES } from "../config.mjs";

const PDFINFO_TIMEOUT_MS = 5_000;

export function readPdfPageCount(pdfFile) {
  return new Promise((resolve, reject) => {
    const stdoutCollector = createOutputCollector(MAX_DIAGNOSTIC_BYTES);

    const stderrCollector = createOutputCollector(MAX_DIAGNOSTIC_BYTES);

    const child = spawn("pdfinfo", [pdfFile], {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin",
        LC_ALL: "C",
      },
    });

    let settled = false;
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, PDFINFO_TIMEOUT_MS);

    child.stdout?.on("data", (chunk) => {
      stdoutCollector.append(chunk);
    });

    child.stderr?.on("data", (chunk) => {
      stderrCollector.append(chunk);
    });

    child.once("error", (error) => {
      finishWithError(`Could not inspect the generated PDF: ${error.message}`);
    });

    child.once("close", (exitCode) => {
      if (timedOut) {
        finishWithError("Inspecting the generated PDF timed out.");
        return;
      }

      if (exitCode !== 0) {
        const diagnostic = stderrCollector.value() || stdoutCollector.value();

        finishWithError(
          diagnostic
            ? `pdfinfo failed: ${diagnostic}`
            : `pdfinfo exited with code ${exitCode}.`,
        );
        return;
      }

      const pageCount = parsePageCount(stdoutCollector.value());

      if (pageCount === null) {
        finishWithError("pdfinfo did not return a valid page count.");
        return;
      }

      finishWithResult(pageCount);
    });

    function finishWithResult(pageCount) {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolve(pageCount);
    }

    function finishWithError(message) {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      reject(new Error(message));
    }
  });
}

function parsePageCount(output) {
  const match = /^Pages:\s+(\d+)\s*$/mu.exec(output);

  if (!match) {
    return null;
  }

  const pageCount = Number(match[1]);

  if (!Number.isSafeInteger(pageCount) || pageCount <= 0) {
    return null;
  }

  return pageCount;
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
      const output = Buffer.concat(chunks).toString("utf8").trim();

      return truncated ? `${output}\n[output truncated]` : output;
    },
  };
}
