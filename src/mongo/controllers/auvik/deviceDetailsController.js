const { default: Auvik, AuvikGet } = require("../../../api/auvik");
const {
  default: companyService,
  getAllCompaniesHaveIntegration,
} = require("../../../Mysql/Companies/company.service");
require("dotenv").config();
const deviceDetailModel = require("../../models/auvik/device_details");
const { getAllCustomerAdmins } = require("../../../Mysql/Users/users.service");
const { inventory, integrationsNames } = require("../../../utils/constants");
const {
  getIntegrationValues,
} = require("../../../Mysql/Integration/integration.service");
const { CliProgressBar } = require("../../../utils/cliProgressBar");
const {
  addEventLog,
} = require("../../../Mysql/Logs/eventLogs/eventLogs.controller");
const {
  getAuvikDeviceDetailsActivity,
} = require("../../../Mysql/Logs/ActivitiesType/auvikActivities");
const { errorHandler } = require("../../../utils/errorHandler");
// ./controllers/product
const updateOrCreate = async (items, company) => {
  try {
    let i = 0;
    const startTime = new Date();
    console.group();
    for await (const item of items) {
      await deviceDetailModel.updateOne(
        { id: item.id, company_id: company.id },
        { company_id: company.id, ...item },
        { upsert: true }
      );
      CliProgressBar(
        "Auvik Device detail data saving ",
        i,
        items.length,
        startTime
      );
      i++;
    }
    console.groupEnd();
    console.log("done...");
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

const fetchAll = (page_id = null, auvikIntegration, company, baseUrl) => {
  let url = `${baseUrl}/${inventory.DEVICE}detail?page[first]=1000&tenants=${auvikIntegration.tenant_id}`;
  if (page_id) {
    url = page_id;
  }
  return new Promise((resolve, reject) => {
    AuvikGet(url, auvikIntegration)
      .catch((error) => resolve(error.message))
      .then(async (response) => {
        if (response?.data?.data?.length > 0) {
          if (await updateOrCreate(response.data.data, company)) {
            resolve(response.data.links);
          } else {
            reject("Error occured");
          }
        } else {
          resolve("No data");
        }
      });
  });
};

const deviceDetailsController = {
  async import(req, res) {
    try {
      let pageUrl = null;
      if (res) {
        res.send("Device detail data start successfully");
      }
      // const customerAdmins = await getAllCustomerAdmins();
      const Companies = await getAllCompaniesHaveIntegration(
        integrationsNames.AUVIK
      );
      if (Companies.length > 0) {
        for await (const company of Companies) {
          const auvikIntegration = await getIntegrationValues(
            company.id,
            integrationsNames.AUVIK
          );
          const baseUrl = company.integrations.integrations_base_url.base_url;
          if (auvikIntegration?.tenant_id) {
            do {
              const info = await fetchAll(
                pageUrl,
                auvikIntegration,
                company,
                baseUrl
              );
              console.log("info", info);
              if (info?.next) {
                pageUrl = info.next;
              } else {
                pageUrl = null;
              }
            } while (pageUrl != null);
          }
          await addEventLog(
            {
              client_id: null,
              client_email: null,
              process: "get auvik devices details",
              user_id: null,
              company_id: company.id,
              isSystemLog: true,
            },
            getAuvikDeviceDetailsActivity.status
              .getAuvikDeviceDetailsSuccessfully.code
          );
        }
      } else {
        await addEventLog(
          {
            client_id: null,
            client_email: null,
            process: "get auvik devices details",
            user_id: null,
            isSystemLog: true,
          },
          getAuvikDeviceDetailsActivity.status.getAuvikDeviceDetailsFailed.code,
          null,
          "No company with auvik integration is available"
        );
        if (res) {
          res.send("No company with auvik integration is available");
        }
      }
    } catch (error) {
      await addEventLog(
        {
          client_id: null,
          client_email: null,
          process: "get auvik devices details",
          user_id: null,
          isSystemLog: true,
        },
        getAuvikDeviceDetailsActivity.status.getAuvikDeviceDetailsFailed.code,
        null,
        error.message
      );
      errorHandler(error);
    }

    const countRecords = await deviceDetailModel.countDocuments({});
    console.log(`Total Records Saved ${countRecords}`);
  },
};

module.exports = deviceDetailsController;
