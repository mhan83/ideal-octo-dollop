import fs from 'node:fs';
import { basename } from 'node:path';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { promisify } from 'node:util';
import child_process from 'node:child_process';

const exec = promisify(child_process.exec);

/**
 * @param {string} url 
 * @param {string} dest 
 */
async function download(url, dest = './') {
  const destFile = path.join(dest, basename(url));

  console.time('download');

  const res = await fetch(url);
  const fileStream = fs.createWriteStream(destFile);
  await finished(Readable.fromWeb(res.body).pipe(fileStream));

  console.timeEnd('download');

  return destFile;
}

/**
 * @param {string} source 
 * @param {string} dest 
 */
async function unzip(source, dest = './') {
  console.time('unzip');

  // await exec(`unzip -q -o ${source}`, {
  //   cwd: path.dirname(dest),
  // });
  await exec(`python extract.py ${source} ./`, {
    cwd: path.dirname(dest),
  });

  console.timeEnd('unzip');
}

async function unzipWin(source, dest = './') {
  console.time('unzip');

  await exec(`Expand-Archive -Force -Path ${source}`, {
    cwd: path.dirname(dest),
    shell: 'powershell.exe',
  });

  console.timeEnd('unzip');
}

const urlArg = process.argv[2];
const destArg = process.argv[3] ?? './';

console.log(`downloading ${urlArg} to ${destArg}`);
console.log();

const destFile = await download(urlArg, destArg);
await unzip(destFile);
// if (os.platform().startsWith('win')) {
//   await unzipWin(destFile);
// } else {
//   await unzip(destFile);
// }
