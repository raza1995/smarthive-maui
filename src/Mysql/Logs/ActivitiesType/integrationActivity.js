export const integrationDeleteActivity = {
  label: "Delete Integration",
  code: "3101",
  status: {
    integrationDeletedSuccessfully: {
      label: "Integration deleted successfully",
      code: "3101200",
      status: "success",
      severity: "informational",
    },
    integrationDeletionFailed: {
      label: "Integration deleting failed",
      code: "3101400",
      status: "failed",
      severity: "High",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

export const integrationCreateActivity = {
  label: "Create Integration",
  code: "3102",
  status: {
    integrationCreatedSuccessfully: {
      label: "Integration created successfully",
      code: "3102200",
      status: "success",
      severity: "high",
    },
    integrationCreatingFailed: {
      label: "Integration creating failed",
      code: "3102400",
      status: "failed",
      severity: "High",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};
export const integrationUpdateActivity = {
  label: "Update Integration",
  code: "3103",
  status: {
    integrationUpdatedSuccessfully: {
      label: "Integration updated successfully",
      code: "3103200",
      status: "success",
      severity: "high",
    },
    integrationUpdatingFailed: {
      label: "Integration updating failed",
      code: "3103400",
      status: "failed",
      severity: "High",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

export const integrationAddedByAdminActivity = {
  label: "Add Integration By Admin",
  code: "3104",
  status: {
    integrationUpdatedSuccessfully: {
      label: "Integration added successfully",
      code: "3104200",
      status: "success",
      severity: "high",
    },
    integrationUpdatingFailed: {
      label: "Integration added failed",
      code: "3104400",
      status: "failed",
      severity: "High",
      errorReason: {
        userEmailExist: "",
      },
    },
  },
};

const integrationActivity = {
  integrationCreateActivity,
  integrationDeleteActivity,
  integrationUpdateActivity,
  integrationAddedByAdminActivity,
};
export default integrationActivity
