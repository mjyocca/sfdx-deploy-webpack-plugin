export const normalizeOrgInfo = ({ scratchOrgs, nonScratchOrgs }) => {
  let defaultOrg;
  const scratchOrgInfo = scratchOrgs.reduce((acc, cur) => {
    const isDefault = cur.defaultMarker && cur.defaultMarker === '(U)';
    if (isDefault) {
      cur.isScratchOrg = true;
      defaultOrg = cur;
    }
    acc.push({
      defaultOrg: isDefault,
      ...cur,
    });
  }, []);
  const nonScratchOrgInfo = nonScratchOrgs.reduce((acc, cur) => {
    const isDefault = cur.defaultMarker && cur.defaultMarker === '(U)';
    if (isDefault) defaultOrg = cur;
    acc.push({
      defaultOrg: isDefault,
      ...cur,
    });
  }, []);
  return {
    scratchOrgInfo,
    nonScratchOrgInfo,
    defaultOrg,
  };
};
