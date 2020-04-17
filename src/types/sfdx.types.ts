/* @Types */
export enum OrgType {
  scratchOrg = 'scratchOrg',
  developerOrg = 'developerOrg',
}

export interface OrgList {
  scratchOrgs: OrgInfo[];
  nonScratchOrgs: OrgInfo[];
}

export interface OrgInfo {
  orgInfo: string;
  accessToken: string;
  username: string;
  clientId: string;
  alias?: string;
  isDevHub?: boolean;
  isDefaultDevHubUsername?: boolean;
  defaultMarker?: string;
  orgType?: OrgType;
}

export interface OrgInfoResult {
  defaultScratchOrg?: OrgInfo;
  defaultHubOrg?: OrgInfo;
  defaultDevOrg?: OrgInfo;
}
