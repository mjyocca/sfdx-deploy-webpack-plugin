[![Latest Stable Version](https://img.shields.io/npm/v/sfdx-deploy-webpack-plugin.svg)](https://www.npmjs.com/package/sfdx-deploy-webpack-plugin)
[![NPM Downloads](https://img.shields.io/npm/dm/sfdx-deploy-webpack-plugin.svg)](https://www.npmjs.com/package/sfdx-deploy-webpack-plugin)
[![License](https://img.shields.io/github/license/mjyocca/sfdx-deploy-webpack-plugin.svg)](https://github.com/mjyocca/sfdx-deploy-webpack-plugin)

# Sfdx Deploy Webpack Plugin: (In Development)

Webpack plugin that automatically deploys your modified SFDX project files during webpack's compilation to your Salesforce Developer/Sandbox or Scratch Org.

## Requirements

- [Node and npm]() installed on your local machine
- Salesforce [SFDX CLI]() installed on your local machine

#### Additional Requirements:

- Need to have your default development org authenticated

# Install (In development not on npm)

```
npm i sfdx-deploy-webpack-plugin --save-dev
```

# Setup

Import/Require (esm|commonjs) package in you webpack config

**webpack.config.js**

```js
const SfdxDeploy = require('sfdx-deploy-webpack-plugin');
```

```js
module.exports = {
  // ...
  plugins: [new SfdxDeploy()],
};
```

<h2 align="center">Zero Config</h2>

The `sfdx-deploy-webpack-plugin` plugin works without any configuration.

<h4>How it Works</h4>

Before running the sfdx cli deploy/push commands, it will first retrieve your default authenticated org and depending on if that org is a scratch or developer/sandbox org, will output the proper push/pull commands.

If your default org is a non-source tracking org such as developer/sandbox, the plugin will deploy only the modified files in your salesforce project directory, `force-app`. Therefore if there are other webpack plugins that add/modify your salesforce project files will be included in the deploy command. (Scratch orgs will automatically detect modified project files)

For exmple if your using [visualforce-template-webpack-plugin]() and [static-resource-webpack-plugin]() in conjuction with this plugin, your webpack compilation may result in modified visualforce page(s)/components(s) and output your web assets to the static resource directory. `sfdx-deploy-webpack-plugin` plugin would deploy your static resource folder/files and other modified files in your salesforce project.

<h2 align="center">Options (In Progress)</h2>

coming soon

<h2 align="center">Example(s)</h2>

coming soon
