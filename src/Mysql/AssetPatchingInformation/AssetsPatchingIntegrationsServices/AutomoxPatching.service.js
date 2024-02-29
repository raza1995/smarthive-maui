import moment from "moment";
import { updateOrCreatePatchingInformation } from "../assetPatchingInformation.service";
import automoxDeviceModel from "../../../mongo/models/Automox/automoxDevice.model";
import automoxServerGroupModel from "../../../mongo/models/Automox/automoxServerGroups.model";
import automoxPatchingReportModel from "../../../mongo/models/Automox/automoxDataExtacts.model";

const saveAssetPatchingIfoFromAutomox = async (asset, source) => {
    const automoxDevice = await automoxDeviceModel.findOne({
      id: source.device_id,
      company_id: asset.company_id,
    });
    const policies = [];
    if (automoxDevice?.policy_status?.length > 0) {
      automoxDevice?.policy_status.forEach((policy, key) => {
        policies[key] = policy.policy_id;
      });
    }
    const companyServerGroups = await automoxServerGroupModel.find({
      company_id: asset.company_id,
    });
  
    const assetServerGroup = companyServerGroups.find(
      (element) => element.id === automoxDevice?.server_group_id
    );
  
    const data = {
      asset_id: asset.id,
      company_id: asset.company_id,
      integration_id: source.integration_id,
      display_name: automoxDevice.display_name,
      connected: automoxDevice.connected,
      compliant: automoxDevice.compliant,
      exception: automoxDevice.exception,
      is_compatible: automoxDevice.is_compatible,
      serial_number: automoxDevice.serial_number,
      os_family: automoxDevice.os_family,
      os_name: automoxDevice.os_name,
      os_version: automoxDevice.os_version,
      // status: automoxDevice.status,
      group: assetServerGroup?.name,
      cpu: automoxDevice?.detail?.CPU,
      ram: automoxDevice?.detail?.RAM,
      vender: automoxDevice?.detail?.VENDOR,
      volume: automoxDevice?.detail?.VOLUME,
      server_group_id: automoxDevice?.server_group_id,
      last_scan_time: automoxDevice?.last_refresh_time,
      last_logged_in_user: automoxDevice?.last_logged_in_user,
      last_seen: automoxDevice?.last_disconnect_time,
      next_patch_window: automoxDevice?.next_patch_time,
      device_require_reboot: automoxDevice?.needs_reboot,
      device_status: automoxDevice.status?.device_status,
      agent_status: automoxDevice.status?.agent_status,
      policy_status: automoxDevice.status?.policy_status,
      model: automoxDevice?.detail?.MODEL,
      number_of_patch_available: 0,
      patching_available_from: 0,
      all_patch_installed: true,
    };
    const patchAvailable = await automoxPatchingReportModel
      .find({
        company_id: asset.company_id,
        device_id: source.device_id,
        patch_action: "patch_available",
        $or: [
          { patch_severity: "critical" },
          { patch_severity: "high" },
          { patch_severity: "medium" },
        ],
      })
      .sort({ patch_available_timestamp: 1 });
    if (patchAvailable.length > 0) {
  
      data.number_of_patch_available = patchAvailable.length;
      data.patching_available_from =
        patchAvailable?.[0].patch_available_timestamp;
      data.patch_severity = patchAvailable?.[0].patch_severity;
      data.all_patch_installed = false;
    }
    if (data.all_patch_installed) {
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
    console.log("saveAssetPatchingIfoFromAutomox data.risk_score ======= ", data.risk_score)
    const resp = updateOrCreatePatchingInformation(data);
    return resp;
  };

  export default saveAssetPatchingIfoFromAutomox