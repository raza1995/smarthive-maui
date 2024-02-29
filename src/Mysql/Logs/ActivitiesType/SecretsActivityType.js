// get endpoint assets list
export const createSecretsActivity = {
  label: "Create Secrets",
  code: "7504",
  status: {
    createSecretsSuccess: {
      label: "Create Secrets successfully",
      code: "7504200",
      status: "success",
      severity: "informational",
    },
    createSecretsFailed: {
      label: "Create Secrets failed",
      code: "7504400",
      status: "failed",
      severity: "High",
    },
  },
};

// get endpoint assets list
export const updateSecretsActivity = {
  label: "Update Secrets",
  code: "7507",
  status: {
    updateSecretsSuccess: {
      label: "Updated Secrets successfully",
      code: "7507200",
      status: "success",
      severity: "informational",
    },
    updateSecretsFailed: {
      label: "Updating Secrets failed",
      code: "7507400",
      status: "failed",
      severity: "High",
    },
  },
};

export const secretsSharedActivity = {
  label: "Secrets Shared",
  code: "7522",
  status: {
    secretsSharedSuccessfully: {
      label: "Secrets Shared successfully",
      code: "7522200",
      status: "success",
      severity: "informational",
    },
    secretsSharedFailed: {
      label: "Secrets Sharing failed",
      code: "7522400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const secretsInteractionActivity = {
  label: "Interact with secrets",
  code: "7525",
  status: {
    secretsInteractedSuccessfully: {
      label: "Interacted successfully",
      code: "7525200",
      status: "success",
      severity: "informational",
    },
    secretsInteractionFailed: {
      label: "Interaction failed",
      code: "7525400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const createPrivilegeAccessScoreWeightageActivity = {
  label: "Create PrivilegeAccess score management",
  code: "7561",
  status: {
    Successfully: {
      label: "Privilege Access score management created successfully",
      code: "7561200",
      status: "success",
      severity: "informational",
    },
    Failed: {
      label: "Privilege Access score management created failed",
      code: "7561400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const UpdatePrivilegeAccessScoreWeightageActivity = {
  label: "Update Human score management",
  code: "7562",
  status: {
    Successfully: {
      label: "Human score management update successfully",
      code: "7562200",
      status: "success",
      severity: "informational",
    },
    Failed: {
      label: "Human score management updating failed",
      code: "7562400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const deletePrivilegeAccessScoreWeightageActivity = {
  label: "Delete PrivilegeAccess score management",
  code: "7563",
  status: {
    Successfully: {
      label: "Privilege Access score management deleted successfully",
      code: "7563200",
      status: "success",
      severity: "informational",
    },
    Failed: {
      label: "Privilege Access score management deleted failed",
      code: "7563400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

export const createSecretsCustomScoreActivity = {
  label: "Secrets created custom score",
  code: "7564",
  status: {
    Successfully: {
      label: "Secrets custom score created successfully",
      code: "7564200",
      status: "success",
      severity: "informational",
    },
    Failed: {
      label: "Secrets custom score creation failed",
      code: "7564400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

const SecretsActivityCategory = {
  label: "Secrets activities",
  code: 7500,
  activities: {
    createSecretsActivity,
    updateSecretsActivity,
    secretsSharedActivity,
    secretsInteractionActivity,
    createPrivilegeAccessScoreWeightageActivity,
    UpdatePrivilegeAccessScoreWeightageActivity,
    deletePrivilegeAccessScoreWeightageActivity,
    createSecretsCustomScoreActivity,
  },
};

export default SecretsActivityCategory;
