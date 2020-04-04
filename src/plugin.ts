import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { EventEmitter } from 'events';
import watch from 'node-watch';
import sfdx from 'sfdx-node/parallel';
import execCmd from './execCmd';
import { normalizeOrgInfo } from './helper';

const readFile = util.promisify(fs.readFile);

const DELAY = 0;
const sfdxProjectPath = './force-app/main/default/';
const deployCmd = `force:source:deploy`;
const pushCmd = `force:source:push`;
const deployEvent = new EventEmitter();
const deployFiles = new Set();

const watchOptions = {
  recursive: true,
  delay: DELAY,
  filter: (f) => !/node_modules/.test(f),
};

const watchCallback = (evt, name) => {
  console.log(`watch::: ${evt}: ${name}`);
};

export default class SfdxDeployPlugin {
  options: any;
  webpackWatch: boolean = false;
  stopMonitoring: boolean = false;

  constructor(options: any) {
    this.options = options;
  }

  async watchDeploy() {
    if (deployFiles.size > 0) {
      deployEvent.emit('sf__deploy');
    } else {
      console.log('nothing to deploy: watchDeploy');
    }
  }

  async deploy() {
    const sfdxOrgs = await sfdx.org.list({ _quiet: true });
    const { defaultOrg } = normalizeOrgInfo(sfdxOrgs);
    const sfdxCommand = defaultOrg.isScratchOrg ? pushCmd : deployCmd;

    let argFiles;
    const sfdxArgs = [sfdxCommand];
    if (!defaultOrg.isScratchOrg) {
      argFiles = Array.from(deployFiles)
        .map((file: string): string => {
          // let pathSep = file.split(path.sep);
          // if (pathSep.includes('staticresources')) {
          //   return './force-app/main/default/staticresources/dist';
          // } else {
          //   return path.join(...file.split(path.sep));
          // }
          return path.join(...file.split(path.sep));
        })
        .join(',');
      sfdxArgs.push(`-p ${argFiles}`);
    }
    // console.log({ argFiles });
    // await execCmd('sfdx', sfdxArgs);
    const myRes = await sfdx.source.deploy({
      _quiet: false,
      sourcepath: argFiles,
    });
    console.log({ myRes });
    deployFiles.clear();
  }

  apply(compiler) {
    // create watcher for sfdx project
    const watcher = watch(
      path.resolve(sfdxProjectPath),
      watchOptions,
      watchCallback
    );
    // on deploy event, call deploy mthod
    deployEvent.on('sf__deploy', this.deploy);
    // add files change add to unique set
    watcher.on('change', (evt, name) => {
      console.log(`watcher: onchange event => ${evt}, ${name}`);
      deployFiles.add(name);
    });

    compiler.hooks.beforeRun.tapAsync('SFDX-WATCH', (compiler, callback) => {
      console.log('\nSFDX-Watch: before run\n');
      callback();
    });

    compiler.hooks.watchRun.tapAsync('SFDX-WATCH', (compiler, callback) => {
      console.log('watchRun hook');
      this.webpackWatch = true;
      callback();
    });

    compiler.hooks.done.tapAsync('SFDX-WATCH', (stats, callback) => {
      console.log('\nSFDX-Watch: done \n\n');

      if (!this.webpackWatch) {
        setTimeout(() => {
          watcher.close();
          deployEvent.emit('sf__deploy');
        }, DELAY + 50);
      } else {
        console.log(`we're in watch mode ya'll`);
        setInterval(this.watchDeploy, 12000);
      }

      callback();
    });

    compiler.hooks.watchClose.tap('SFDX-WATCH', () => {
      console.log('watch Close');
    });
  }
}
