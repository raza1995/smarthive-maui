export const assetCreateActivity = {
  label: "Create asset",
  code: "5001",
  status: {
    assetCreatedSuccessfully: {
      label: "asset created successfully",
      code: "5001200",
      status: "success",
      severity: null,
    },
    assetCreationFailed: {
      label: "asset created failed",
      code: "5001400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const assetDeleteActivity = {
  label: "Delete asset",
  code: "5003",
  status: {
    assetDeletedSuccessfully: {
      label: "asset deleted successfully",
      code: "5003200",
      status: "success",
      severity: null,
    },
    assetDeletingFailed: {
      label: "asset Deletion failed",
      code: "5003400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const assetUpdateActivity = {
  label: "Update asset",
  code: "5002",
  status: {
    assetUpdatedSuccessfully: {
      label: "asset updated successfully",
      code: "5002200",
      status: "success",
      severity: null,
    },
    assetUpdatingFailed: {
      label: "asset updating failed",
      code: "5002400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const getAssetActivity = {
  label: "Get asset",
  code: "5004",
  status: {
    assetGetSuccessfully: {
      label: "asset Get successfully",
      code: "5004200",
      status: "success",
      severity: null,
    },
    gettingassetFailed: {
      label: "getting asset failed",
      code: "5004400",
      status: "failed",
      severity: "Medium",
      errorReason: {},
    },
  },
};

export const restartDevice = {
  label: "Restart Device",
  code: "3204",
  status: {
    restartDeviceSuccessfully: {
      label: "Device restart successfully",
      code: "3204200",
      status: "success",
      severity: "medium",
    },
    restartDeviceFailed: {
      label: "Device restart failed",
      code: "3204400",
      status: "failed",
      severity: "High",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

export const scanDevice = {
  label: "Scan Device",
  code: "3205",
  status: {
    scanDeviceSuccessfully: {
      label: "Device scan successfully",
      code: "3205200",
      status: "success",
      severity: "medium",
    },
    scanDeviceFailed: {
      label: "Device scan failed",
      code: "3205400",
      status: "failed",
      severity: "High",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

// Create Group
export const createGroupLog = {
  label: "Create Group",
  code: "3301",
  status: {
    createGroupSuccessfully: {
      label: "Group created successfully",
      code: "3301200",
      status: "success",
      severity: null,
    },
    createGroupFailed: {
      label: "Group created failed",
      code: "3301400",
      status: "failed",
      severity: "High",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

// edit group
export const editGroupLog = {
  label: "Edit Group",
  code: "3302",
  status: {
    editGroupSuccessfully: {
      label: "Group updated successfully",
      code: "3302200",
      status: "success",
      severity: null,
    },
    editGroupFailed: {
      label: "Group updation failed",
      code: "3302400",
      status: "failed",
      severity: "Medium",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

// delete group
export const deleteGroupLog = {
  label: "Delete Group",
  code: "3303",
  status: {
    deleteGroupSuccessfully: {
      label: "Group deleted successfully",
      code: "3303200",
      status: "success",
      severity: null,
    },
    deleteGroupFailed: {
      label: "Group deletion failed",
      code: "3303400",
      status: "failed",
      severity: "High",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};
// move group
export const moveGroupLog = {
  label: "Move Group",
  code: "3304",
  status: {
    moveGroupSuccessfully: {
      label: "Group move successfully",
      code: "3304200",
      status: "success",
      severity: null,
    },
    moveGroupFailed: {
      label: "Group move failed",
      code: "3304400",
      status: "failed",
      severity: "Medium",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

// get group
export const getGroupLog = {
  label: "Get Group",
  code: "3309",
  status: {
    getGroupSuccessfully: {
      label: "Group get successfully",
      code: "3309200",
      status: "success",
      severity: null,
    },
    getGroupFailed: {
      label: "Group get failed",
      code: "3309400",
      status: "failed",
      severity: "Medium",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

export const TagCreated = {
  label: "Tag Create",
  code: "3501",
  status: {
    TagCreatedSuccessfully: {
      label: "Tag Created successfully",
      code: "3501200",
      status: "success",
      severity: null,
    },
    TagCreationFailed: {
      label: "Tag Creation failed",
      code: "35014400",
      status: "failed",
      severity: "Medium",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

export const TagAssignToAsset = {
  label: "Tag assign Create",
  code: "3502",
  status: {
    TagAssignToAssetSuccessfully: {
      label: "Tag Assigned successfully",
      code: "3502200",
      status: "success",
      severity: null,
    },
    TagAssignToAssetFailed: {
      label: "Tag Assigned failed",
      code: "35024400",
      status: "failed",
      severity: "Medium",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};
export const TagUnAssignToAsset = {
  label: "Tag Unassign Create",
  code: "3503",
  status: {
    TagUnassignToAssetSuccessfully: {
      label: "Tag Unassigned successfully",
      code: "3503200",
      status: "success",
      severity: null,
    },
    TagUnassignToAssetFailed: {
      label: "Tag Unassigned failed",
      code: "35034400",
      status: "failed",
      severity: "Medium",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

export const AssetAssignToApplication = {
  label: "Asset Assign To Application",
  code: "3504",
  status: {
    AssetAssignToApplicationSuccessfully: {
      label: "Asset Assigned successfully",
      code: "3504200",
      status: "success",
      severity: null,
    },
    AssetAssignToApplicationFailed: {
      label: "Asset Assigned failed",
      code: "35044400",
      status: "failed",
      severity: "Medium",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

export const AssetUnassignToApplication = {
  label: "Asset Unassign To Application",
  code: "3505",
  status: {
    AssetUnassignToApplicationSuccessfully: {
      label: "Asset Unassigned successfully",
      code: "3505200",
      status: "success",
      severity: null,
    },
    AssetUnassignToApplicationFailed: {
      label: "Asset Unassigned failed",
      code: "35054400",
      status: "failed",
      severity: "Medium",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

export const createAssetsScoreWeightageActivity = {
  label: "Create Assets score management",
  code: "3561",
  status: {
    AssetsAssetUnAssignSuccessfully: {
      label: "Assets score management created successfully",
      code: "3561200",
      status: "success",
      severity: "informational",
    },
    AssetsAssetUnAssignFailed: {
      label: "Assets score management created failed",
      code: "3561400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const UpdateAssetsScoreWeightageActivity = {
  label: "Update Assets score management",
  code: "3562",
  status: {
    Successfully: {
      label: "Assets score management update successfully",
      code: "3562200",
      status: "success",
      severity: "informational",
    },
    Failed: {
      label: "Assets score management updating failed",
      code: "3562400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const deleteAssetsScoreWeightageActivity = {
  label: "Delete Assets score management",
  code: "3563",
  status: {
    AssetsScoreWeightageDeletedSuccessfully: {
      label: "Assets score management deleted successfully",
      code: "3563200",
      status: "success",
      severity: "informational",
    },
    AssetsScoreWeightageDeletedFailed: {
      label: "Assets score management deleted failed",
      code: "3563400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const createAssetsCustomScoreActivity = {
  label: "Assets created custom score",
  code: "3564",
  status: {
    Successfully: {
      label: "Assets custom score created successfully",
      code: "3564200",
      status: "success",
      severity: "informational",
    },
    Failed: {
      label: "Assets custom score creation failed",
      code: "3564400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

const assetsActivities = {
  assetCreateActivity,
  assetDeleteActivity,
  assetUpdateActivity,
  getAssetActivity,
  restartDevice,
  scanDevice,
  createGroupLog,
  editGroupLog,
  deleteGroupLog,
  getGroupLog,
  moveGroupLog,
  TagCreated,
  TagAssignToAsset,
  TagUnAssignToAsset,
  AssetAssignToApplication,
  AssetUnassignToApplication,
  createAssetsScoreWeightageActivity,
  UpdateAssetsScoreWeightageActivity,
  deleteAssetsScoreWeightageActivity,
  createAssetsCustomScoreActivity,
};
export default assetsActivities;
