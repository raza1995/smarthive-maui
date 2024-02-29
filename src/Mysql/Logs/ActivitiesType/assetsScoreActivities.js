export const assetsScoreCreateActivity = {
  label: "Create assetsScore",
  code: "5021",
  status: {
    assetsScoreCreatedSuccessfully: {
      label: "assetsScore created successfully",
      code: "5021200",
      status: "success",
      severity: null,
    },
    assetsScoreCreationFailed: {
      label: "assetsScore created failed",
      code: "5021400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const assetsScoreDeleteActivity = {
  label: "Delete assetsScore",
  code: "5023",
  status: {
    assetsScoreDeletedSuccessfully: {
      label: "assetsScore deleted successfully",
      code: "5023200",
      status: "success",
      severity: null,
    },
    assetsScoreDeletingFailed: {
      label: "assetsScore Deletion failed",
      code: "5023400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const assetsScoreUpdateActivity = {
  label: "Update asset",
  code: "5022",
  status: {
    assetUpdatedSuccessfully: {
      label: "asset updated successfully",
      code: "5022200",
      status: "success",
      severity: null,
    },
    assetUpdatingFailed: {
      label: "asset updating failed",
      code: "5022400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const getAssetsScoreActivity = {
  label: "Get assetsScore",
  code: "5024",
  status: {
    assetsScoreGetSuccessfully: {
      label: "assetsScore Get successfully",
      code: "5024200",
      status: "success",
      severity: null,
    },
    gettingAssetsScoreFailed: {
      label: "getting assetsScore failed",
      code: "5024400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

const assetsScoreActivities = {
  assetsScoreCreateActivity,
  assetsScoreDeleteActivity,
  assetsScoreUpdateActivity,
  getAssetsScoreActivity,
};
export default assetsScoreActivities;
