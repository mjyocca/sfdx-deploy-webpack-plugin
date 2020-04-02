const { spawn } = require("child_process");
const platform = require("os").platform();

module.exports = (cmd, args, options = {}) => {
  if (platform == "win32") options.shell = true;

  const child = spawn(cmd, args, options);

  return new Promise((resolve, reject) => {
    let output = "";

    child.stdout.on("data", data => {
      console.log(`${data.toString()}`);
      output += data.toString();
    });

    child.stderr.on("data", data => {
      console.log(`${data.toString()}`);
      output += data.toString();
    });

    child.on("exit", err => {
      if (err) reject(output);
      resolve(output);
    });
  });
}


