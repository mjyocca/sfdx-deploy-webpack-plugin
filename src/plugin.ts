import * as path from 'path';
import { EventEmitter } from 'events';
import * as webpack from 'webpack';
import watch from 'node-watch';
import sfdx from 'sfdx-node/parallel';
import { normalizeOrgInfo, getSourcePath, addFile } from './helper';
import { DeployOptions } from './types/plugin.types';

export default class SfdxDeployPlugin {
  private readonly PLUGIN_NAME = 'SfdxDeployPlugin';
  private readonly DeployEvtName = 'sfdx__deploy';
  private compiler: webpack.Compiler;
  private watcher: any; /* ImprovedFSWatcher */
  private deployFiles = new Set<string>();
  private deployEvent = new EventEmitter();
  private deployInterval: NodeJS.Timer;
  private webpackWatch = false;
  private closeWatcher = false;

  /* Public */
  options: DeployOptions;
  projectPath = './force-app/main/default/';
  delay = 0;
  log = false;

  // sfdxArgs?: DeployOptions['SfdxArgs'];

  // for v1 going to ignore options
  constructor(options?: DeployOptions) {
    this.options = options || ({} as DeployOptions);
  }

  /**
   *
   * @param compiler Webpack Compiler Object
   * Invoked from webpack tapable hooks
   */
  public apply(compiler: webpack.Compiler): void {
    this.compiler = compiler;
    // on deploy event, call deploy mthod
    this.deployEvent.on(this.DeployEvtName, this.deploy.bind(this));
    // register node fs watcher
    this.registerWatcher();
    // register webpack compiler hooks
    this.pluginDone();
    this.pluginWatchRun();
    this.pluginWatchClose();
  }

  /**
   * @description async function to deploy files modified in sfdx project
   */
  async deploy(): Promise<void> {
    // get org list from sfdx
    const sfdxOrgs = await sfdx.org.list({ _quiet: true });
    const { defaultScratchOrg } = normalizeOrgInfo(sfdxOrgs);
    // if scratch org push otherwise deploy modified files
    if (!defaultScratchOrg) {
      await this.sourceDeploy(getSourcePath(this.deployFiles));
    } else {
      await this.sourcePush();
    }
    // close watcher to end process if not in watch mode
    if (!this.webpackWatch) this.watcher.close();
    /* End of each deploy, clear set */
    this.deployFiles.clear();
  }

  /**
   * @description webpack watch mode async function invoked from webpack watch hooks to periodically deploy new modified files
   */
  async watchDeploy(): Promise<void> {
    if (this.deployFiles.size > 0) {
      this.deployEvent.emit(this.DeployEvtName);
    }
    if (this.closeWatcher) clearInterval(this.deployInterval);
  }

  async sourcePush() {
    return await sfdx.source.push({
      _quiet: false,
    });
  }

  async sourceDeploy(sourcepath: string) {
    return await sfdx.source.deploy({
      _quiet: false,
      sourcepath,
    });
  }

  fileChangeHandler(event: string, filePath: string): void {
    this.deployFiles.add(addFile(filePath));
  }

  private registerWatcher(): void {
    // create watcher for sfdx project
    this.watcher = watch(
      path.resolve(this.projectPath),
      {
        recursive: true,
        delay: 0,
        filter: f => !/node_modules/.test(f),
      },
      (evt, name) => {
        if (this.log) console.log(`${evt} ${name}`);
      }
    );
    // add files change add to unique set
    this.watcher.on('change', this.fileChangeHandler.bind(this));
  }

  private pluginDone() {
    this.compiler.hooks.done.tapAsync(
      this.PLUGIN_NAME,
      (stats: webpack.Stats, cb: Function) => {
        if (!this.webpackWatch) {
          setTimeout(() => {
            this.deployEvent.emit(this.DeployEvtName);
          }, this.delay);
        } else {
          this.deployInterval = setInterval(this.watchDeploy.bind(this), 12000);
        }
        cb();
      }
    );
  }

  private pluginWatchRun() {
    this.compiler.hooks.watchRun.tapAsync(this.PLUGIN_NAME, (compiler, cb) => {
      this.webpackWatch = true;
      cb();
    });
  }

  private pluginWatchClose() {
    this.compiler.hooks.watchClose.tap(this.PLUGIN_NAME, () => {
      this.closeWatcher = true;
    });
  }
}
