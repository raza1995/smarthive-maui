// get endpoint assets list
export const GetPatchingAssetsFilters = {
  label: "Get Patching Assets Filters",
  code: "6003",
  status: {
    getPatchingAssetsFiltersSuccess: {
      label: "Get Patching Assets Filters successfully",
      code: "6003200",
      status: "success",
      severity: "Medium",
    },
    getPatchingAssetsFiltersFailed: {
      label: "Get Patching Assets Filters failed",
      code: "6003400",
      status: "failed",
      severity: "Medium",
    },
  },
};

// get endpoint assets list
export const createPatchingAssetInfo = {
  label: "Create patching asset info",
  code: "6004",
  status: {
    createPatchingAssetInfoSuccess: {
      label: "Create patching asset info successfully",
      code: "6004200",
      status: "success",
      severity: null,
    },
    createPatchingAssetInfoFailed: {
      label: "Create patching asset info failed",
      code: "6004400",
      status: "failed",
      severity: "High",
    },
  },
};

// get endpoint assets list
export const updatePatchingAssetInfo = {
  label: "Update patching asset info",
  code: "6007",
  status: {
    updatePatchingAssetInfoSuccess: {
      label: "Updated patching asset info successfully",
      code: "6007200",
      status: "success",
      severity: null,
    },
    updatePatchingAssetInfoFailed: {
      label: "Updating patching asset info failed",
      code: "6007400",
      status: "failed",
      severity: "High",
    },
  },
};
// GetPatchingAsset
export const GetPatchingAsset = {
  label: "Get patching asset",
  code: "6005",
  status: {
    createPatchingAssetInfoSuccess: {
      label: "Get patching asset successfully",
      code: "6005200",
      status: "success",
      severity: null,
    },
    createPatchingAssetInfoFailed: {
      label: "Get patching asset failed",
      code: "6005400",
      status: "failed",
      severity: "Medium",
    },
  },
};

// patchingAssets
export const PatchingAssets = {
  label: "Patching Assets",
  code: "6006",
  status: {
    createPatchingAssetInfoSuccess: {
      label: "Patching asset successfully",
      code: "6006200",
      status: "success",
      severity: null,
    },
    createPatchingAssetInfoFailed: {
      label: "Patching asset failed",
      code: "6006400",
      status: "failed",
      severity: "Medium",
    },
  },
};
export const assetsPatchingScoreUpdateActivity = {
  label: "Asset patching score Update",
  code: "6022",
  status: {
    assetScoreUpdatedSuccessfully: {
      label: "Asset patching score updated successfully",
      code: "6022200",
      status: "success",
      severity: null,
    },
    assetScoreUpdatingFailed: {
      label: "Asset patching score updating failed",
      code: "6022400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const PatchedJobAssignActivity = {
  label: "PatchedJobAssign",
  code: "6100",
  status: {
    PatchedJobAssignSuccessfully: {
      label: "Asset patching score updated successfully",
      code: "6100200",
      status: "success",
      severity: null,
    },
    PatchedJobAssignUpdatingFailed: {
      label: "Asset patching score updating failed",
      code: "6100400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

const AssetPatchingInformationActivity = {
  PatchedJobAssignActivity,
  assetsPatchingScoreUpdateActivity,
  GetPatchingAssetsFilters,
  createPatchingAssetInfo,
  updatePatchingAssetInfo,
  GetPatchingAsset,
};
export default AssetPatchingInformationActivity;
