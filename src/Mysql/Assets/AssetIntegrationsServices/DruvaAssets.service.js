import druvaDeviceModel from "../../../mongo/Druva/Devices/DruvaDevice.model";
import { getAssetType } from "../assets.service";

const { integrationsNames } = require("../../../utils/constants");

const getDruvaAssetsOfCompany = async (company_id, integration_id) => {
  const Device = await druvaDeviceModel.find({
    company_id,
  });
  const data = Device.map((item) => ({
      company_id: item?.company_id,
      asset_name: item?.deviceName,
      ipaddress: item?.external_ip,
      asset_sources: [
        {
          device_id: item?.deviceID,
          sources_type: integrationsNames.DRUVA,
          integration_id,
        },
      ],
      asset_sub_type: "workstation",
      asset_type: getAssetType("workstation"),
    }));
  return data;
};
export default getDruvaAssetsOfCompany;
