// import { updateOrCreatePatchingInformation } from "../assetPatchingInformation.service";
import deviceModel from "../../../mongo/models/auvik/device";
import deviceWarrantyModel from "../../../mongo/models/auvik/device_warranty";
import { updateOrCreateLifecycleInformation } from "../assetLifecycleInformation.service";
import deviceLifecycleModel from "../../../mongo/models/auvik/device_lifecycle";
import { assetType } from "../../../utils/constants";

export const saveAssetLifecycleInfoFromAuvik = async (asset, source) => {
  const auvikDevice = await deviceModel.findOne({
    id: source.device_id,
    company_id: asset.company_id,
  });

  let auvikDeviceWarranty = {};
  let auvikDeviceLifecycle = {};
  if (auvikDevice?.attributes?.deviceName) {
    auvikDeviceWarranty = await deviceWarrantyModel.findOne({
      company_id: asset.company_id,
      "attributes.deviceName": auvikDevice?.attributes?.deviceName,
    });
    auvikDeviceLifecycle = await deviceLifecycleModel.findOne({
      company_id: asset.company_id,
      "attributes.deviceName": auvikDevice?.attributes?.deviceName,
    });
  }

  const data = {
    asset_id: asset.id,
    company_id: asset.company_id,
    integration_id: source.integration_id,
    display_name: auvikDevice?.attributes?.deviceName,
    device_type: auvikDevice?.attributes?.deviceType,
    model: auvikDevice?.attributes?.makeModel,
    vendor: auvikDevice?.attributes?.vendorName,
    software_version: auvikDevice?.attributes?.softwareVersion,
    serial_number: auvikDevice?.attributes?.serialNumber,
    description: auvikDevice?.attributes?.description,
    firmware_version: auvikDevice?.attributes?.firmwareVersion,
    last_updated_at: auvikDevice?.attributes?.lastModified,
    last_seen: auvikDevice?.attributes?.lastSeenTime,
    online_status: auvikDevice?.attributes?.onlineStatus,
    warranty_coverage_status:
      auvikDeviceWarranty?.attributes?.warrantyCoverageStatus,
    warranty_expiration_date:
      auvikDeviceWarranty?.attributes?.warrantyExpirationDate,
    service_coverage_status:
      auvikDeviceWarranty?.attributes?.serviceCoverageStatus,
    service_attachment_status:
      auvikDeviceWarranty?.attributes?.serviceAttachmentStatus,
    contract_renewal_availability:
      auvikDeviceWarranty?.attributes?.contractRenewalAvailability,
    recommended_software_version:
      auvikDeviceWarranty?.attributes?.recommendedSoftwareVersion,
    sales_availability: auvikDeviceLifecycle?.attributes?.salesAvailability,
    software_maintenance_status:
      auvikDeviceLifecycle?.attributes?.softwareMaintenanceStatus,
    security_software_maintenance_status:
      auvikDeviceLifecycle?.attributes?.securitySoftwareMaintenanceStatus,
    last_support_status: auvikDeviceLifecycle?.attributes?.lastSupportStatus,
  };

  if (asset.asset_type === assetType.network) {
    if (
      ["Mikrotik", "Ubiquiti"].includes(auvikDevice?.attributes?.vendorName)
    ) {
      data.risk_score = 850;
    } else if (
      auvikDeviceWarranty?.attributes?.recommendedSoftwareVersion !==
        "Not Supported" ||
      auvikDeviceWarranty?.attributes?.recommendedSoftwareVersion !==
        "Unpublished"
    ) {
      const installVersion = auvikDevice?.attributes?.firmwareVersion;
      const currentVersion =
        auvikDeviceWarranty?.attributes?.recommendedSoftwareVersion;
      if (currentVersion) {
        if (installVersion === currentVersion) {
          data.risk_score = 850;
        } else if (
          installVersion?.split(".")[0] === currentVersion?.split(".")[0]
        ) {
          data.risk_score = 750;
        } else {
          data.risk_score = 710;
        }
      } else {
        data.risk_score = 350;
      }
    } else {
      data.risk_score = 350;
    }
  } else if (asset.asset_type === assetType.nonNetwork) {
    data.risk_score = 350;
  } else if (asset.asset_type === assetType.unknown) {
    data.risk_score = 350;
  }
  console.log(
    "data.risk_score lifecycle---------------------------",
    data.risk_score
  );
  const resp = updateOrCreateLifecycleInformation(data);
  return resp;
};
