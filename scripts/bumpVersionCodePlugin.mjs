import { readFile, writeFile } from 'fs/promises'

import { Plugin } from 'release-it';

class BumpVersionCodePlugin extends Plugin {

  async bump(version) {
    const filePath = this.options.file;
    const fileContents = await readFile(filePath, 'utf-8');

    const regex = new RegExp(this.options.search);
    const result = regex.exec(fileContents);

    const code = Number(result[1]);
    if (Number.isNaN(code)) throw new Error('version code is not a number');

    const newCode = code + 1;

    const preparedReplacement = this.options.replace.replace('{{code}}', newCode);
    const newFileContents = fileContents.toString().replace(regex, preparedReplacement)

    await writeFile(filePath, newFileContents);
  }

}

export default BumpVersionCodePlugin;
