import fs from 'node:fs';
import { basename } from 'node:path';
import os from 'node:os';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { promisify } from 'node:util';
import child_process from 'node:child_process';

const exec = promisify(child_process.exec);

/**
 * @param {string} url 
 * @param {string} dest 
 */
async function download(url) {
  const dest = `./${basename(url)}`;
  console.time('download');

  const res = await fetch(url);
  const fileStream = fs.createWriteStream(dest);
  await finished(Readable.fromWeb(res.body).pipe(fileStream));

  console.timeEnd('download');

  return dest;
}

/**
 * @param {string} source 
 * @param {string} dest 
 */
async function unzip(source, dest = './') {
  console.time('unzip');

  await exec(`unzip -q -o ${source}`, {
    cwd: dest,
  });

  console.timeEnd('unzip');
}

async function unzipWin(source, dest = './') {
  console.time('unzip');

  await exec(`Expand-Archive -Path ${source}`, {
    cwd: dest,
    shell: 'powershell.exe',
  });

  console.timeEnd('unzip');
}


const dest = await download(process.argv[2]);
if (os.platform().startsWith('win')) {
  await unzipWin(dest);
} else {
  await unzip(dest);
}
