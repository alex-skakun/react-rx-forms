import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

export function src(path: string): string {
  return resolve(cwd(), path);
}

export function readFileAsText(filePath: string): Promise<string> {
  return readFile(src(filePath), { encoding: 'utf-8' });
}

export function writeFileAsText(filePath: string, text: string): Promise<void> {
  return writeFile(src(filePath), text, { encoding: 'utf-8' });
}

export function parsePackageJson(pathToJson: string): Record<string, any> {
  return readFileAsText(pathToJson).then((jsonText) => JSON.parse(jsonText));
}
