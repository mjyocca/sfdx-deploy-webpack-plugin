import * as path from 'path';
import { EventEmitter } from 'events';
import * as webpack from 'webpack';
import watch from 'node-watch';
import sfdx from 'sfdx-node/parallel';
import debounce from 'lodash.debounce';
import { getSourcePath, addFile, mergeDeployArgs } from './helper';
import { PluginOptions, DeployArgs } from './types/plugin.types';

export default class SfdxDeployPlugin {
  private readonly PLUGIN_NAME = 'SfdxDeployPlugin';
  private readonly DeployEvtName = 'sfdx__deploy';
  private compiler: webpack.Compiler;
  private watcher: any; /* ImprovedFSWatcher */
  private deployFiles = new Set<string>();
  private deployEvent = new EventEmitter();
  private webpackDone = false;
  private webpackWatch = false;
  private closeWatcher = false;
  private watchFs = true;

  private defaultDeployArgs: DeployArgs = {
    _quiet: false,
  };

  /* Public */
  options: PluginOptions;
  deployArgs: DeployArgs;
  projectPath: string;
  delay: number;
  log = false;

  /**
   *
   * @param options Webpack Options passed into Plugiin instance
   */
  constructor(options?: PluginOptions) {
    this.options = options || ({} as PluginOptions);
    this.setConfig();
  }

  setConfig() {
    const {
      projectPath = './force-app/main/default/',
      delay = 250,
      deployArgs,
    } = this.options;
    if (deployArgs) {
      this.deployArgs = deployArgs;
      if (deployArgs.sourcepath || deployArgs.manifest || deployArgs.metadata) {
        this.watchFs = false;
      }
    }
    this.projectPath = projectPath;
    this.delay = delay;
  }

  /**
   *
   * @param compiler Webpack Compiler Object
   * Invoked from webpack tapable hooks
   */
  public apply(compiler: webpack.Compiler): void {
    this.compiler = compiler;
    // on deploy event, call deploy method w/ debounce
    this.deployEvent.on(
      this.DeployEvtName,
      debounce(this.deploy.bind(this), this.delay)
    );
    // register node fs watcher if in watch mode
    if (this.watchFs) this.registerWatcher();

    // register webpack compiler hooks
    this.pluginDone();
    this.pluginWatchRun();
    this.pluginWatchClose();
  }

  /**
   * @description async function to deploy files modified in sfdx project
   */
  async deploy(): Promise<void> {
    try {
      // check if webpack has completed and if not return
      if (!this.webpackDone) {
        return;
      }
      /* Deploy source to org */
      await this.sourceDeploy(getSourcePath(this.deployFiles));
      // close watcher to end process if not in watch mode
      if (!this.webpackWatch && this.watchFs) {
        this.watcher.close();
      }
      /* End of each deploy, clear set */
      this.deployFiles.clear();
    } catch (err) {
      console.error(`${this.PLUGIN_NAME} had an error: ${err}`);
    }
  }

  /**
   *
   * @param sourcepath
   */
  async sourceDeploy(sourcepath: string) {
    this.defaultDeployArgs = {
      ...this.defaultDeployArgs,
      sourcepath,
    };
    const sourceDeployArgs = mergeDeployArgs(
      this.defaultDeployArgs,
      this.deployArgs
    );
    return await sfdx.source.deploy(sourceDeployArgs);
  }

  /**
   *
   * @param event Node-Watch event
   * @param filePath Node-Watch filename
   */
  private fileChangeHandler(event: string, filePath: string): void {
    // add file to unique set
    this.deployFiles.add(addFile(filePath));
    // emit deploy evt that will be debounced
    this.deployEvent.emit(this.DeployEvtName);
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
        this.webpackDone = true;
        this.deployEvent.emit(this.DeployEvtName);
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
