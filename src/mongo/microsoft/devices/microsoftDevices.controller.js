import {
  getMicrosoftAccessToken,
  getMicrosoftDevices,
} from "../../../api/microsoft";
import { saveAssetsOfCompany } from "../../../Mysql/Assets/asset.controller";
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service";
import { getMicrosoftDevicesActivity } from "../../../Mysql/Logs/ActivitiesType/MicrosoftActivities";
import { addEventLog } from "../../../Mysql/Logs/eventLogs/eventLogs.controller";
import { integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";
import { getMicrosoftDeviceSoftwaresOfCompany } from "../softwares/microsoftSoftwares.controller";
import microsoftDevicesModel from "./microsoftDevices.model";
import { updateOrCreateMicrosoftDevice } from "./microsoftDevices.service";

const fetchAll = async (tenant_id, client_id, client_secret, company) => {
  const info = await getMicrosoftAccessToken(
    tenant_id,
    client_id,
    client_secret
  );
  if (info?.data?.access_token) {
    const token = info.data?.access_token;
    const users = await getMicrosoftDevices(token)
      .catch((error) => {
        console.log("error.message", error);
        return error.message;
      })
      .then(async (response) => {
        if (response?.data?.value?.length > 0) {
          for await (const item of response.data.value) {
            await updateOrCreateMicrosoftDevice(item, company.id);
            await getMicrosoftDeviceSoftwaresOfCompany(item, company);
          }
        } else {
          return response.data;
        }
      });
    return users;
  }
};

export const getMicrosoftDevicesOfCompany = async (company) => {
  const integration = company.integrations.integration_values;
  const oldData = await microsoftDevicesModel
    .find({ company_id: company.id })
    .sort({ updatedAt: -1 });
  const lastUpdatedAtDate = oldData?.[0]?.updatedAt;
  await fetchAll(
    integration.tenant_id,
    integration.client_id,
    integration.client_secret,
    company
  );

  if (oldData?.length > 0) {
    const deleteAssets = await microsoftDevicesModel
      .deleteMany({
        company_id: company.id,
        updatedAt: { $lte: lastUpdatedAtDate },
      })
      .sort({ updatedAt: 1 });
    console.log("delete assets", deleteAssets.deletedCount);
  }
  await addEventLog(
    {
      client_id: null,
      client_email: null,
      process: "get microsoft devices",
      user_id: null,
      company_id: company.id,
      isSystemLog: true,
    },
    getMicrosoftDevicesActivity.status.getMicrosoftDevicesSuccessfully.code
  );
  // Save to local db
  await saveAssetsOfCompany(company);
};

const getMicrosoftDevicesController = async (req, res) => {
  try {
    const Companies = await getAllCompaniesHaveIntegration(
      integrationsNames.MICROSOFT
    );
    if (Companies.length > 0) {
      if (res) {
        res.send("microsoft user data fetching started...");
      }
      for await (const company of Companies) {
        await getMicrosoftDevicesOfCompany(company);
      }
    } else {
      await addEventLog(
        {
          client_id: null,
          client_email: null,
          process: "get microsoft devices",
          user_id: null,
          isSystemLog: true,
        },
        getMicrosoftDevicesActivity.status.getMicrosoftDevicesFailed.code,
        null,
        "No company with microsoft integration is available"
      );
      // eslint-disable-next-line no-lonely-if
      if (res) {
        res.send("No company with microsoft integration is available");
      }
    }
  } catch (error) {
    await addEventLog(
      {
        client_id: null,
        client_email: null,
        process: "get microsoft device",
        user_id: null,
        isSystemLog: true,
      },
      getMicrosoftDevicesActivity.status.getMicrosoftDevicesFailed.code,
      null,
      error.message
    );
    errorHandler(error);
    if (res) {
      res.status(503).json(error);
    }
  }
};

export default getMicrosoftDevicesController;
