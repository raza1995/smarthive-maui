import {
  getMicrosoftAccessToken,
  getMicrosoftUsers,
} from "../../../api/microsoft";
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service";
import { saveHumansOfCompany } from "../../../Mysql/Human/human.controller";
import { updateCompanyRiskScore } from "../../../Mysql/HumanRiskScores/humanRiskScore.service";
import { getMicrosoftUsersActivity } from "../../../Mysql/Logs/ActivitiesType/MicrosoftActivities";
import { addEventLog } from "../../../Mysql/Logs/eventLogs/eventLogs.controller";
import { integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";
import microsoftUsersModel from "./microsoftUsers.model";
import { updateOrCreateMicrosoftUser } from "./microsoftUsers.service";

const fetchAll = async (tenant_id, client_id, client_secret, company_id) => {
  const info = await getMicrosoftAccessToken(
    tenant_id,
    client_id,
    client_secret
  );
  if (info?.data?.access_token) {
    const token = info.data?.access_token;
    const users = await getMicrosoftUsers(token)
      .catch((error) => error.message)
      .then(async (response) => {
        if (response?.data?.value?.length > 0) {
          for await (const item of response.data.value) {
            await updateOrCreateMicrosoftUser(item, company_id);
          }
        } else {
          return response.data;
        }
      });
    return users;
  }
};

export const getMicrosoftUsersOfCompany = async (company) => {
  const integration = company.integrations.integration_values;
  const oldData = await microsoftUsersModel
    .find({ company_id: company.id })
    .sort({ updatedAt: -1 });
  const lastUpdatedAtDate = oldData?.[0]?.updatedAt;
  await fetchAll(
    integration.tenant_id,
    integration.client_id,
    integration.client_secret,
    company.id
  );

  if (oldData?.length > 0) {
    const deleteAssets = await microsoftUsersModel
      .deleteMany({
        company_id: company.id,
        updatedAt: { $lte: lastUpdatedAtDate },
      })
      .sort({ updatedAt: 1 });
    console.log("delete assets", deleteAssets.deletedCount);
  }
  // Save to local db
  await saveHumansOfCompany(company);
  await addEventLog(
    {
      client_id: null,
      client_email: null,
      process: "get microsoft users",
      user_id: null,
      company_id: company.id,
      isSystemLog: true,
    },
    getMicrosoftUsersActivity.status.getMicrosoftUsersSuccessfully.code
  );
};

const getMicrosoftUsersController = async (req, res) => {
  try {
    const Companies = await getAllCompaniesHaveIntegration(
      integrationsNames.MICROSOFT
    );
    if (Companies.length > 0) {
      if (res) {
        res.send("microsoft user data fetching started...");
      }
      for await (const company of Companies) {
        await getMicrosoftUsersOfCompany(company);
        await updateCompanyRiskScore(company);
      }
    } else {
      await addEventLog(
        {
          client_id: null,
          client_email: null,
          process: "get microsoft users",
          user_id: null,
          isSystemLog: true,
        },
        getMicrosoftUsersActivity.status.getMicrosoftUsersFailed.code,
        null,
        "No company with microsoft integration is available"
      );
      if (res) {
        res.send("No company with knowbe4 integration is available");
      }
    }
  } catch (error) {
    await addEventLog(
      {
        client_id: null,
        client_email: null,
        process: "get microsoft users",
        user_id: null,
        isSystemLog: true,
      },
      getMicrosoftUsersActivity.status.getMicrosoftUsersFailed.code,
      null,
      error.message
    );
    errorHandler(error);
    if (res) {
      res.status(503).json(error);
    }
  }
};

export default getMicrosoftUsersController;
