import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { UPLOADS_DIR } from '../files/files.service';

const GENERATED_CVS_DIRECTORY = 'generated-cvs';

@Injectable()
export class CompiledPdfStorage {
  async store(pdf: Buffer): Promise<string> {
    const directory = resolve(
      process.cwd(),
      UPLOADS_DIR,
      GENERATED_CVS_DIRECTORY,
    );

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

  async remove(filename: string): Promise<void> {
    const uploadsDirectory = resolve(process.cwd(), UPLOADS_DIR);
    const filePath = resolve(uploadsDirectory, filename);
    const relativePath = relative(uploadsDirectory, filePath);

    if (
      relativePath === '' ||
      relativePath.startsWith('..') ||
      isAbsolute(relativePath)
    ) {
      throw new Error(
        'Compiled PDF path must remain inside the uploads directory.',
      );
    }

    await rm(filePath, {
      force: true,
    });
  }
}
