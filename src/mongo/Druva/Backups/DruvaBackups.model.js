import { model, Schema } from "mongoose";

const druvaBackupsSchema = Schema(
  {
    deviceID: String,
    snapshotSize: String,
    backupStatus: String,
    startTime: Date,
    endTime: Date,
    filesBackedUp: String,
    bytesTransferred: String,
    filesMissed: String,
    systemSettingsBackedUp: Boolean,
    company_id: String,
  },
  {
    timestamps: true,
  }
);

const druvaBackupsModel = model("druva_backups", druvaBackupsSchema);
export default druvaBackupsModel;
