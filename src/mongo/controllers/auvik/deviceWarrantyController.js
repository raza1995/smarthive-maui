const { default: Auvik, AuvikGet } = require("../../../api/auvik");
require("dotenv").config();
const deviceWarrantyModel = require("../../models/auvik/device_warranty");
const { inventory, integrationsNames } = require("../../../utils/constants");
const {
  default: companyService,
  getAllCompaniesHaveIntegration,
} = require("../../../Mysql/Companies/company.service");
const { CliProgressBar } = require("../../../utils/cliProgressBar");
const {
  getAuvikDeviceWarrantyActivity,
} = require("../../../Mysql/Logs/ActivitiesType/auvikActivities");
const {
  addEventLog,
} = require("../../../Mysql/Logs/eventLogs/eventLogs.controller");
const { errorHandler } = require("../../../utils/errorHandler");
// ./controllers/product

const updateOrCreate = async (items, company_id) => {
  try {
    let i = 0;
    const startTime = new Date();
    console.group(["Auvik Device warranty"]);
    for await (const item of items) {
      await deviceWarrantyModel.updateOne(
        { id: item.id, company_id },
        { company_id, ...item },
        { upsert: true }
      );
      CliProgressBar(
        `Auvik Device warranty  data saved for company Id ${company_id}`,
        i,
        items.length,
        startTime
      );
      i++;
    }
    console.groupEnd();
    return true;
  } catch (err) {
    errorHandler(err);
    return false;
  }
};

const fetchAll = (page_id = null, auvikIntegration, company_id, baseUrl) => {
  let url = `${baseUrl}/${inventory.DEVICE}warranty?page[first]=1000&tenants=${auvikIntegration.tenant_id}`;
  if (page_id) {
    url = page_id;
  }
  return new Promise((resolve, reject) => {
    AuvikGet(url, auvikIntegration)
      .then(async (response) => {
        if (response?.data?.data?.length > 0) {
          console.log("total data", response.data?.data?.length);
          if (await updateOrCreate(response.data.data, company_id)) {
            resolve(response.data.links);
          } else {
            resolve("Error occured");
          }
        } else {
          resolve("No data");
        }
      })
      .catch((error) => {
        resolve(error);
      });
  });
};

const deviceWarrantyController = {
  async import(req, res) {
    try {
      const Companies = await getAllCompaniesHaveIntegration(
        integrationsNames.AUVIK
      );
      if (Companies) {
        if (res) {
          res.send("Device Warranty started successfully");
        }
        for await (const company of Companies) {
          let pageUrl = null;
          const auvikIntegration = company.integrations.integration_values;
          const baseUrl = company.integrations.integrations_base_url.base_url;
          if (auvikIntegration.tenant_id) {
            do {
              const info = await fetchAll(
                pageUrl,
                auvikIntegration,
                company.id,
                baseUrl
              );
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
              process: "get auvik devices warranty details",
              user_id: null,
              company_id: company.id,
              isSystemLog: true,
            },
            getAuvikDeviceWarrantyActivity.status
              .getAuvikDeviceLifeCycleSuccessfully.code
          );
        }
      } else {
        await addEventLog(
          {
            client_id: null,
            client_email: null,
            process: "get auvik devices warranty details",
            user_id: null,
            isSystemLog: true,
          },
          getAuvikDeviceWarrantyActivity.status.getAuvikDeviceLifeCycleFailed
            .code,
          null,
          "No company with auvik integration is available"
        );
      }
    } catch (error) {
      await addEventLog(
        {
          client_id: null,
          client_email: null,
          process: "get auvik devices warranty details",
          user_id: null,
          isSystemLog: true,
        },
        getAuvikDeviceWarrantyActivity.status.getAuvikDeviceLifeCycleFailed
          .code,
        null,
        error.message
      );
      errorHandler(error);
      if (res) {
        res.status(503).json(error);
      }
    }

    const countRecords = await deviceWarrantyModel.countDocuments({});
    console.log(`Total Records Saved ${countRecords}`);
  },
};

module.exports = deviceWarrantyController;
