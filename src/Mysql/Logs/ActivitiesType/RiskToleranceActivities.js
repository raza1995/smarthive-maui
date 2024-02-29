import { logsSeverities } from "./Severities";

// Create Risk tolerance
export const createTolerance = {
  label: "Create risk tolerance",
  code: "9310",
  status: {
    createToleranceSuccessfully: {
      label: "Create risk tolerance successfully",
      code: "9310200",
      status: "success",
      severity: null,
    },
    createToleranceFailed: {
      label: "Create risk tolerance failed",
      code: "9310400",
      status: "failed",
      severity: logsSeverities.medium,
      errorReason: {},
    },
  },
};

// Get Risk tolerance list
export const getRiskToleranceListing = {
  label: "Get risk tolerance listing",
  code: "9320",
  status: {
    getRiskToleranceListingSuccessfully: {
      label: "Get risk tolerance listing successfully",
      code: "9320200",
      status: "success",
      severity: logsSeverities.informational,
    },
    getRiskToleranceListingFailed: {
      label: "Get risk tolerance listing failed",
      code: "9320400",
      status: "failed",
      severity: logsSeverities.informational,
      errorReason: {},
    },
  },
};

// Delete Risk tolerance
export const deleteRiskTolerance = {
  label: "Delete risk tolerance",
  code: "9330",
  status: {
    deleteRiskToleranceSuccessfully: {
      label: "tolerance deleted successfully",
      code: "9330200",
      status: "success",
      severity: logsSeverities.high,
    },
    deleteRiskToleranceFailed: {
      label: "tolerance deleted failed",
      code: "9330400",
      status: "failed",
      severity: logsSeverities.high,
      errorReason: {},
    },
  },
};

// Update Risk tolerance
export const updateTolerance = {
  label: "Update risk tolerance",
  code: "9340",
  status: {
    updateToleranceSuccessfully: {
      label: "tolerance updated successfully",
      code: "9340200",
      status: "success",
      severity: logsSeverities.medium,
    },
    updateToleranceFailed: {
      label: "tolerance updated failed",
      code: "9340400",
      status: "failed",
      severity: logsSeverities.medium,
      errorReason: {},
    },
  },
};

// Update Risk tolerance priority
export const updateTolerancePriority = {
  label: "Update risk tolerance priority",
  code: "9350",
  status: {
    updateTolerancePrioritySuccessfully: {
      label: "Risk tolerance priority updated successfully",
      code: "9350200",
      status: "success",
      severity: logsSeverities.medium,
    },
    updateTolerancePriorityFailed: {
      label: "Risk tolerance priority updated failed",
      code: "9350400",
      status: "failed",
      severity: logsSeverities.medium,
      errorReason: {},
    },
  },
};

const RiskToleranceActivities = {
  label: "Risk tolerance activities",
  code: 9300,
  activities: {
    createTolerance,
    getRiskToleranceListing,
    deleteRiskTolerance,
    updateTolerance,
    updateTolerancePriority,
  },
};
export default RiskToleranceActivities;
