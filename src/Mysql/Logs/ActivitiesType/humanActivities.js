export const humanCreateActivity = {
  label: "Create Human Activity",
  code: "9751",
  status: {
    humanCreatedSuccessfully: {
      label: "Human created successfully",
      code: "9751200",
      status: "success",
      severity: "informational",
    },
    humanCreationFailed: {
      label: "Human creation failed",
      code: "9751400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const humanUpdateActivity = {
  label: "Update Human Activity",
  code: "9752",
  status: {
    humanUpdatedSuccessfully: {
      label: "Human updated successfully",
      code: "9752200",
      status: "success",
      severity: "informational",
    },
    humanUpdationFailed: {
      label: "Human updated failed",
      code: "9752400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
export const humanDeleteActivity = {
  label: "Delete Human Activity",
  code: "9753",
  status: {
    humanDeletedSuccessfully: {
      label: "Human deleted successfully",
      code: "9753200",
      status: "success",
      severity: "informational",
    },
    humanDeletionFailed: {
      label: "Human deletion failed",
      code: "9753400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const humanApplicationLinkCreateActivity = {
  label: "Human assigned to Application Activity",
  code: "9754",
  status: {
    humanApplicationAssignSuccessfully: {
      label: "Human assigned to Application successfully",
      code: "9754200",
      status: "success",
      severity: "informational",
    },
    humanApplicationAssignFailed: {
      label: "Human assigned to Application failed",
      code: "9754400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const humanApplicationLinkRemoveActivity = {
  label: "Human unassigned from Application Activity",
  code: "9755",
  status: {
    humanApplicationUnAssignSuccessfully: {
      label: "Human unassigned from Application successfully",
      code: "9755200",
      status: "success",
      severity: "informational",
    },
    humanApplicationUnAssignFailed: {
      label: "Human unassigned from Application failed",
      code: "9755400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const humanAssetLinkCreateActivity = {
  label: "Human assigned to Asset Activity",
  code: "9756",
  status: {
    humanAssetAssignSuccessfully: {
      label: "Human assigned to Asset successfully",
      code: "9756200",
      status: "success",
      severity: "informational",
    },
    humanAssetAssignFailed: {
      label: "Human assigned to Asset failed",
      code: "9756400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const humanAssetLinkRemoveActivity = {
  label: "Human unassigned from Asset Activity",
  code: "9757",
  status: {
    humanAssetUnAssignSuccessfully: {
      label: "Human unassigned from Asset successfully",
      code: "9757200",
      status: "success",
      severity: "informational",
    },
    humanAssetUnAssignFailed: {
      label: "Human unassigned from Asset failed",
      code: "9757400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const createHumanScoreWeightageActivity = {
  label: "Create Human score management",
  code: "9758",
  status: {
    humanAssetUnAssignSuccessfully: {
      label: "Human score management created successfully",
      code: "9758200",
      status: "success",
      severity: "informational",
    },
    humanAssetUnAssignFailed: {
      label: "Human score management created failed",
      code: "9758400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const UpdateHumanScoreWeightageActivity = {
  label: "Update Human score management",
  code: "9761",
  status: {
    Successfully: {
      label: "Human score management update successfully",
      code: "9761200",
      status: "success",
      severity: "informational",
    },
    Failed: {
      label: "Human score management updating failed",
      code: "9761400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const deleteHumanScoreWeightageActivity = {
  label: "Delete Human score management",
  code: "9762",
  status: {
    Successfully: {
      label: "Human score management deleted successfully",
      code: "9762200",
      status: "success",
      severity: "informational",
    },
    Failed: {
      label: "Human score management deleted failed",
      code: "9762400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const createHumanCustomScoreActivity = {
  label: "Human created custom score",
  code: "9759",
  status: {
    Successfully: {
      label: "Human custom score created successfully",
      code: "9759200",
      status: "success",
      severity: "informational",
    },
    Failed: {
      label: "Human custom score creation failed",
      code: "9759400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};
const humanActivities = {
  humanCreateActivity,
  humanUpdateActivity,
  humanDeleteActivity,
  humanApplicationLinkCreateActivity,
  humanApplicationLinkRemoveActivity,
  humanAssetLinkCreateActivity,
  humanAssetLinkRemoveActivity,
  createHumanScoreWeightageActivity,
  createHumanCustomScoreActivity,
  UpdateHumanScoreWeightageActivity,
  deleteHumanScoreWeightageActivity,
};

const HumanActivityCategory = {
  label: "Human Activity Category",
  code: 9750,
  activities: humanActivities,
};

export default HumanActivityCategory;
