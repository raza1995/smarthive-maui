import { logsSeverities } from "./Severities";

// Get downtime probability list
export const downtimeProbabilityListing = {
  label: "Get downtime probability listing",
  code: "9910",
  status: {
    downtimeProbabilityListingSuccessfully: {
      label: "Get downtime probability listing successfully",
      code: "9910200",
      status: "success",
      severity: null,
    },
    downtimeProbabilityListingFailed: {
      label: "Get downtime probability listing failed",
      code: "9910400",
      status: "failed",
      severity: logsSeverities.medium,
      errorReason: {},
    },
  },
};

// Update downtime probability
export const downtimeProbabilityUpdate = {
  label: "Update downtime probability",
  code: "9920",
  status: {
    downtimeProbabilityUpdateSuccessfully: {
      label: "Update downtime probability successfully",
      code: "9920200",
      status: "success",
      severity: logsSeverities.informational,
    },
    downtimeProbabilityUpdateFailed: {
      label: "Update downtime probability failed",
      code: "9920400",
      status: "failed",
      severity: logsSeverities.informational,
      errorReason: {},
    },
  },
};

const DowntimeProbabilityActivities = {
  label: "Downtime probability activities",
  code: 9900,
  activities: {
    downtimeProbabilityListing,
    downtimeProbabilityUpdate,
  },
};
export default DowntimeProbabilityActivities;
