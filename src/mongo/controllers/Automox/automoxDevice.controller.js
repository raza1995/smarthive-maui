import automoxAPI, {automoxClientAPI} from "../../../api/automox"
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service"
import { getAutomoxDeviceActivity } from "../../../Mysql/Logs/ActivitiesType/automoxActivities"
import { addEventLog } from "../../../Mysql/Logs/eventLogs/eventLogs.controller"
import { CliProgressBar } from "../../../utils/cliProgressBar"
import { integrationsNames } from "../../../utils/constants"
import { errorHandler } from "../../../utils/errorHandler"
import automoxDeviceModel from "../../models/Automox/automoxDevice.model"


export const getAutomoxDevice = async (req, res) => {}
const updateOrCreate = async (items, company_id) => {
  try {
    const oldData = await automoxDeviceModel
      .find({
        company_id,
      })
      .sort({ updatedAt: -1 })
    const lastUpdatedAtDate = oldData?.[0]?.updatedAt
    console.log("lastUpdatedAtDate", lastUpdatedAtDate)
    let i = 0
    const startTime = new Date()
    for await (const item of items) {
      await automoxDeviceModel.updateOne(
        { id: item.id, company_id },
        { ...item, company_id },
        { upsert: true }
      )
      CliProgressBar(
        `Automox device saving  for company Id ${company_id} `,
        i,
        items.length,
        startTime
      )
      i++
    }
    if (oldData?.length > 0) {
      const deleteAssets = await automoxDeviceModel.deleteMany({
        company_id,
        updatedAt: { $lte: lastUpdatedAtDate },
      })
      console.log("delete assets", deleteAssets.deletedCount)
    }
    return true
  } catch (err) {
    errorHandler(err)
    return false
  }
}
const fetchAll = async (orgId, company_id, access_token = null) => {
  const url = `servers?o=${orgId}`
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
  return await new Promise(async (resolve, reject) => {
    await baseUrl
      .get(url,headers)
      .then(async (response) => {
        console.log("total data ", response?.data?.length || 0)
        if (response?.data?.length > 0) {
          if (await updateOrCreate(response.data, company_id)) {
            resolve(response.data)
          } else {
            reject("Error occured")
          }
        } else {
          resolve("No data")
        }
      })
      .catch((error) => {
        console.log("error.message---------------------", error)
        resolve(error.message)
      })
  })
}
export const fetchAllAutomoxDevicesOfCompany = async (company) => {
  const organization_id = company.integrations.integration_values?.organization_id
  const access_token = company.integrations.integration_values?.access_token || null
  if (organization_id) {
    const info = await fetchAll(organization_id, company.id, access_token)
  }
  await addEventLog(
    {
      client_id: null,
      client_email: null,
      process: "get automox device",
      user_id: null,
      company_id:company.id,
      isSystemLog: true,
    },
    getAutomoxDeviceActivity.status.getAutomoxDeviceSuccessfully.code
  )
}
const automoxDeviceController = {
  async getDevice(req, res) {
    try {
      if (res) {
        res.send("Automox devise data start successfully")
      }
      const Companies = await getAllCompaniesHaveIntegration(
        integrationsNames.AUTOMOX
      )
      if (Companies) {
        for await (const company of Companies) {
          await fetchAllAutomoxDevicesOfCompany(company)
        }
      } else {
        await addEventLog(
          {
            client_id: null,
            client_email: null,
            process: "get automox device",
            user_id: null,
            isSystemLog: true,
            
          },
          getAutomoxDeviceActivity.status.getAutomoxDeviceFailed.code,
          null,
          "No company with automox integration is available"
        )
        if (res) {
          res.send("No company with automox integration is available")
        }
      }
    } catch (error) {
      await addEventLog(
        {
          client_id: null,
          client_email: null,
          process: "get automox device",
          user_id: null,
          isSystemLog: true,
        },
        getAutomoxDeviceActivity.status.getAutomoxDeviceFailed.code,
        null,
        error.message
      )
      errorHandler(error)
      if (res) {
        res.status(503).json(error)
      }
    }
  },
}

export default automoxDeviceController
