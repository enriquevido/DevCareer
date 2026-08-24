import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MAX_PDF_BYTES } from "../config.mjs";
import { runPdflatex } from "./pdflatex.mjs";

export async function compileLatex(source) {
  const workDirectory = await mkdtemp(join(tmpdir(), "latex-compile-"));
  const inputFile = join(workDirectory, "resume.tex");
  const outputFile = join(workDirectory, "resume.pdf");

  try {
    await writeFile(inputFile, source, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });

    const execution = await runPdflatex(workDirectory);

    if (execution.error) {
      throw execution.error;
    }

    if (execution.timedOut) {
      return {
        kind: "timeout",
        diagnostic: execution.diagnostic,
      };
    }

    if (execution.exitCode !== 0) {
      return {
        kind: "failed",
        diagnostic: execution.diagnostic,
      };
    }

    const outputValidation = await validateOutputFile(
      outputFile,
      execution.diagnostic,
    );

    if (outputValidation) {
      return outputValidation;
    }

    return {
      kind: "success",
      pdf: await readFile(outputFile),
    };
  } finally {
    await rm(workDirectory, {
      recursive: true,
      force: true,
    });
  }
}

async function validateOutputFile(outputFile, diagnostic) {
  let outputStats;

  try {
    outputStats = await stat(outputFile);
  } catch {
    return {
      kind: "failed",
      diagnostic: diagnostic || "Compiler finished without producing a PDF.",
    };
  }

  if (!outputStats.isFile() || outputStats.size === 0) {
    return {
      kind: "failed",
      diagnostic: diagnostic || "Compiler produced an empty PDF.",
    };
  }

  if (outputStats.size > MAX_PDF_BYTES) {
    return {
      kind: "failed",
      diagnostic: `Generated PDF exceeds ${MAX_PDF_BYTES} bytes.`,
    };
  }

  return null;
}
