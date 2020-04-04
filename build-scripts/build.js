const fs = require('fs');

const esImport = `export * as SfdxDeployPlugin from './index.cjs';`;

fs.writeFile('./build/index.mjs', esImport, (err) => {
  console.log(err);
});

fs.rename('./build/index.js', './build/index.cjs', (err) => {
  console.log(err);
});
