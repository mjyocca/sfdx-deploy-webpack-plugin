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

export interface PluginOptions {
  /**
   * File Path to your sfdx project to watch file system changes
   * Default: `./force-app/main/default/`
   */
  projectPath?: string;
  /**
   * [RegExp] | function(resource)
   */
  // filter?: Function | RegExp;
  /**
   * Delay in ms to deploy after webpack's compiler done hook is emitted.
   * Useful for when other processes modify files in your sfdx project and to capture those
   */
  delay?: number;
  /**
   * Optional sfdx command arguments
   */
  deployArgs?: DeployArgs;
  /**
   * ß
   */
  // pushArgs?: any;
  /**
   * Set to {false} to not run during webpack watch mode
   */
  webpackWatch?: boolean;
}

/**
 * @description Optional sfdx command line arguments.
 *
 * SFDX Parameters More Info Here: https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_source.htm
 */
export interface DeployArgs {
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

  _quiet?: boolean;
}
