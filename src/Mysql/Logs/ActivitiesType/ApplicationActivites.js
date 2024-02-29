export const applicationCreateActivity = {
  label: "Create Application Activity",
  code: "9501",
  status: {
    applicationCreatedSuccessfully: {
      label: "Application created successfully",
      code: "9501200",
      status: "success",
      severity: null,
    },
    applicationCreationFailed: {
      label: "Application creation failed",
      code: "9501400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const applicationUpdateActivity = {
  label: "Update Application Activity",
  code: "9502",
  status: {
    applicationUpdatedSuccessfully: {
      label: "Application updated successfully",
      code: "9502200",
      status: "success",
      severity: null,
    },
    applicationUpdationFailed: {
      label: "Application updated failed",
      code: "9502400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const applicationDeleteActivity = {
  label: "Delete Application Activity",
  code: "9503",
  status: {
    applicationDeletedSuccessfully: {
      label: "Application deleted successfully",
      code: "9503200",
      status: "success",
      severity: null,
    },
    applicationDeletionFailed: {
      label: "Application deletion failed",
      code: "9503400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const createApplicationScoreWeightageActivity = {
  label: "Create application score management",
  code: "9561",
  status: {
    applicationAssetUnAssignSuccessfully: {
      label: "application score management created successfully",
      code: "9561200",
      status: "success",
      severity: "informational",
    },
    applicationAssetUnAssignFailed: {
      label: "application score management created failed",
      code: "9561400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const UpdateApplicationScoreWeightageActivity = {
  label: "Update Application score management",
  code: "9562",
  status: {
    ApplicationScoreWeightageUpdateSuccessfully: {
      label: "Application update score management successfully",
      code: "9562200",
      status: "success",
      severity: "informational",
    },
    ApplicationScoreWeightageUpdateFailed: {
      label: "Application score management updating failed",
      code: "9562400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const deleteApplicationScoreWeightageActivity = {
  label: "Delete Application score management",
  code: "9563",
  status: {
    ApplicationScoreWeightageDeletedSuccessfully: {
      label: "Application score management deleted successfully",
      code: "9563200",
      status: "success",
      severity: "informational",
    },
    ApplicationScoreWeightageDeletedFailed: {
      label: "Application score management deleted failed",
      code: "9563400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const createApplicationCustomScoreActivity = {
  label: "application created custom score",
  code: "9564",
  status: {
    successfully: {
      label: "application custom score created successfully",
      code: "9564200",
      status: "success",
      severity: "informational",
    },
    Failed: {
      label: "application custom score creation failed",
      code: "9564400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

const applicationActivities = {
  applicationCreateActivity,
  applicationUpdateActivity,
  applicationDeleteActivity,
  createApplicationScoreWeightageActivity,
  UpdateApplicationScoreWeightageActivity,
  deleteApplicationScoreWeightageActivity,
  createApplicationCustomScoreActivity,
};

const ApplicationActivityCategory = {
  label: "Application Activity Category",
  code: 9500,
  activities: applicationActivities,
};

export default ApplicationActivityCategory;
