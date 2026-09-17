import { glob } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  asyncScheduler,
  catchError,
  defaultIfEmpty,
  defer,
  EMPTY,
  filter,
  forkJoin, from,
  map,
  mergeMap,
  Observable,
  of,
  scheduled,
  switchMap, tap,
  toArray,
} from 'rxjs';

import { alterPackage } from './utils';

const propertiesToRemove = [
  'scripts',
  'nx',
  'jestSonar',
];

const packageExtension = {
  main: './cjs/index.js',
  module: './esm/index.js',
  types: './types/index.d.ts',
  exports: {
    '.': {
      types: './types/index.d.ts',
      node: './cjs/index.js',
      require: './cjs/index.js',
      default: './esm/index.js',
    },
    './package.json': './package.json',
  },
};

export function completePackage(
  workDir: string,
  packageDir: string,
  packageName: string,
) {
  const rootDir = resolve(workDir, '.');
  const gitIgnorePath = resolve(rootDir, '.gitignore');
  const npmIgnorePath = resolve(workDir, '.npmignore');

  return forkJoin([
    safelyReadFileAsText(gitIgnorePath),
    safelyReadFileAsText(npmIgnorePath),
  ])
    .pipe(
      map((fileLists) => (
        fileLists
          .flatMap((fileList) => fileList.split(/\s*\n+\s*/))
          .filter((fileEntry) => fileEntry && !/^#/.test(fileEntry))
      )),
      switchMap((filesToIgnore) => defer(() => glob('**/*', { cwd: workDir, exclude: filesToIgnore })).pipe(
        mergeMap((foundPath) => forkJoin([
          of(foundPath),
          from(Bun.file(foundPath).stat()).pipe(
            map((stat) => stat.isFile())
          )
        ])),
        filter(([, isFile]) => isFile),
        map(([foundPath]) => foundPath),
        toArray(),
      )),
      switchMap((filesToCopy) => (
        scheduled(filesToCopy, asyncScheduler).pipe(
          mergeMap((file) => (
            Bun.write(resolve(packageDir, file), Bun.file(resolve(workDir, file)))
          ), 1),
          toArray(),
        )
      )),
      switchMap(() => alterPackage(resolve(packageDir, 'package.json'), {
        ...Object.fromEntries(propertiesToRemove.map((property) => [property, undefined])),
        ...packageExtension,
        name: packageName,
      })),
    );
}

function safelyReadFileAsText(path: string): Observable<string> {
  const file = Bun.file(path);

  return of(Bun.file(path)).pipe(
    switchMap((file) => file.exists()),
    filter(Boolean),
    switchMap(() => file.text()),
    catchError(() => EMPTY),
    defaultIfEmpty(''),
  );
}
