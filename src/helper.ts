import * as path from 'path';
import * as os from 'os';
import { OrgList, OrgInfo, OrgInfoResult, OrgType } from './types/sfdx.types';
import { DeployArgs } from './types/plugin.types';

const platform = os.platform();

const mapOrgTypes = ({ scratchOrgs, nonScratchOrgs }: OrgList) => {
  scratchOrgs = scratchOrgs.map(
    (org: OrgInfo): OrgInfo => {
      return {
        orgType: OrgType.scratchOrg,
        ...org,
      };
    }
  );
  nonScratchOrgs = nonScratchOrgs.map(
    (org: OrgInfo): OrgInfo => {
      return {
        orgType: OrgType.developerOrg,
        ...org,
      };
    }
  );
  return [scratchOrgs, nonScratchOrgs];
};

const getDefaultScratch = (orgs: OrgInfo[]): OrgInfo => {
  return orgs.find(({ defaultMarker }) => {
    return defaultMarker === '(U)';
  });
};

const searchNonScratch = (orgs: OrgInfo[]): OrgInfoResult => {
  return orgs.reduce((acc: OrgInfoResult, org: OrgInfo): OrgInfoResult => {
    const { defaultMarker, isDevHub } = org;
    if (defaultMarker === '(D)' || isDevHub === true) {
      acc.defaultHubOrg = org;
    } else if (defaultMarker === '(U)') {
      acc.defaultDevOrg = org;
    }
    return acc;
  }, {});
};

export const normalizeOrgInfo = (sfdxOrgs: OrgList): OrgInfoResult => {
  const [scratchOrgs, nonScratchOrgs] = mapOrgTypes(sfdxOrgs);
  const defaultScratchOrg = getDefaultScratch(scratchOrgs);
  const { defaultDevOrg, defaultHubOrg } = searchNonScratch(nonScratchOrgs);

  return {
    defaultScratchOrg,
    defaultDevOrg,
    defaultHubOrg,
  };
};

export const mergeDeployArgs = (
  defaultArgs: DeployArgs,
  deployArgs?: DeployArgs
) => {
  let sourceDeployArgs: DeployArgs = {};
  const { _quiet, sourcepath } = defaultArgs;
  const { sourcepath: sPath, manifest, metadata } = deployArgs;
  if (sPath || manifest || metadata) {
    sourceDeployArgs = {
      ...deployArgs,
      _quiet,
    };
  } else {
    sourceDeployArgs = {
      ...deployArgs,
      _quiet,
      sourcepath,
    };
  }
  return sourceDeployArgs;
};

export const addFile = (fileString): string => {
  const fileChunks = fileString.split(path.sep);
  if (fileChunks.includes('staticresources')) {
    return fileChunks
      .slice(0, fileChunks.indexOf('staticresources') + 2)
      .join(path.sep);
  } else if (
    fileString.endsWith('.eslintrc.json') ||
    fileString.endsWith('jsconfig.json')
  ) {
    return '';
  } else {
    return fileString;
  }
};

export const getSourcePath = (files): string => {
  return Array.from(files)
    .filter(file => file && file !== '')
    .map((file: string): string =>
      platform === 'win32' ? path.join(...file.split(path.sep)) : file
    )
    .reduce((prev, curr, idx) => (idx === 0 ? curr : `${prev}, ${curr}`), '');
};
