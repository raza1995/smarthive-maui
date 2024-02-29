import sentinelOneAgentModel from "../../../mongo/sentinelone/Agents/agents.model";
import { getAssetType } from "../assets.service";

const { integrationsNames } = require("../../../utils/constants");

const getSentinelOneAssetsOfCompany = async (company_id, integration_id) => {
  const Device = await sentinelOneAgentModel.find({
    company_id,
  });
  const data = Device.map((item) => ({
    company_id: item?.company_id,
    asset_name: item?.computerName,
    ipaddress: item?.lastIpToMgmt,
    asset_sources: [
      {
        device_id: item.uuid,
        sources_type: integrationsNames.SENTINELONE,
        integration_id,
      },
    ],
    asset_sub_type: item.machineType,
    asset_type: getAssetType(item.machineType),
  }));
  return data;
};
export default getSentinelOneAssetsOfCompany;
