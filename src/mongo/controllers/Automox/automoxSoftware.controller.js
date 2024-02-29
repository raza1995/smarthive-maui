import automoxAPI, {automoxClientAPI} from "../../../api/automox";
import {
  getIntegrationValues,
} from "../../../Mysql/Integration/integration.service";
import { getAutomoxDeviceSoftwareActivity } from "../../../Mysql/Logs/ActivitiesType/automoxActivities";
import { addEventLog } from "../../../Mysql/Logs/eventLogs/eventLogs.controller";
import { getAllCustomerAdmins } from "../../../Mysql/Users/users.service";
import { CliProgressBar } from "../../../utils/cliProgressBar";
import { integrationsNames } from "../../../utils/constants";
import { errorHandler } from "../../../utils/errorHandler";
import automoxSoftwareModel from "../../models/Automox/automoxSoftware.model";

const updateOrCreate = async (items, company_id) => {
  try {
    let i = 0;
    const startTime = new Date();
    for await (const item of items) {
      await automoxSoftwareModel.updateOne(
        { id: item.id, company_id, server_id: item.server_id },
        { ...item, company_id, updatedAt: new Date() },
        { new: true, upsert: true }
      );
      CliProgressBar(
        `Automox device software saving  for company Id ${company_id} `,
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
const fetchAll = async (orgId, page, company_id, access_token = null) => {
  const url = `orgs/${orgId}/packages?o=${orgId}&page=${page}&limit=500`
  let baseUrl = automoxAPI;
  let headers = ""
  if(access_token){
    baseUrl = automoxClientAPI
    headers = {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    }  
  }

  return await baseUrl
    .get(url,headers)
    .catch((error) => {
      console.log("error.message", error.message);
      return error.message;
    })
    .then(async (response) => {
      if (response?.data?.length > 0) {
        if (await updateOrCreate(response.data, company_id)) {
          return response.data;
        }
        throw Error("Error occured");
      } else {
        return response.data;
      }
    });
};
export const getAutomoxDeviceSoftwareOfCompany = async (company_id) => {
  const automoxIntegration = await getIntegrationValues(
    company_id,
    integrationsNames.AUTOMOX
  );
  if (automoxIntegration?.organization_id) {
    const access_token = automoxIntegration?.access_token || null
    const oldData = await automoxSoftwareModel
      .find({ company_id })
      .sort({ updatedAt: -1 });
    const lastUpdatedAtDate = oldData?.[0]?.updatedAt;
    console.log("lastUpdatedAtDate", lastUpdatedAtDate);
    let page = 0;
    let info;
    do {
      info = await fetchAll(
        automoxIntegration.organization_id,
        page,
        company_id,
        access_token
      );

      ++page;
      console.log("Number of software", info?.length, "page", page);
    } while (info?.length === 500);
    if (oldData?.length > 0) {
      console.log("lastUpdatedAtDate", {
        company_id,
        updatedAt: { $lte: lastUpdatedAtDate },
      });
      const deleteAssets = await automoxSoftwareModel
        .deleteMany({
          company_id,
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
      process: "get automox device softwares",
      user_id: null,
      company_id,
      isSystemLog: true,
    },
    getAutomoxDeviceSoftwareActivity.status.getAutomoxDeviceSoftwareSuccessfully
      .code
  );
};
const getAutomoxDeviceSoftware = {
  async getSoftware(req, res) {
    try {
      if (res) {
        res.send("Automox devise data start successfully");
      }
      const customerAdmins = await getAllCustomerAdmins();
      if (customerAdmins) {
        for await (const customerAdmin of customerAdmins) {
          await getAutomoxDeviceSoftwareOfCompany(customerAdmin.company_id);
        }
      } else {
        await addEventLog(
          {
            client_id: null,
            client_email: null,
            process: "get automox device softwares",
            user_id: null,
            isSystemLog: true,
          },
          getAutomoxDeviceSoftwareActivity.status.getAutomoxDeviceSoftwareFailed
            .code,
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
          process: "get automox device softwares",
          user_id: null,
          isSystemLog: true,
        },
        getAutomoxDeviceSoftwareActivity.status.getAutomoxDeviceSoftwareFailed
          .code,
        null,
        error.message
      );
      errorHandler(error);
      if (res) {
        res.status(503).json(error);
      }
    }
  },
};

export default getAutomoxDeviceSoftware;
