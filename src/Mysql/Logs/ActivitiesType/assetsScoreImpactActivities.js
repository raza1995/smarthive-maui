export const assetsScoreImpactCreateActivity = {
  label: "Create assets Score Impact",
  code: "5032",
  status: {
    assetsScoreImpactCreatedSuccessfully: {
      label: "assets Score Impact created successfully",
      code: "5032200",
      status: "success",
      severity: null,
    },
    assetsScoreImpactCreationFailed: {
      label: "assets Score Impact created failed",
      code: "5032400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const assetsScoreImpactDeleteActivity = {
  label: "Delete assets Score Impact",
  code: "5034",
  status: {
    assetsScoreImpactDeletedSuccessfully: {
      label: "assets Score Impact deleted successfully",
      code: "5034200",
      status: "success",
      severity: null,
    },
    assetsScoreImpactDeletingFailed: {
      label: "assets Score Impact Deletion failed",
      code: "5034400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const assetsScoreImpactUpdateActivity = {
  label: "Update assets Score Impact",
  code: "5033",
  status: {
    assetUpdatedSuccessfully: {
      label: "assets Score Impact updated successfully",
      code: "5033200",
      status: "success",
      severity: null,
    },
    assetUpdatingFailed: {
      label: "assets Score Impact updating failed",
      code: "5033400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

const assetsScoreImpactActivities = {
  assetsScoreImpactCreateActivity,
  assetsScoreImpactDeleteActivity,
  assetsScoreImpactUpdateActivity,
};
export default assetsScoreImpactActivities;
