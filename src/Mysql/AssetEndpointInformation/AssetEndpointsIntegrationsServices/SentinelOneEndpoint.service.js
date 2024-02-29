import moment from "moment";
import { macOsModel, windowsOsModel } from "../../../mongo/models/os/osModals";
import sentinelOneAgentModel from "../../../mongo/sentinelone/Agents/agents.model";
import { updateOrCreateEndpointInformation } from "../assetEndpointInformation.service";

export const SentinelOneEndpointInfo = async (asset, source) => {
  const SentinelOneEndpoint = await sentinelOneAgentModel.findOne({
    uuid: source.device_id,
    company_id: asset.company_id,
  });
  let currentOsVersion = "";
  if (SentinelOneEndpoint?.osType === "MacOS") {
    const osVersions = await macOsModel.find({}).sort({ release: -1 });
    currentOsVersion = osVersions?.[0]?.cycle;
  } else if (SentinelOneEndpoint?.osType === "windows") {
    const osVersions = await windowsOsModel.find({}).sort({ release: -1 });
    currentOsVersion = osVersions?.[0]?.cycleShortHand;
  }

  const data = {
    asset_id: asset.id,
    company_id: SentinelOneEndpoint.company_id,
    integration_id: source.integration_id,
    serial_number: SentinelOneEndpoint?.serialNumber,
    display_name: SentinelOneEndpoint?.computerName,
    location: "",
    os_family: SentinelOneEndpoint?.osType,
    os_name: SentinelOneEndpoint?.osName,
    os_install_version: SentinelOneEndpoint?.osRevision,
    os_current_version: SentinelOneEndpoint ? currentOsVersion : null,
    group: SentinelOneEndpoint?.groupName,
    server_group_id: SentinelOneEndpoint?.groupId,
    last_user: SentinelOneEndpoint?.lastLoggedInUserName,
    last_seen_at: SentinelOneEndpoint?.lastActiveDate,
    last_scan_time: SentinelOneEndpoint?.scanFinishedAt,
    status: SentinelOneEndpoint?.protection_status,
    remediation_required_status:
      SentinelOneEndpoint?.status?.remediation_required?.status,
    remediation_required_infection_count:
      SentinelOneEndpoint?.status?.remediation_required?.infection_count,
    reboot_required_status:
      SentinelOneEndpoint?.status?.reboot_required?.status,
    reboot_required_reasons_count:
      SentinelOneEndpoint?.status?.remediation_required?.infection_count,
    suspicious_activity_status:
      SentinelOneEndpoint?.status?.suspicious_activity?.status,
    suspicious_activity_count:
      SentinelOneEndpoint?.status?.suspicious_activity?.count,
    isolation_status: SentinelOneEndpoint?.status?.isolation?.status,
    isolation_process_status: SentinelOneEndpoint?.status?.isolation?.process,
    isolation_network_status: SentinelOneEndpoint?.status?.isolation?.network,
    isolation_desktop_status: SentinelOneEndpoint?.status?.isolation?.desktop,
    scan_needed_status: SentinelOneEndpoint?.status?.scan_needed?.status,
    scan_needed_last_seen_at:
      SentinelOneEndpoint?.status?.scan_needed?.last_scanned_at,
    scan_needed_job_status: SentinelOneEndpoint?.status?.scan_needed?.job_state,
    account_id: SentinelOneEndpoint?.machine?.account_id,
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
