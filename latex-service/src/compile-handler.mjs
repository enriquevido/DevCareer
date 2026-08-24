import { MAX_CONCURRENT_COMPILATIONS } from "./config.mjs";
import { HttpError, readCompileRequest, sendJson, sendPdf } from "./http.mjs";
import { compileLatex } from "./latex/compiler.mjs";

let activeCompilations = 0;

export async function handleCompile(request, response) {
  const { source } = await readCompileRequest(request);

  if (activeCompilations >= MAX_CONCURRENT_COMPILATIONS) {
    throw new HttpError(
      503,
      "COMPILATION_CAPACITY_REACHED",
      "The compilation service is busy.",
    );
  }

  activeCompilations += 1;

  try {
    const result = await compileLatex(source);

    if (result.kind === "timeout") {
      sendJson(response, 504, {
        code: "LATEX_TIMEOUT",
        message: "LaTeX compilation timed out.",
        diagnostic: result.diagnostic,
      });
      return;
    }

    if (result.kind === "failed") {
      sendJson(response, 422, {
        code: "LATEX_COMPILE_FAILED",
        message: "LaTeX compilation failed.",
        diagnostic: result.diagnostic,
      });
      return;
    }

    sendPdf(response, result.pdf);
  } finally {
    activeCompilations -= 1;
  }
}
