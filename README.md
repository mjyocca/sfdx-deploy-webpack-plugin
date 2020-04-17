[![Latest Stable Version](https://img.shields.io/npm/v/sfdx-deploy-webpack-plugin.svg)](https://www.npmjs.com/package/sfdx-deploy-webpack-plugin)
[![NPM Downloads](https://img.shields.io/npm/dm/sfdx-deploy-webpack-plugin.svg)](https://www.npmjs.com/package/sfdx-deploy-webpack-plugin)
[![License](https://img.shields.io/github/license/mjyocca/sfdx-deploy-webpack-plugin.svg)](https://github.com/mjyocca/sfdx-deploy-webpack-plugin)

# Sfdx Deploy Webpack Plugin

Webpack plugin that deploys your local SFDX project to your Salesforce Evironment.
**(Developer|Sandbox|Scratch)**

#### Default Behavior

- Non-source tracked orgs: <br/>
  - Watches source modified in your project during webpack compilation and deploys them to your target org. (does not push files that are deleted)
- Source tracked orgs (Scratch): <br/>
  - SFDX already monitors changed/modified source from your project and pushes the files that are out of sync in your target org

[Learn More](https://github.com/mjyocca/sfdx-deploy-webpack-plugin/wiki)

## Requirements

- [Node and npm](https://nodejs.org/en/) installed on your local machine
- Salesforce [SFDX CLI](https://developer.salesforce.com/tools/sfdxcli) installed on your local machine

#### Additional Requirements:

- Need to have your default development org authenticated

# Install

```
npm i sfdx-deploy-webpack-plugin --save-dev
```

# Setup

Import/Require the package into your webpack config file

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

`sfdx-deploy-webpack-plugin` plugin works without any configuration. :)
Configuration Options coming soon.

<h2 align="center">Options (In Progress)</h2>
<br/>

<p align="center">coming soon</p>
<br/>

<h2 align="center">Example(s)</h2>
<br/>
<p align="center">coming soon</p>
