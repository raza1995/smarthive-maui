export const assetInfoCreateActivity = {
  label: "Create assetInfo",
  code: "5011",
  status: {
    assetInfoCreatedSuccessfully: {
      label: "assetInfo created successfully",
      code: "5011200",
      status: "success",
      severity: null,
    },
    assetInfoCreationFailed: {
      label: "assetInfo created failed",
      code: "5011400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const assetInfoDeleteActivity = {
  label: "Delete assetInfo",
  code: "5013",
  status: {
    assetInfoDeletedSuccessfully: {
      label: "assetInfo deleted successfully",
      code: "5013200",
      status: "success",
      severity: null,
    },
    assetInfoDeletingFailed: {
      label: "assetInfo Deletion failed",
      code: "5013400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const assetInfoUpdateActivity = {
  label: "Update asset",
  code: "5012",
  status: {
    assetUpdatedSuccessfully: {
      label: "asset updated successfully",
      code: "5012200",
      status: "success",
      severity: null,
    },
    assetUpdatingFailed: {
      label: "asset updating failed",
      code: "5012400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const getAssetInfoActivity = {
  label: "Get assetInfo",
  code: "5014",
  status: {
    assetInfoGetSuccessfully: {
      label: "assetInfo Get successfully",
      code: "5014200",
      status: "success",
      severity: null,
    },
    gettingAssetInfoFailed: {
      label: "getting assetInfo failed",
      code: "5014400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

const assetsInfoActivities = {
  assetInfoCreateActivity,
  assetInfoDeleteActivity,
  assetInfoUpdateActivity,
  getAssetInfoActivity,
};

export default assetsInfoActivities;
