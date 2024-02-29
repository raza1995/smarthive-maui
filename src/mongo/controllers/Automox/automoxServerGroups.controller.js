import automoxAPI from "../../../api/automox";
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service";
import { getAutomoxDeviceGroupsActivity } from "../../../Mysql/Logs/ActivitiesType/automoxActivities";
import { addEventLog } from "../../../Mysql/Logs/eventLogs/eventLogs.controller";
import { CliProgressBar } from "../../../utils/cliProgressBar";
import {  integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";
import automoxServerGroupModel from "../../models/Automox/automoxServerGroups.model";

const updateOrCreate = async (items, company_id) => {
  try {
    let i = 0;
    const startTime = new Date();
    for await (const item of items) {
      await automoxServerGroupModel.updateOne(
        { id: item.id, company_id },
        { ...item, name: item.name || "Default", company_id },
        { upsert: true }
      );
      CliProgressBar(
        `Automox server groups for company Id ${company_id} `,
        i,
        items.length,
        startTime
      );
      i++;
    }
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
const fetchAll = async (orgId, page, company_id) => {
  const url = `servergroups?o=${orgId}&page=${page}&limit=500`;
  return await new Promise(async (resolve, reject) => {
    await automoxAPI
      .get(url)
      .then(async (response) => {
        console.log("total data ", response?.data?.length || 0);
        if (response?.data?.length > 0) {
          if (await updateOrCreate(response.data, company_id)) {
            resolve(response.data);
          } else {
            reject("Error occured");
          }
        } else {
          resolve("No data");
        }
      })
      .catch((error) => {
        console.log("error.message", error.message);
        resolve(error.message);
      });
  });
};
export const createCompanyAutomoxGroup = async (company) => {
  const organization_id =
    company.integrations.integration_values?.organization_id;
  if (organization_id) {
    const oldData = await automoxServerGroupModel
      .find({ company_id: company.id })
      .sort({ updatedAt: -1 });
    const lastUpdatedAtDate = oldData?.[0]?.updatedAt;
    console.log("lastUpdatedAtDate", lastUpdatedAtDate);
    let page = 0;
    let info;
    do {
      info = await fetchAll(organization_id, page, company.id);

      ++page;
      console.log("Number of software", info?.length, "page", page);
    } while (info?.length === 500);
    if (oldData?.length > 0) {
      console.log("lastUpdatedAtDate", {
        company_id: company.id,
        updatedAt: { $lte: lastUpdatedAtDate },
      });
      const deleteAssets = await automoxServerGroupModel
        .deleteMany({
          company_id: company.id,
          updatedAt: { $lte: lastUpdatedAtDate },
        })
        .sort({ updatedAt: 1 });
      console.log("delete assets", deleteAssets.deletedCount);
    }
  }
  await addEventLog(
    {
      client_id: null,
      client_email: null,
      process: "get automox server groups",
      user_id: null,
      company_id:company.id,
      isSystemLog: true,
    },
    getAutomoxDeviceGroupsActivity.status.getAutomoxDeviceGroupsSuccessfully
      .code
  );
};
export const getAutomoxServerGroups = async (req, res) => {
  try {
    if (res) {
      res.send("Automox server groups data fetching start successfully");
    }
    const Companies = await getAllCompaniesHaveIntegration(
      integrationsNames.AUTOMOX
    );
    if (Companies) {
      for await (const company of Companies) {
        await createCompanyAutomoxGroup(company);
      }
    } else {
      await addEventLog(
        {
          client_id: null,
          client_email: null,
          process: "get automox server groups",
          user_id: null,
          isSystemLog: true,
        },
        getAutomoxDeviceGroupsActivity.status.getAutomoxDeviceGroupsFailed.code,
        null,
        "No company with automox integration is available"
      );
      if (res) {
        res.send("No company with automox integration is available");
      }
    }
  } catch (error) {
    await addEventLog(
      {
        client_id: null,
        client_email: null,
        process: "get automox server groups",
        user_id: null,
        isSystemLog: true,
      },
      getAutomoxDeviceGroupsActivity.status.getAutomoxDeviceGroupsFailed.code,
      null,
      error.message
    );
    errorHandler(error);
    if (res) {
      res.status(503).json(error);
    }
  }
};

export default { getAutomoxServerGroups };
