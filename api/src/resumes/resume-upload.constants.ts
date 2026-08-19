export const LATEX_RESUME_EXTENSION = '.tex';
export const MAX_RESUME_FILE_SIZE_BYTES = 512 * 1024;
export const MAX_RESUME_FILE_NAME_LENGTH = 255;

export const REQUIRED_LATEX_MARKERS = [
  '\\documentclass',
  '\\begin{document}',
  '\\end{document}',
] as const;
