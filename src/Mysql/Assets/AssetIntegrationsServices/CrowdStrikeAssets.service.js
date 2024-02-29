import crowdStrikeDeviceModel from "../../../mongo/crowdStrike/Devices/crowdStrikeDevice.model";
import { getAssetType } from "../assets.service";

const { integrationsNames } = require("../../../utils/constants");

const getCrowdStrikeAssetsOfCompany = async (company_id, integration_id) => {
  const Device = await crowdStrikeDeviceModel.find({
    company_id,
  });
  const data = Device.map((item) => ({
    company_id: item?.company_id,
    asset_name: item?.hostname,
    ipaddress: item?.external_ip,
    asset_sources: [
      {
        device_id: item?.device_id,
        sources_type: integrationsNames.CROWDSTRIKE,
        integration_id,
      },
    ],
    asset_sub_type: item?.product_type_desc,
    asset_type: getAssetType(item?.product_type_desc),
  }));
  return data;
};
export default getCrowdStrikeAssetsOfCompany;
