import moment from "moment";
import microsoftDevicesModel from "../../../mongo/microsoft/devices/microsoftDevices.model";
import { updateOrCreateEndpointInformation } from "../assetEndpointInformation.service";

export const getAssetEndpointInfoFormMicrosoft = async (asset, source) => {
  const microsoftEndPoint = await microsoftDevicesModel.findOne({
    id: source.device_id,
    company_id: asset.company_id,
  });
  const data = {
    asset_id: asset.id,
    company_id: asset.company_id,
    integration_id: source.integration_id,
    serial_number: microsoftEndPoint?.serialNumber,
    display_name: microsoftEndPoint?.deviceName,
    location: null,
    os_family: microsoftEndPoint?.manufacturer,
    os_name: microsoftEndPoint?.operatingSystem,
    os_install_version: null,
    os_current_version: microsoftEndPoint?.osVersion,
    group: null,
    last_user: microsoftEndPoint?.userDisplayName,
    last_seen_at: null,
    server_group_id: null,
    last_scan_time: JSON.stringify(microsoftEndPoint?.lastSyncDateTime),
    status: null,
  };

  if (data.last_seen_at) {
    const currentDate = moment();
    const last_seen_at = moment(data.last_seen_at);
    const timeDiff = currentDate.diff(last_seen_at, "hours");
    if (timeDiff <= 3) {
      data.risk_score = 850;
    } else if (timeDiff <= 6) {
      data.risk_score = 750;
    } else {
      data.risk_score = 350;
    }
  }
  const resp = updateOrCreateEndpointInformation(data);
  return resp;
};
