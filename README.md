[![Latest Stable Version](https://img.shields.io/npm/v/sfdx-deploy-webpack-plugin.svg)](https://www.npmjs.com/package/sfdx-deploy-webpack-plugin)
[![NPM Downloads](https://img.shields.io/npm/dm/sfdx-deploy-webpack-plugin.svg)](https://www.npmjs.com/package/sfdx-deploy-webpack-plugin)
[![License](https://img.shields.io/github/license/mjyocca/sfdx-deploy-webpack-plugin.svg)](https://github.com/mjyocca/sfdx-deploy-webpack-plugin)

# Sfdx Deploy Webpack Plugin

Webpack plugin that deploys your local SFDX project to your Salesforce Evironment **(Developer|Sandbox|Scratch)** after webpack compilation.

#### Default Behavior

`sfdx-deploy-webpack-plugin` by default watches your local file system during webpack compilation and deploys those files to you default target org. Via the provided options you're able to alter the target org and files you wish to deploy. (Useful for an entire project deploy)

Primary use case is to deploy your webpack generated assets to your salesforce org via [staticresources](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_source_file_format.htm) along w/ other newly (created|modified) salesforce metadata files. However w/ the provided options can alter behavior and deploy other assets or your entrie project.

[Learn More](https://github.com/mjyocca/sfdx-deploy-webpack-plugin/wiki)

## Requirements

- [Node and npm](https://nodejs.org/en/) installed on your local machine
- Salesforce [SFDX CLI](https://developer.salesforce.com/tools/sfdxcli) installed on your local machine

#### Additional Requirements:

- Need to have your default development org authenticated
- Need to have your project in salesforce's [source format](https://developer.salesforce.com/tools/vscode/en/user-guide/source-format) project structure.

# Install

```
npm i sfdx-deploy-webpack-plugin --save-dev
```

# Setup

Import/Require the package into your webpack config file

**webpack.config.js**

```js
const path = require("path");
const SfdxDeploy = require('sfdx-deploy-webpack-plugin');

module.exports = {
  entry: './src/app.js',
  output: {
    filename: "[name]/[name].bundle.js",
    path: path.resolve(__dirname, "./force-app/main/default/staticresources/dist"),
  }
  plugins: [
    new SfdxDeploy()
  ],
};
```

<h2 align="center">Zero Config</h2>

`sfdx-deploy-webpack-plugin` plugin works without any configuration. :)

<h2 align="center">Options</h2>

|    Name     |    Type    |           Default           | Required | Description                                                                |
| :---------: | :--------: | :-------------------------: | :------: | :------------------------------------------------------------------------- |
| projectPath | `{String}` | `./force-app/main/default/` |  false   | path to your sfdx project directory                                        |
|    delay    | `{Number}` |             250             |  false   | delays the deployment of your files after webpack compilation is finished. |
| deployArgs  | `{Object}` |             N/A             |  false   | More info below                                                            |

<br/><br/>

#### deployArgs

```js
{
  /**
   * (Optional)
   * A username or alias for the target org. Overrides the default target org.
   *
   * Type: string
   */
  targetusername?: string;
  /**
   * (Optional)
   * Override the API version used for API requests made by this command.
   *
   * Type:
   */
  apiversion?: string;
  /**
   * (Optional)
   * A comma-separated list of names of metadata components to deploy to the org.
   *
   * If you specify this parameter, don’t specify {sourcepath} or {manifest}.
   *
   * Type: array
   */
  metadata?: string[];
  /**
   * (Optional)
   * (Attention) This is set automatically. If you wish to deploy entire project manually pass in this argument pointing to the root of your project OR path to your {manifest}
   *
   * A comma-separated list of paths to the local source files to deploy. The supplied paths can be to a single file (in which
   * case the operation is applied to only one file) or to a folder (in which case the operation is applied to all metadata types
   * in the directory and its sub-directories).
   *
   * If you specify this parameter, don’t specify {manifest} or {metadata}.
   *
   * Type: array
   */
  sourcepath?: string | string[];
  /**
   * (Optional)
   * The complete path for the manifest (package.xml) file that specifies the components to deploy. All child components are included.
   *
   * If you specify this parameter, don’t specify {metadata} or {sourcepath}.
   *
   * Type: filepath
   */
  manifest?: string;
}
```

_NOTE: Currently if you specify {metadata}, {sourcepath} or {manifest}, the plugin does NOT watch the filesystem and deploys any filesystem changes_
<br/>

<!-- <p align="center">coming soon</p>
<br/> -->

<h2 align="center">Example(s)</h2>

<br/>

### Deploy to a specific org

**webpack.config.js**

```js
const path = require('path');
const SfdxDeployPlugin = require('sfdx-deploy-webpack-plugin');

module.exports = {
  ...
  plugins: [
    new SfdxDeployPlugin({
      projectPath: path.resolve('./force-app/main/default/'),
      deployArgs: {
        /* can be authenticated username or alias  */
        targetusername: 'mysalesforceusername@domain.com'
      }
    })
  ]
}
```

### Deploy entire project

**webpack.config.js**

```js
const path = require('path');
const SfdxDeployPlugin = require('sfdx-deploy-webpack-plugin');

module.exports = {
  ...
  plugins: [
    new SfdxDeployPlugin({
      projectPath: path.resolve('./force-app/main/default/'),
      deployArgs: {
        // if this is your default org don't need to include
        targetusername: 'myDeveloperOrg',
        sourcepath: path.resolve('./force-app'),
        /* alt can specify path to your manifest xml file */
        /* manifest: path.resolve('./manifest/package.xml') */
      },
    }),
  ],
};
```

### Deploy specific metadata components - _(Ex. Apex, Visualforce, Lwc)_

**webpack.config.js**

```js
const SfdxDeployPlugin = require('sfdx-deploy-webpack-plugin');

module.exports = {
  ...
  plugins: [
    new SfdxDeployPlugin({
      deployArgs: {
        metadata: [
        'ApexClass',
        'ApexPage',
        'LightningComponentBundle'
        ]
        /* alt can pass an arry of paths or comma sep to {sourcepath} */
        /*
          sourcepath: [
            path.resolve(__dirname, 'force-app/main/default/classes/'),
            path.resolve(__dirname, 'force-app/main/default/pages/')
            path.resolve(__dirname, 'force-app/main/default/lwc/')
          ]
        /*
      }
    })
  ]
}
```

### Toggle Prod and Dev builds w/ webpack arguments

package.json

```json
"scripts": {
  "dev:quickDeploy": "webpack --mode dev --env.development --env.deploy quick",
  "dev:fullDeploy": "webpack --mode dev --env.development --env.deploy full",
  "prod:fullDeploy": "webpack --env.production --env.deploy full"
}
```

**webpack.config.js**

```js
const SfdxDeployPlugin = require('sfdx-deploy-webpack-plugin');
const path = require('path');


module.exports = (env, argv) => {

  const mode = env.production ? 'production' : 'development';
  const deployMode = env.deploy;

  const prodDeploy = {
    sourcepath: path.resolve('./force-app/main/default/')
  };

  return {
    ...
    plugins: [
      new SfdxDeployPlugin({
        projectPath: path.resolve('force-app', 'main', 'default'),
        deployArgs: deployMode === 'full' ? prodDeploy : {}
      })
    ]
  }
}
```
