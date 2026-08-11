import { Injectable, NotFoundException } from '@nestjs/common';
import { statSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

export const UPLOADS_DIR = 'uploads';

@Injectable()
export class FilesService {
  getFile(filename: string): string {
    const uploadsDir = resolve(process.cwd(), UPLOADS_DIR);
    const filePath = resolve(uploadsDir, filename);

    if (!this.isInside(uploadsDir, filePath)) {
      throw new NotFoundException('File not found');
    }
    if (!this.isFile(filePath)) {
      throw new NotFoundException('File not found');
    }

    return filePath;
  }

  private isInside(baseDir: string, target: string): boolean {
    const rel = relative(baseDir, target);
    return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
  }

  private isFile(filePath: string): boolean {
    try {
      return statSync(filePath).isFile();
    } catch {
      return false;
    }
  }
}
