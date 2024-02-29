import moment from "moment";
import malwareBytesEndpointAgentInfoModel from "../../../mongo/malwareBytes/EndpointAgentInfo/endpointAgentinfo.model";
import malwareBytesEndpointModel from "../../../mongo/malwareBytes/Endpoints/endpoints.model";
import { macOsModel, windowsOsModel } from "../../../mongo/models/os/osModals";
import { updateOrCreateEndpointInformation } from "../assetEndpointInformation.service";
import deviceModel from "../../../mongo/models/auvik/device";

export const getAssetEndpointInfoFromAuvik = async (asset, source) => {
  const auvikDevice = await deviceModel.findOne({
    id: source.device_id,
    company_id: asset.company_id,
  });

  const data = {
    asset_id: asset.id,
    company_id: asset.company_id,
    integration_id: source.integration_id,
    serial_number: auvikDevice?.attributes?.serialNumber,
    display_name: auvikDevice?.attributes?.deviceName,
    last_seen_at: auvikDevice?.attributes?.lastSeenTime,
    // description: auvikDevice?.attributes?.description,
    // location: `${malwareByteEndPoint?.agent?.source_location?.city}, ${malwareByteEndPoint?.agent?.source_location?.country}`,
    // os_family: malwareByteEndPoint?.agent?.os_info?.os_platform,
    // os_name: malwareByteEndPoint?.agent?.os_info?.os_release_name,
    // os_install_version: malwareByteEndPoint?.agent?.os_info?.os_version,
    // os_current_version: malwareByteEndPoint ? currentOsVersion : null,
    // group: malwareByteEndPoint?.machine?.group_name,
    // last_user: malwareByteEndPoint?.agent?.last_user,
    // server_group_id: malwareByteEndPoint?.machine?.root_group_id,
    // last_scan_time: auvikDevice?.attributes?.lastModified,
    // status: malwareByteEndPoint?.protection_status,
    // remediation_required_status:
    //   malwareByteEndPoint?.status?.remediation_required?.status,
    // remediation_required_infection_count:
    //   malwareByteEndPoint?.status?.remediation_required?.infection_count,
    // reboot_required_status:
    //   malwareByteEndPoint?.status?.reboot_required?.status,
    // reboot_required_reasons_count:
    //   malwareByteEndPoint?.status?.remediation_required?.infection_count,
    // suspicious_activity_status:
    //   malwareByteEndPoint?.status?.suspicious_activity?.status,
    // suspicious_activity_count:
    //   malwareByteEndPoint?.status?.suspicious_activity?.count,
    // isolation_status: malwareByteEndPoint?.status?.isolation?.status,
    // isolation_process_status: malwareByteEndPoint?.status?.isolation?.process,
    // isolation_network_status: malwareByteEndPoint?.status?.isolation?.network,
    // isolation_desktop_status: malwareByteEndPoint?.status?.isolation?.desktop,
    // scan_needed_status: malwareByteEndPoint?.status?.scan_needed?.status,
    // scan_needed_last_seen_at:
    //   malwareByteEndPoint?.status?.scan_needed?.last_scanned_at,
    // scan_needed_job_status: malwareByteEndPoint?.status?.scan_needed?.job_state,
    // account_id: malwareByteEndPoint?.machine?.account_id,
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
