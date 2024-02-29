import crowdStrikeAPis, {
  getCrowdStrikeDeviceById,
} from "../../../api/crowdstrike";
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service";
import { integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";
import crowdStrikeDeviceModel from "./crowdStrikeDevice.model";

const updateOrCreate = async (item, deviceId, company_id) => {
  try {
    await crowdStrikeDeviceModel.updateOne(
      { device_id: deviceId, company_id },
      { ...item, company_id },
      { upsert: true }
    );
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
export const getCrowdStrikeDeviceOfCompany = async (company) => {
  const crowdStrikeIntegration = company.integrations.integration_values;
  const baseUrl = company.integrations.integrations_base_url.base_url;
  if (crowdStrikeIntegration?.client_secret) {
    const client_secret = crowdStrikeIntegration?.client_secret;
    const client_id = crowdStrikeIntegration?.client_id;
    const info = await crowdStrikeAPis.getAccessToken(
      client_id,
      client_secret,
      baseUrl
    );
    if (info?.status === 201 || info?.status === 200) {
      const devices = await crowdStrikeAPis.getCrowdStrikeDeviceIDsAPI(
        info.data.access_token,
        baseUrl
      );
      const deviceIds = devices?.resources;
      const oldData = await crowdStrikeDeviceModel
        .find({
          company_id: company.id,
        })
        .sort({ updatedAt: -1 });
      const lastUpdatedAtDate = oldData?.[0]?.updatedAt;
      console.log("lastUpdatedAtDate", lastUpdatedAtDate, oldData.length);
      let i = 0;
      for await (const deviceId of deviceIds) {
        const deviceDetail = await getCrowdStrikeDeviceById(
          info.data.access_token,
          deviceId,
          baseUrl
        );
        await updateOrCreate(deviceDetail.resources[0], deviceId, company.id);
        i++;
        console.log((i * 100) / deviceIds.length, "done...");
      }
      if (oldData.length > 0) {
        const deleteAssets = await crowdStrikeDeviceModel.deleteMany({
          company_id: company.id,
          updatedAt: { $lte: lastUpdatedAtDate },
        });
        console.log("delete assets", deleteAssets.deletedCount);
      }
    } else {
      console.log("unauthorized");
    }
  }
};

export const getCrowdStrikeDevice = async (req, res) => {
  try {
    const Companies = await getAllCompaniesHaveIntegration(
      integrationsNames.CROWDSTRIKE
    );
    console.log("Companies", Companies.length);
    if (Companies.length > 0) {
      if (res) {
        res.send("Crowd strike data start successfully");
      }
      for await (const company of Companies) {
        getCrowdStrikeDeviceOfCompany(company);
      }
    }
  } catch (error) {
    errorHandler(error);
    if (res) {
      res.status(500).json(error);
    }
  }
};
