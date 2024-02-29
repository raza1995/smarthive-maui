import moment from "moment";
import crowdStrikeDeviceModel from "../../../mongo/crowdStrike/Devices/crowdStrikeDevice.model";
import { macOsModel, windowsOsModel } from "../../../mongo/models/os/osModals";
import { updateOrCreateEndpointInformation } from "../assetEndpointInformation.service";

export const CrowdStrikeEndpointInfo = async (asset,source) => {
  const crowdStrikeEndPoint = await crowdStrikeDeviceModel.findOne({
    device_id: source.device_id,
    company_id:asset.company_id,
  });
  let currentOsVersion = "";
  if (crowdStrikeEndPoint?.platform_name === "MacOS") {
    const osVersions = await macOsModel.find({}).sort({ release: -1 });
    currentOsVersion = osVersions?.[0]?.cycle;
  } else if (crowdStrikeEndPoint?.platform_name === "Windows") {
    const osVersions = await windowsOsModel.find({}).sort({ release: -1 });
    currentOsVersion = osVersions?.[0]?.cycleShortHand;
  }

  const data = {
    asset_id: asset.id,
    company_id: crowdStrikeEndPoint.company_id,
    integration_id: source.integration_id,
    serial_number: crowdStrikeEndPoint?.serial_number,
    display_name:crowdStrikeEndPoint?.hostname,
    location: "",
    os_family: crowdStrikeEndPoint?.platform_name,
    os_name: crowdStrikeEndPoint?.os_version,
    os_install_version: crowdStrikeEndPoint?.os_build,
    os_current_version: crowdStrikeEndPoint ? currentOsVersion : null,
    group: crowdStrikeEndPoint?.groups?.[0],
    last_user: crowdStrikeEndPoint?.last_user,
    last_seen_at: crowdStrikeEndPoint?.last_seen,
    server_group_id: crowdStrikeEndPoint?.group_hash,
    last_scan_time: crowdStrikeEndPoint?.last_scanned_at,
    status: crowdStrikeEndPoint?.protection_status,
    remediation_required_status:
      crowdStrikeEndPoint?.status?.remediation_required?.status,
    remediation_required_infection_count:
      crowdStrikeEndPoint?.status?.remediation_required?.infection_count,
    reboot_required_status:
      crowdStrikeEndPoint?.status?.reboot_required?.status,
    reboot_required_reasons_count:
      crowdStrikeEndPoint?.status?.remediation_required?.infection_count,
    suspicious_activity_status:
      crowdStrikeEndPoint?.status?.suspicious_activity?.status,
    suspicious_activity_count:
      crowdStrikeEndPoint?.status?.suspicious_activity?.count,
    isolation_status: crowdStrikeEndPoint?.status?.isolation?.status,
    isolation_process_status: crowdStrikeEndPoint?.status?.isolation?.process,
    isolation_network_status: crowdStrikeEndPoint?.status?.isolation?.network,
    isolation_desktop_status: crowdStrikeEndPoint?.status?.isolation?.desktop,
    scan_needed_status: crowdStrikeEndPoint?.status?.scan_needed?.status,
    scan_needed_last_seen_at:
      crowdStrikeEndPoint?.status?.scan_needed?.last_scanned_at,
    scan_needed_job_status: crowdStrikeEndPoint?.status?.scan_needed?.job_state,
    account_id: crowdStrikeEndPoint?.machine?.account_id,
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
const resp = updateOrCreateEndpointInformation(data)
  return resp;
};