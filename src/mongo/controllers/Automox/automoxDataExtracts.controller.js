import moment from "moment";
import { logger } from "../../../../logs/config";
import automoxAPI, {automoxClientAPI} from "../../../api/automox";
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service";
import { getAutomoxDeviceReportsActivity } from "../../../Mysql/Logs/ActivitiesType/automoxActivities";
import { addEventLog } from "../../../Mysql/Logs/eventLogs/eventLogs.controller";
import { CliProgressBar } from "../../../utils/cliProgressBar";
import { integrationsNames } from "../../../utils/constants";
import csvToJsonConvertor from "../../../utils/cvsTojsonConvertor";
import { errorHandler } from "../../../utils/errorHandler";
import automoxPatchingReportModel from "../../models/Automox/automoxDataExtacts.model";

const getReport = async (orgId, id, access_token = null) => {
  // const url = `data-extracts/${id}`;
  const url = `data-extracts?o=${orgId}&limit=10&page=0&sort=created_at:desc`;
  let headers = '';
  let baseUrl = automoxAPI;
  if(access_token){
    baseUrl = automoxClientAPI
    headers = {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    }     
  }
  const getReportResponse = async () => {
    const reportStatus = await baseUrl
      .get(url,headers)
      .then(async (response) => {
        const report = response.data.results.find((item) => item.id === id);
        console.log("is report complete", id, report.is_completed);
        if (report.is_completed) {
          return report;
        }
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(getReportResponse());
          }, 5000);
        });
      })
      .catch((error) => {
        console.log("error.message", error.message);
        return error.message;
      });
    return reportStatus;
  };
  return getReportResponse();
};

const request = async (orgId, access_token = null) => {
  const url = `data-extracts?o=${orgId}`;
  const data = {
    type: "patch-history",
    parameters: {
      start_time: moment().subtract(60, "d"),
      end_time: new Date(),
    },
  };
  let headers = "";

  let baseUrl = automoxAPI;
  if(access_token){
    baseUrl = automoxClientAPI
    headers = {
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    } 
  }

  return await baseUrl
    .post(url, data, headers)
    .then(async (response) => response.data)
    .catch((error) => {
      console.log("error.message", error);
      return error.message;
    });
};
const getReportData = async (reportId, orgId, access_token) => {
  const url = `data-extracts/${reportId}/download?o=${orgId}`;
  let baseUrl = automoxAPI;
  let headers = "";
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
      console.log("error.message", error);
      return error.message;
    })
    .then(async (response) => {
      const jsonData = csvToJsonConvertor(response.data);

      return jsonData;
    });
};

const updateOrCreate = async (items, company_id) => {
  try {
    let i = 0;
    const startTime = new Date();
    const oldData = await automoxPatchingReportModel
      .find({
        company_id,
      })
      .sort({ updatedAt: -1 });
    const lastUpdatedAtDate = oldData?.[0]?.updatedAt;
    for await (const item of items) {
      await automoxPatchingReportModel.create(
        // { company_id: company_id, device_id: item.device_id, package_id: item.package_id },
        { ...item, company_id }
        // { new: true, upsert: true }
      );
      CliProgressBar(
        `Automox device report data for company Id ${company_id} `,
        i,
        items.length,
        startTime
      );
      i++;
    }
    if (oldData?.length > 0) {
      const deleteAssets = await automoxPatchingReportModel.deleteMany({
        company_id,
        updatedAt: { $lte: lastUpdatedAtDate },
      });
      console.log("delete assets", deleteAssets.deletedCount);
    }
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};
export const getAutomoxDataExtractsOfCompany = async (company) => {
  const organization_id =
    company.integrations.integration_values?.organization_id;
  const access_token = company.integrations.integration_values?.access_token || null;
  if (organization_id) {
    const extractRes = await request(organization_id, access_token);
    if (extractRes.id) {
      const reportStatus = await getReport(organization_id, extractRes.id, access_token);
      if (reportStatus.id) {
        const reportData = await getReportData(
          reportStatus.id,
          organization_id,
          access_token
        );
        await updateOrCreate(reportData, company.id);
        console.log("total reportData", reportData.length);
        logger.info(`report Data successfully extracted for ${company.id}`);
      }
    }
  }
  await addEventLog(
    {
      client_id: null,
      client_email: null,
      process: "get automox device report",
      user_id: null,
      company_id: company.id,
      isSystemLog: true,
    },
    getAutomoxDeviceReportsActivity.status.getAutomoxDeviceReportsSuccessfully
      .code
  );
};
const getAutomoxDataExtracts = {
  async requestNewAutomoxDataExtracts(req, res) {
    try {
      if (res) {
        res.send("Automox devise data start successfully");
      }
      const pageUrl = null;
      const Companies = await getAllCompaniesHaveIntegration(
        integrationsNames.AUTOMOX
      );
      logger.info(
        `Total Companies with automox integration ${Companies.length}`
      );

      if (Companies.length > 0) {
        await (async () => {
          for await (const company of Companies) {
            await getAutomoxDataExtractsOfCompany(company);
          }
        })();

        return true;
      }
      await addEventLog(
        {
          client_id: null,
          client_email: null,
          process: "get automox device report",
          user_id: null,
          isSystemLog: true,
        },
        getAutomoxDeviceReportsActivity.status.getAutomoxDeviceReportsFailed
          .code,
        null,
        "No company with automox integration is available"
      );
      if (res) {
        res.send("No company with automox integration is available");
      }
    } catch (error) {
      await addEventLog(
        {
          client_id: null,
          client_email: null,
          process: "get automox device report",
          user_id: null,
          isSystemLog: true,
        },
        getAutomoxDeviceReportsActivity.status.getAutomoxDeviceReportsFailed
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

export default getAutomoxDataExtracts;
