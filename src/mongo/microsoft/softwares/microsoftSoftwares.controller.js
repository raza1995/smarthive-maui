import {
  getMicrosoftAccessToken,
  getMicrosoftDeviceSoftwares,
} from "../../../api/microsoft";
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service";
import { getMicrosoftDeviceSoftwaresActivity } from "../../../Mysql/Logs/ActivitiesType/MicrosoftActivities";
import { addEventLog } from "../../../Mysql/Logs/eventLogs/eventLogs.controller";
import { integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";
import microsoftDeviceSoftwaresModel from "./microsoftSoftwares.model";
import { updateOrCreateMicrosoftDeviceSoftware } from "./microsoftSoftwares.service";

const fetchAll = async (
  tenant_id,
  client_id,
  client_secret,
  device,
  company_id,
  nextLink
) => {
  const info = await getMicrosoftAccessToken(
    tenant_id,
    client_id,
    client_secret
  );
  if (info?.data?.access_token) {
    const token = info.data?.access_token;
    const softwares = await getMicrosoftDeviceSoftwares(
      token,
      device.id,
      nextLink
    )
      .catch((error) => {
        console.log("error.message", error);
        return error.message;
      })
      .then(async (response) => {
        if (response?.data?.value?.length > 0) {
          for await (const item of response.data.value) {
            item.device_id = device.id;
            await updateOrCreateMicrosoftDeviceSoftware(item, company_id);
          }
        }
        return response.data;
      });
    return softwares;
  }
};

export const getMicrosoftDeviceSoftwaresOfCompany = async (device, company) => {
  const integration = company.integrations.integration_values;
  const oldData = await microsoftDeviceSoftwaresModel
    .find({ company_id: company.id, device_id: device.id })
    .sort({ updatedAt: -1 })
    .limit(2);
  const lastUpdatedAtDate = oldData?.[0]?.updatedAt;
  let nextLink = null;
  do {
    const resp = await fetchAll(
      integration.tenant_id,
      integration.client_id,
      integration.client_secret,
      device,
      company.id,
      nextLink
    );

    const stringgg = JSON.stringify(resp);
    const result = JSON.parse(stringgg?.replace("@odata.nextLink", "nextLink"));
    if (result?.nextLink) {
      const arrayRes = result.nextLink.split("?");
      nextLink = arrayRes?.[1];
    } else {
      nextLink = null;
    }
  } while (nextLink != null);

  if (oldData?.length > 0) {
    const deleteAssets = await microsoftDeviceSoftwaresModel
      .deleteMany({
        company_id: company.id,
        updatedAt: { $lte: lastUpdatedAtDate },
      })
      .sort({ updatedAt: 1 });
    console.log("delete softwares", deleteAssets.deletedCount);
  }

  // Save to local db
};

const getMicrosoftDevicesSoftwareController = async (req, res) => {
  try {
    const Companies = await getAllCompaniesHaveIntegration(
      integrationsNames.MICROSOFT
    );
    if (Companies.length > 0) {
      if (res) {
        res.send("microsoft device softwares data fetching started...");
      }
      for await (const company of Companies) {
        await getMicrosoftDeviceSoftwaresOfCompany(company);
        await addEventLog(
          {
            client_id: null,
            client_email: null,
            process: "get microsoft devices",
            user_id: null,
            company_id: company.id,
            isSystemLog: true,
          },
          getMicrosoftDeviceSoftwaresActivity.status
            .getMicrosoftDeviceSoftwaresSuccessfully.code
        );
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
        getMicrosoftDeviceSoftwaresActivity.status
          .getMicrosoftDeviceSoftwaresFailed.code,
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
      getMicrosoftDeviceSoftwaresActivity.status
        .getMicrosoftDeviceSoftwaresFailed.code,
      null,
      error.message
    );
    errorHandler(error);
    if (res) {
      res.status(503).json(error);
    }
  }
};

export default getMicrosoftDevicesSoftwareController;
