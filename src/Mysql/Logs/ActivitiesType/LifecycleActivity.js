export const assetsLifecycleScoreUpdateActivity = {
  label: "Asset Lifecycle score Update",
  code: "7022",
  status: {
    assetScoreUpdatedSuccessfully: {
      label: "Asset Lifecycle score updated successfully",
      code: "7022200",
      status: "success",
      severity: null,
    },
    assetScoreUpdatingFailed: {
      label: "Asset Lifecycle score updating failed",
      code: "7022400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

// update lifecycle asset info
export const updateLifecycleAssetInfo = {
  label: "Update lifecycle asset info",
  code: "7023",
  status: {
    updateLifecycleAssetInfoSuccess: {
      label: "Updated lifecycle asset info successfully",
      code: "7023200",
      status: "success",
      severity: null,
    },
    updateLifecycleAssetInfoFailed: {
      label: "Updating lifecycle asset info failed",
      code: "7023400",
      status: "failed",
      severity: "High",
    },
  },
};

const LifecycleActivityCategory = {
  label: "Lifecycle activities",
  code: 7000,
  activities: {
    assetsLifecycleScoreUpdateActivity,
    updateLifecycleAssetInfo
  },
};

export default LifecycleActivityCategory;
