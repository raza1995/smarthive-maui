import { getKnowBe4Users } from "../../../api/knowbe4";
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service";
import { saveHumansOfCompany } from "../../../Mysql/Human/human.controller";
import { getKnowb4UsersActivity } from "../../../Mysql/Logs/ActivitiesType/Knowb4Activities";
import { addEventLog } from "../../../Mysql/Logs/eventLogs/eventLogs.controller";

import { integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";
import getKnowBe4UsersRriskScoreHistory from "../usersRriskScoreHistory/knowBe4UsersRriskScoreHistory.controller";
import knowBe4UsersModel from "./knowBe4Users.model";
import { updateOrCreateKnewBe4User } from "./knowBe4Users.service";

const fetchAll = async (apiKey, company_id, baseUrl) => {
  const users = await getKnowBe4Users(apiKey, baseUrl)
    .catch((error) => {
      console.log("error.message", error);
      return error.message;
    })
    .then(async (response) => {
      // console.log(response.data)
      if (response?.data?.length > 0) {
        for await (const item of response.data) {
          await updateOrCreateKnewBe4User(item, company_id);
          await getKnowBe4UsersRriskScoreHistory(company_id, item.id, apiKey, baseUrl);
        }
      } else {
        return response.data;
      }
    });
  return users;
};

export const getKnowB4UsersOfCompany = async (company) => {
  try {
    const integration = company?.integrations?.integration_values;
    const baseUrl = company.integrations.integrations_base_url.base_url;
    const oldData = await knowBe4UsersModel
      .find({ company_id: company.id })
      .sort({ updatedAt: -1 });
    const lastUpdatedAtDate = oldData?.[0]?.updatedAt;
    await fetchAll(integration.apiKey, company.id, baseUrl);

    if (oldData?.length > 0) {
      const deleteAssets = await knowBe4UsersModel
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
        process: "get knowb4 users",
        user_id: null,
        company_id: company.id,
        isSystemLog: true,
      },
      getKnowb4UsersActivity.status.getKnowb4UsersSuccessfully.code
    );

    // Save to local db
    await saveHumansOfCompany(company);
  } catch (err) {
    errorHandler(err);
  }
};

const getKnowBe4UsersController = async (req, res) => {
  try {
    const Companies = await getAllCompaniesHaveIntegration(
      integrationsNames.KNOWBE4
    );
    if (Companies.length > 0) {
      if (res) {
        res.send("knowBe4 user data fetching started...");
      }
      for await (const company of Companies) {
        await getKnowB4UsersOfCompany(company);
      }
    } else {
      await addEventLog(
        {
          client_id: null,
          client_email: null,
          process: "get knowb4 users",
          user_id: null,
          isSystemLog: true,
        },
        getKnowb4UsersActivity.status.getKnowb4UsersFailed.code,
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
        process: "get knowb4 users",
        user_id: null,
        isSystemLog: true,
      },
      getKnowb4UsersActivity.status.getKnowb4UsersFailed.code,
      null,
      error.message
    );
    if (res) {
      res.status(503).json(error);
    }
  }
};

export default getKnowBe4UsersController;
