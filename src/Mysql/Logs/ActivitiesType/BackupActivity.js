export const assetsBackupScoreUpdateActivity = {
  label: "Asset Backup score Update",
  code: "9022",
  status: {
    assetScoreUpdatedSuccessfully: {
      label: "Asset Backup score updated successfully",
      code: "9022200",
      status: "success",
      severity: null,
    },
    assetScoreUpdatingFailed: {
      label: "Asset Backup score updating failed",
      code: "9022400",
      status: "failed",
      severity: "High",
      errorReason: {},
    },
  },
};

const BackupActivityCategory = {
  label: "Backup activities",
  code: 9000,
  activities: {
    assetsBackupScoreUpdateActivity,
  },
};

export default BackupActivityCategory;
