import moment from "moment";
import { updateOrCreatePatchingInformation } from "../assetPatchingInformation.service";
import deviceModel from "../../../mongo/models/auvik/device";
import deviceWarrantyModel from "../../../mongo/models/auvik/device_warranty";

const saveAssetPatchingInfoFromAuvik = async (asset, source) => {
  const auvikDevice = await deviceModel.findOne({
    id: source.device_id,
    company_id: asset.company_id,
  });

  let auvikDeviceWarranty = {};
  if (auvikDevice?.attributes?.deviceName) {
    auvikDeviceWarranty = await deviceWarrantyModel.findOne({
      company_id: asset.company_id,
      "attributes.deviceName": auvikDevice?.attributes?.deviceName,
    });
  }
  console.log(
    "auvikDeviceWarranty warrantyCoverageStatus ============= ",
    auvikDeviceWarranty?.attributes?.warrantyCoverageStatus
  );
  console.log(
    "auvikDeviceWarranty warrantyExpirationDate ============= ",
    auvikDeviceWarranty?.attributes?.warrantyExpirationDate
  );

  const data = {
    asset_id: asset.id,
    company_id: asset.company_id,
    integration_id: source.integration_id,
    display_name: auvikDevice?.attributes?.deviceName,
    serial_number: auvikDevice?.attributes?.serialNumber,
    last_seen: auvikDevice?.attributes?.lastSeenTime,
    vendor: auvikDevice?.attributes?.vendorName,
    model: auvikDevice?.attributes?.makeModel,
    description: auvikDevice?.attributes?.description,
    software_version: auvikDevice?.attributes?.softwareVersion,
    warranty_coverage_status:
      auvikDeviceWarranty?.attributes?.warrantyCoverageStatus,
    warranty_expiration_date:
      auvikDeviceWarranty?.attributes?.warrantyExpirationDate,
    // last_scan_time: auvikDevice?.attributes?.lastModified,
    //   connected: malwareByteDevice.connected,
    //   compliant: malwareByteDevice.compliant,
    //   exception: malwareByteDevice.exception,
    //   is_compatible: malwareByteDevice.is_compatible,
    // os_family: malwareByteDevice?.agent?.os_info?.os_platform,
    // os_name: malwareByteDevice?.agent?.os_info?.os_release_name,
    // os_version: malwareByteDevice?.agent?.os_info?.os_version,
    // status: malwareByteDevice.status,
    //   group: assetServerGroup?.name,
    //   cpu: malwareByteDevice?.detail?.CPU,
    // ram: malwareByteEndPointAsset?.memory?.total_virtual,
    // volume: malwareByteEndPointAsset?.drives[0]?.total_size,
    //   server_group_id: malwareByteDevice?.server_group_id,
    // last_logged_in_user: malwareByteDevice?.agent?.last_user,
    // last_seen: agentInfo?.last_seen_at,
    //   next_patch_window: malwareByteDevice?.next_patch_time,
    // device_require_reboot: malwareByteDevice?.status?.reboot_required?.status,
    //   device_status: malwareByteDevice.status?.device_status,
    //   agent_status: malwareByteDevice.status?.agent_status,
    //   policy_status: malwareByteDevice.status?.policy_status,
    // number_of_patch_available: malwareByteEndPointAsset.updates_available.length || 0,
    // patching_available_from: 0,
    // all_patch_installed: true,
  };
  if (["Mikrotik"].includes(data?.vendor)) {
    data.risk_score = 720;
  } else if (data.all_patch_installed) {
    data.risk_score = 850;
  } else if (data.number_of_patch_available > 0) {
    const currentDate = moment();
    const patching_available_from = moment(data.patching_available_from);
    const timeDiff = currentDate.diff(patching_available_from, "days");
    console.log("timeDiff", timeDiff);
    if (timeDiff >= 3) {
      data.risk_score = 0;
    } else if (timeDiff >= 2) {
      data.risk_score = 585;
    } else if (timeDiff < 2) {
      data.risk_score = 675;
    }
  } else {
    data.risk_score = 0;
  }
  console.log("data.risk_score---------------------------", data.risk_score);
  const resp = updateOrCreatePatchingInformation(data);
  return resp;
};

export default saveAssetPatchingInfoFromAuvik;
