export const assetsRealtimeScoreUpdateActivity = {
  label: "Asset Realtime score Update",
  code: "8022",
  status: {
    assetScoreUpdatedSuccessfully: {
      label: "Asset Realtime score updated successfully",
      code: "8022200",
      status: "success",
      severity: null,
    },
    assetScoreUpdatingFailed: {
      label: "Asset Realtime score updating failed",
      code: "8022400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

const RealtimeActivityCategory = {
  label: "Realtime activities",
  code: 8000,
  activities: {
    assetsRealtimeScoreUpdateActivity,
  },
};

export default RealtimeActivityCategory;
