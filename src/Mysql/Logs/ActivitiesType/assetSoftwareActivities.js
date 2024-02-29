export const assetSoftwareCreateActivity = {
  label: "Create assetSoftware",
  code: "5051",
  status: {
    assetSoftwareCreatedSuccessfully: {
      label: "assetSoftware created successfully",
      code: "5051200",
      status: "success",
      severity: null,
    },
    assetSoftwareCreationFailed: {
      label: "assetSoftware created failed",
      code: "5051400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const assetSoftwareDeleteActivity = {
  label: "Delete assetSoftware",
  code: "5053",
  status: {
    assetSoftwareDeletedSuccessfully: {
      label: "assetSoftware deleted successfully",
      code: "5053200",
      status: "success",
      severity: null,
    },
    assetSoftwareDeletingFailed: {
      label: "assetSoftware Deletion failed",
      code: "5053400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const assetSoftwareUpdateActivity = {
  label: "Update assetSoftware",
  code: "5052",
  status: {
    assetSoftwareUpdatedSuccessfully: {
      label: "assetSoftware updated successfully",
      code: "5052200",
      status: "success",
      severity: null,
    },
    assetSoftwareUpdatingFailed: {
      label: "assetSoftware updating failed",
      code: "5052400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const getAssetSoftwareActivity = {
  label: "Get assetSoftware",
  code: "5054",
  status: {
    assetSoftwareGetSuccessfully: {
      label: "assetSoftware Get successfully",
      code: "5054200",
      status: "success",
      severity: null,
    },
    gettingAssetSoftwareFailed: {
      label: "getting assetSoftware failed",
      code: "5054400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

const assetSoftwareActivities = {
  assetSoftwareCreateActivity,
  assetSoftwareDeleteActivity,
  assetSoftwareUpdateActivity,
  getAssetSoftwareActivity,
};
export default assetSoftwareActivities;
