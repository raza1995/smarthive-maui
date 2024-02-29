// Create Policy
export const createPolicyLog = {
  label: "Create Policy",
  code: "3305",
  status: {
    createPolicySuccessfully: {
      label: "Policy created successfully",
      code: "3305200",
      status: "success",
      severity: null,
    },
    createPolicyFailed: {
      label: "Policy created failed",
      code: "3305400",
      status: "failed",
      severity: "Medium",
      errorReason: {
        PolicyAlreadyExists: "Policy exists with the same name",
      },
    },
  },
};

// get Policy
export const getPolicyLog = {
  label: "Get Policies",
  code: "3308",
  status: {
    getPolicySuccessfully: {
      label: "Policies get successfully",
      code: "3308200",
      status: "success",
      severity: null,
    },
    getPolicyFailed: {
      label: "Policies get failed",
      code: "3308400",
      status: "failed",
      severity: "Medium",
      errorReason: {
        PolicyAlreadyExists: "",
      },
    },
  },
};

// edit Policy
export const editPolicyLog = {
  label: "Edit Policy",
  code: "3306",
  status: {
    editPolicySuccessfully: {
      label: "Policy edit successfully",
      code: "3306200",
      status: "success",
      severity: null,
    },
    editPolicyFailed: {
      label: "Policy edit failed",
      code: "3306400",
      status: "failed",
      severity: "Medium",
      errorReason: {
        PolicyAlreadyExists: "",
      },
    },
  },
};

// delete Policy
export const deletePolicyLog = {
  label: "Delete Policy",
  code: "3307",
  status: {
    deletePolicySuccessfully: {
      label: "Policy delete successfully",
      code: "3307200",
      status: "success",
      severity: null,
    },
    deletePolicyFailed: {
      label: "Policy delete failed",
      code: "3307400",
      status: "failed",
      severity: "High",
      errorReason: {
        PolicyAlreadyExists: "",
      },
    },
  },
};

const policyActivity = {
  createPolicyLog,
  deletePolicyLog,
  editPolicyLog,
  getPolicyLog,
};
export default policyActivity;
