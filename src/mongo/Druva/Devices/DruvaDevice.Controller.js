import { getDruvaAccessToken, getDruvaDeviceAPI } from "../../../api/druva";
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service";
import { integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";
import druvaDeviceModel from "./DruvaDevice.model";

const updateOrCreate = async (item, company_id) => {
  try {
    await druvaDeviceModel.updateOne(
      { deviceID: item.deviceID, company_id },
      { ...item, company_id },
      { upsert: true }
    );
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
export const getDruvaDeviceOfCompany = async (company) => {
  const Integration = company.integrations.integration_values;
  const baseUrl = company.integrations.integrations_base_url.base_url;
  if (Integration?.client_secret) {
    const client_secret = Integration?.client_secret;
    const client_id = Integration?.client_id;
    const info = await getDruvaAccessToken(client_id, client_secret, baseUrl);
    if (info?.status === 201 || info?.status === 200) {
      const oldData = await druvaDeviceModel
        .find({
          company_id: company.id,
        })
        .sort({ updatedAt: -1 });
      const lastUpdatedAtDate = oldData?.[0]?.updatedAt;
      console.log("lastUpdatedAtDate", lastUpdatedAtDate, oldData.length);
      let pageToken = "firstPage";
      do {
        let i = 0;
        const resp = await getDruvaDeviceAPI(
          info.data.access_token,
          baseUrl,
          pageToken === "firstPage" ? {} : { pageToken }
        );
        const devices = resp?.devices;

        for await (const device of devices) {
          await updateOrCreate(device, company.id);
          i++;
          console.log((i * 100) / devices.length, "done...");
        }
        console.log("total_count", resp?.totalSize);
        if (resp?.nextPageToken) {
          pageToken = resp?.nextPageToken;
        } else {
          pageToken = null;
        }
      } while (pageToken != null);

      if (oldData.length > 0) {
        const deleteAssets = await druvaDeviceModel.deleteMany({
          company_id: company.id,
          updatedAt: { $lte: lastUpdatedAtDate },
        });
        console.log("delete druva device from mongoDB", deleteAssets.deletedCount);
      }
    } else {
      console.log("unauthorized");
    }
  }
};

export const getDruvaDeviceSchemaDevice = async (req, res) => {
  try {
    const Companies = await getAllCompaniesHaveIntegration(
      integrationsNames.DRUVA
    );
    console.log("Companies", Companies.length);
    if (Companies.length > 0) {
      if (res) {
        res.send("Crowd strike data start successfully");
      }
      for await (const company of Companies) {
        getDruvaDeviceOfCompany(company);
      }
    }
  } catch (error) {
    errorHandler(error);
    if (res) {
      res.status(500).json(error);
    }
  }
};
