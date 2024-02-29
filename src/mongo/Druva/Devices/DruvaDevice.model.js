import { model, Schema } from "mongoose";

const druvaDeviceSchema = Schema(
  {
    deviceName: String,
    deviceID: String,
    serialNumber: String,
    userID: String,
    profileID: String,
    deviceOS: String,
    deviceOSVersion: String,
    platformOS: String,
    uuid: String,
    clientVersion: String,
    upgradeState: String,
    addedOn: Date,
    lastUpgradedOn: Date,
    deviceStatus: String,
    totalBackupData: String,
    totalBackupDataInBytes: String,
    lastConnected: Date,
    deviceMarkedInactive: Boolean,
    company_id: String,
  },
  {
    timestamps: true,
  }
);

const druvaDeviceModel = model("druva_devices", druvaDeviceSchema);
export default druvaDeviceModel;
