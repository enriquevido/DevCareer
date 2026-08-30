export const RESUME_FILE_ACCEPT = ".tex";
export const MAX_RESUME_FILE_SIZE_BYTES = 512 * 1024;
export const MAX_RESUME_FILE_NAME_LENGTH = 255;

const BYTES_PER_KIBIBYTE = 1024;

export function validateResumeFile(file: File): string | null {
  const normalizedFileName = file.name.trim();

  if (normalizedFileName.length === 0) {
    return "Selecciona un archivo con un nombre válido.";
  }

  if (normalizedFileName.length > MAX_RESUME_FILE_NAME_LENGTH) {
    return "El nombre del archivo no puede superar 255 caracteres.";
  }

  if (!normalizedFileName.toLowerCase().endsWith(".tex")) {
    return "El archivo debe tener extensión .tex.";
  }

  if (file.size === 0) {
    return "El archivo no puede estar vacío.";
  }

  if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
    return "El archivo no puede superar 512 KiB.";
  }

  return null;
}

export function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < BYTES_PER_KIBIBYTE) {
    return `${sizeInBytes} B`;
  }

  const sizeInKibibytes = sizeInBytes / BYTES_PER_KIBIBYTE;

  const formattedSize = new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 1,
  }).format(sizeInKibibytes);

  return `${formattedSize} KiB`;
}
