const fs = require('fs');

const esImport = `export * as SfdxDeployPlugin from './index.js';`;

fs.writeFile('./build/index.mjs', esImport, (err) => {
  if (err) console.error(err);
});
