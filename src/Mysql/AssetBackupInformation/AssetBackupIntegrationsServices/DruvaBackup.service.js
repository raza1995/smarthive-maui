import {
  calculateBackupScore,
  updateOrCreateBackupInformation,
} from "../assetBackupInformation.service";
import druvaDeviceModel from "../../../mongo/Druva/Devices/DruvaDevice.model";
import druvaBackupsModel from "../../../mongo/Druva/Backups/DruvaBackups.model";

const saveAssetBackupInfoFromDruva = async (asset, source) => {
  const druvaDevice = await druvaDeviceModel.findOne({
    deviceID: source.device_id,
    company_id: asset.company_id,
  });
  const druvaDeviceBackupInfo = await druvaBackupsModel.findOne({
    deviceID: source.device_id,
    company_id: asset.company_id,
  });

  const data = {
    asset_id: asset.id,
    company_id: asset.company_id,
    integration_id: source.integration_id,
    display_name: druvaDevice.deviceName,
    device_id: druvaDevice.deviceID,
    serial_number: druvaDevice.serialNumber,
    os_family: druvaDevice.deviceOS,
    os_name: druvaDevice.platformOS,
    os_version: druvaDevice.deviceOSVersion,
    risk_score: calculateBackupScore(druvaDeviceBackupInfo.endTime),
    upgrade_state: druvaDevice.upgradeState,
    added_on: druvaDevice.addedOn,
    lastUpgradedOn: druvaDevice.lastUpgradedOn,
    device_status: druvaDevice.deviceStatus,
    totalBackupData: druvaDevice.totalBackupData,
    totalBackupDataInBytes: druvaDevice.totalBackupDataInBytes,
    lastConnected: druvaDevice.lastConnected,
    deviceMarkedInactive: druvaDevice.deviceMarkedInactive,
    snapshot_size: druvaDeviceBackupInfo.snapshotSize,
    backup_status: druvaDeviceBackupInfo.backupStatus,
    backup_start_time: druvaDeviceBackupInfo.startTime,
    backup_end_time: druvaDeviceBackupInfo.endTime,
    files_backed_up: druvaDeviceBackupInfo.filesBackedUp,
    bytes_transferred: druvaDeviceBackupInfo.bytesTransferred,
    files_missed: druvaDeviceBackupInfo.filesMissed,
    system_settings_backed_up: druvaDeviceBackupInfo.systemSettingsBackedUp,
    priority: 1,
  };
  console.log("data.risk_score---------------------------", data.risk_score);
  const resp = await updateOrCreateBackupInformation(data);
  return resp;
};

export default saveAssetBackupInfoFromDruva;
