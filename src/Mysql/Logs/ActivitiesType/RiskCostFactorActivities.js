import { logsSeverities } from "./Severities";

// Get Assets by Tag
export const getAssetsbyTag = {
  label: "Get assets by tag",
  code: "9810",
  status: {
    getAssetsByTagSuccessfully: {
      label: "Get assets by tag successfully",
      code: "9810200",
      status: "success",
      severity: null,
    },
    getAssetsByTagFailed: {
      label: "Get assets by tag failed",
      code: "9810400",
      status: "failed",
      severity: logsSeverities.medium,
      errorReason: {},
    },
  },
};

// Create Risk Cost factor
export const createCostFactor = {
  label: "Create risk cost factor",
  code: "9820",
  status: {
    createCostFactorSuccessfully: {
      label: "Create cost factor successfully",
      code: "9820200",
      status: "success",
      severity: null,
    },
    createCostFactorFailed: {
      label: "Create cost factor failed",
      code: "9820400",
      status: "failed",
      severity: logsSeverities.medium,
      errorReason: {},
    },
  },
};

// Get Risk Cost factor list
export const getRiskCostFactorListing = {
  label: "Get risk cost factor listing",
  code: "9830",
  status: {
    getRiskCostListingSuccessfully: {
      label: "Get risk cost factor listing successfully",
      code: "9830200",
      status: "success",
      severity: logsSeverities.informational,
    },
    getRiskCostListingFailed: {
      label: "Get risk cost factor listing failed",
      code: "9830400",
      status: "failed",
      severity: logsSeverities.informational,
      errorReason: {},
    },
  },
};

// Delete Risk Cost factor
export const deletecostFactor = {
  label: "Delete risk cost factor",
  code: "9840",
  status: {
    deleteCostFactorSuccessfully: {
      label: "Cost factor deleted successfully",
      code: "9840200",
      status: "success",
      severity: logsSeverities.high,
    },
    deleteCostFactorFailed: {
      label: "Cost factor deleted failed",
      code: "9840400",
      status: "failed",
      severity: logsSeverities.high,
      errorReason: {},
    },
  },
};

// Update Risk Cost factor
export const UpdateRiskCostFactor = {
  label: "Update risk cost factor",
  code: "9850",
  status: {
    updateRiskCostFactorSuccessfully: {
      label: "Cost factor updated successfully",
      code: "9850200",
      status: "success",
      severity: logsSeverities.medium,
    },
    updateRiskCostFactorFailed: {
      label: "Cost factor updated failed",
      code: "9850400",
      status: "failed",
      severity: logsSeverities.medium,
      errorReason: {},
    },
  },
};

// Create Risk Cost Factor Attribute
export const createCostFactorAttribute = {
  label: "Create risk cost factor attribute",
  code: "9860",
  status: {
    createCostFactorAttributeSuccessfully: {
      label: "Create risk cost factor attribute successfully",
      code: "9860200",
      status: "success",
      severity: null,
    },
    createCostFactorAttributeFailed: {
      label: "Create risk cost factor attribute failed",
      code: "9860400",
      status: "failed",
      severity: logsSeverities.medium,
      errorReason: {},
    },
  },
};

// Get Risk Cost factor attribute list
export const getRiskCostFactorAttributeListing = {
  label: "Get risk cost factor attribute listing",
  code: "9870",
  status: {
    getRiskCostAttributeListingSuccessfully: {
      label: "Get risk cost attribute listing successfully",
      code: "9870200",
      status: "success",
      severity: logsSeverities.informational,
    },
    getRiskCostAttributeListingFailed: {
      label: "Get risk cost attribute listing failed",
      code: "9870400",
      status: "failed",
      severity: logsSeverities.informational,
      errorReason: {},
    },
  },
};

// Update Risk cost factor priority
export const updateCostFactorPriority = {
  label: "Update risk cost factor priority",
  code: "9880",
  status: {
    updateCostFactorPrioritySuccessfully: {
      label: "Risk cost factor priority updated successfully",
      code: "9880200",
      status: "success",
      severity: logsSeverities.medium,
    },
    updateCostFactorPriorityFailed: {
      label: "Risk cost factor priority updated failed",
      code: "9880400",
      status: "failed",
      severity: logsSeverities.medium,
      errorReason: {},
    },
  },
};

const CostFactorActivities = {
  label: "Risk cost activities",
  code: 9800,
  activities: {
    getAssetsbyTag,
    deletecostFactor,
    getRiskCostFactorListing,
    createCostFactor,
    UpdateRiskCostFactor,
    createCostFactorAttribute,
    getRiskCostFactorAttributeListing,
    updateCostFactorPriority,
  },
};
export default CostFactorActivities;
