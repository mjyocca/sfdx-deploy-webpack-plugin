/**
 * Prototyping options to alter/change behavior
 *
 * Default bahvior, will watch your sfdx/force-app project folder for any file changes
 * Reason for this default behavior is only deploy the necessary assets based on changes during webpack compilation
 * Other plugins might update, create files in sfdx project and this will attempt to monitor and capture those fs events
 *
 * Currently doesn't capture delete and push those changes to the org.
 *
 * After webpack compiler finishes, will then grab your sfdx org's and determine:
 *   1) Your default org is a scratch org (source-tracked)
 *   2) If your default org is a scratch, then the `force:source:push` command is executed
 *   3) If your default org is a non-scratch then `force:source:deploy` command is executed w/ the combined {sourcepath} array of modified files
 *
 * Situations such as deploying entire project, Other non-modified files, running tests after the deploy, etc
 *
 */

export interface DeployOptions {
  /**
   * File Path to your sfdx project to watch file system changes
   * Default: `./force-app/main/default/`
   */
  projectPath?: string;
  /**
   * [RegExp] | function(resource)
   */
  filter?: Function | RegExp;
  /**
   * Delay in ms to deploy after webpack's compiler done hook is emitted.
   * Useful for when other processes modify files in your sfdx project and to capture those
   */
  delay?: number;
  /**
   *
   */
  SfdxArgs?: SfdxArgs;
  /**
   * Options only applicable when webpack is in --watch mode.
   * Set to {false} to not run during webpack watch mode
   */
  webpackWatch?: WatchModeOptions | boolean;
}

/**
 * Options only applicable when webpack is in --watch mode
 */
interface WatchModeOptions {
  /**
   * Timer in ms to deploy local fs changes or passed in files/arguments to your default or specified org
   * (Default) 15000
   */
  IntervalDelay: number;
}

/**
 * @description Optional sfdx command line arguments.
 *
 * SFDX Parameters More Info Here: https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_source.htm
 */
export interface SfdxArgs {
  /**
   * {CUSTOM}
   * Indicates if your specified org is source-tracked. Currently Scratch orgs and developer pro sandboxes (beta) are source-tracked
   * If true, the plugin will execute `source:push` but default to `source:deploy`
   */
  sourceTracked?: boolean;
  /**
   * A username or alias for the target org. Overrides the default target org.
   */
  targetusername?: string;
  /**
   * Override the API version used for API requests made by this command.
   */
  apiversion?: string;
  /**
   * A comma-separated list of names of metadata components to deploy to the org.
   */
  metadata?: string;
  /**
   * (Attention)
   * This is set automatically for non-scratch orgs(source-tracked). If you wish to deploy files other than ones modified during webpack compilation. Manually pass in this argument.
   *
   * A comma-separated list of paths to the local source files to deploy. The supplied paths can be to a single file (in which
   * case the operation is applied to only one file) or to a folder (in which case the operation is applied to all metadata types
   * in the directory and its sub-directories).
   * If you specify this parameter, don’t specify {manifest} or {metadata}.
   */
  sourcepath?: string;
  /**
   * The complete path for the manifest (package.xml) file that specifies the components to deploy. All child components are included.
   * If you specify this parameter, don’t specify {metadata} or {sourcepath}.
   */
  manifest?: string;
}
