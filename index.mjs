import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import path from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import * as tar from 'tar';

import { packages } from './packages.mjs';

async function download(url, dest = './') {
  const destFile = path.join(dest, basename(url));

  const res = await fetch(url);
  const fileStream = createWriteStream(destFile);
  await finished(Readable.fromWeb(res.body).pipe(fileStream));

  return destFile;
}

async function prep(dir) {
  await mkdir(dir, {
    recursive: true,
  });
}

const workers = parseInt(process.argv[2]) ?? 5;
const root = process.argv[3] ?? './';
const dest = join(root, 'packages');

console.log(`testing with ${workers} workers downloading to ${dest}`);

await prep(dest);

let iter = packages.values();

const downloadWorkers = Array(workers).fill(iter).map(async (iter) => {
  for (const p of iter) {
    console.time(`downloading ${basename(p)}`);
    await download(p, dest);
    console.timeEnd(`downloading ${basename(p)}`);
  }
});

console.time(`download ${packages.length} packages`);
await Promise.allSettled(downloadWorkers);
console.timeEnd(`download ${packages.length} packages`);

iter = packages.values();
const extractWorkers = Array(workers).fill(iter).map(async (iter) => {
  for (const p of iter) {
    const name = basename(p, '.tgz')
    await mkdir(join(dest, name), { recursive: true });
    await tar.x({
      cwd: join(dest, name),
      f: join(dest, basename(p)),
      newer: false,
    });
  }
});

console.time(`extract ${packages.length} packages`);
await Promise.allSettled(extractWorkers);
console.timeEnd(`extract ${packages.length} packages`);
// 
// /**
//  * @param {string} source 
//  * @param {string} dest 
//  */
// async function unzip(source, dest = './') {
//   console.time('unzip');
// 
//   // await exec(`unzip -q -o ${source}`, {
//   //   cwd: path.dirname(dest),
//   // });
//   await exec(`python extract.py ${source} ./`, {
//     cwd: path.dirname(dest),
//   });
// 
//   console.timeEnd('unzip');
// }
// 
// async function unzipWin(source, dest = './') {
//   console.time('unzip');
// 
//   await exec(`Expand-Archive -Force -Path ${source}`, {
//     cwd: path.dirname(dest),
//     shell: 'powershell.exe',
//   });
// 
//   console.timeEnd('unzip');
// }
// 
// const urlArg = process.argv[2];
// const destArg = process.argv[3] ?? './';
// 
// console.log(`downloading ${urlArg} to ${destArg}`);
// console.log();
// 
// await download();
// await unzip(destFile);
// // if (os.platform().startsWith('win')) {
// //   await unzipWin(destFile);
// // } else {
// //   await unzip(destFile);
// // }
