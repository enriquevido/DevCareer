import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { UPLOADS_DIR } from '../files/files.service';
import { statSync } from 'node:fs';

const GENERATED_CVS_DIRECTORY = 'generated-cvs';

@Injectable()
export class CompiledPdfStorage {
  async store(pdf: Buffer): Promise<string> {
    const directory = this.getGeneratedDirectory();

    await mkdir(directory, {
      recursive: true,
      mode: 0o700,
    });

    const filename = `${randomUUID()}.pdf`;
    const temporaryFilename = `${filename}.${randomUUID()}.tmp`;
    const temporaryPath = join(directory, temporaryFilename);
    const finalPath = join(directory, filename);

    try {
      await writeFile(temporaryPath, pdf, {
        flag: 'wx',
        mode: 0o600,
      });

      await rename(temporaryPath, finalPath);
    } finally {
      await rm(temporaryPath, {
        force: true,
      });
    }

    return `${GENERATED_CVS_DIRECTORY}/${filename}`;
  }

  getFile(filename: string): string {
    const filePath = this.resolveGeneratedFile(filename);

    try {
      if (statSync(filePath).isFile()) {
        return filePath;
      }
    } catch {
      throw new NotFoundException('Compiled PDF not found.');
    }

    throw new NotFoundException('Compiled PDF not found.');
  }

  async remove(filename: string): Promise<void> {
    const filePath = this.resolveGeneratedFile(filename);

    await rm(filePath, {
      force: true,
    });
  }

  private getGeneratedDirectory(): string {
    return resolve(process.cwd(), UPLOADS_DIR, GENERATED_CVS_DIRECTORY);
  }

  private resolveGeneratedFile(filename: string): string {
    const uploadsDirectory = resolve(process.cwd(), UPLOADS_DIR);
    const generatedDirectory = this.getGeneratedDirectory();
    const filePath = resolve(uploadsDirectory, filename);
    const relativePath = relative(generatedDirectory, filePath);

    if (
      relativePath === '' ||
      relativePath.startsWith('..') ||
      isAbsolute(relativePath)
    ) {
      throw new NotFoundException('Compiled PDF not found.');
    }

    return filePath;
  }
}
