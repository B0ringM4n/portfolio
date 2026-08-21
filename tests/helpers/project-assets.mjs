import { readdir, readFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';

export const acceptedRasterExtensions = new Set([
  '.avif',
  '.webp',
  '.png',
  '.jpeg',
  '.jpg',
]);

const unquote = (value) => value.replace(/^(['"])(.*)\1$/, '$2');

export async function collectProjectAssetRecords(contentDirectory) {
  const contentFiles = (await readdir(contentDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => resolve(contentDirectory, entry.name))
    .sort();

  return Promise.all(
    contentFiles.map(async (contentFile) => {
      const source = await readFile(contentFile, 'utf8');
      const references = [...source.matchAll(/^\s*(?:-\s*)?(cover|image):\s*(.+?)\s*$/gm)].map(
        ([, field, rawReference]) => {
          const reference = unquote(rawReference.trim());
          return {
            field,
            reference,
            absolutePath: resolve(dirname(contentFile), reference),
            extension: extname(reference).toLowerCase(),
          };
        },
      );

      return {
        slug: basename(contentFile, '.md'),
        cover: references.find(({ field }) => field === 'cover'),
        gallery: references.filter(({ field }) => field === 'image'),
      };
    }),
  );
}
