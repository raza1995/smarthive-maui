import { getKnowBe4Groups } from "../../../api/knowbe4"
import { getAllCompaniesHaveIntegration } from "../../../Mysql/Companies/company.service"
import { integrationsNames } from "../../../utils/constants"
import { errorHandler } from "../../../utils/errorHandler"
import getKnowBe4GroupsRriskScoreHistory from "../groupsRiskScoreHistory/knowBe4GroupsRriskScoreHistory.controller"
import knowBe4GroupsModel from "./knowBe4Groups.model"
import { updateOrCreateKnewBe4Group } from "./knowBe4Groups.service"

const fetchAll = async (apiKey, company_id, baseUrl) =>
  await getKnowBe4Groups(apiKey, baseUrl)
    .catch((error) => {
      console.log("error.message", error.message)
      return error.message
    })
    .then(async (response) => {
      //   console.log(response.data)
      if (response?.data?.length > 0) {
        for await (const item of response.data) {
          await updateOrCreateKnewBe4Group(item, company_id)
          await getKnowBe4GroupsRriskScoreHistory(company_id, item.id, apiKey, baseUrl)
        }
      } else {
        return response.data
      }
    })

export const getKnowb4GroupsOfCompany = async (company) => {
  const integration = company.integrations.integration_values
  const baseUrl = company.integrations.integrations_base_url.base_url;
  const oldData = await knowBe4GroupsModel
    .find({ company_id: company.id })
    .sort({ updatedAt: -1 })
  const lastUpdatedAtDate = oldData?.[0]?.updatedAt
  const info = await fetchAll(integration.apiKey, company.id, baseUrl)

  if (oldData?.length > 0) {
    const deleteAssets = await knowBe4GroupsModel
      .deleteMany({
        company_id: company.id,
        updatedAt: { $lte: lastUpdatedAtDate },
      })
      .sort({ updatedAt: 1 })
    console.log("delete groups", deleteAssets.deletedCount)
  }
}

const getKnowBe4GroupsController = async (req, res) => {
  try {
    const Companies = await getAllCompaniesHaveIntegration(
      integrationsNames.KNOWBE4
    )
    if (Companies.length > 0) {
      if (res) {
        res.send("knowBe4 groups data fetching started...")
      }
      for await (const company of Companies) {
        await getKnowb4GroupsOfCompany (company)
      }
      // await addEventLog(
      //   {
      //     client_id: null,
      //     client_email: null,
      //     process: "cron function to get automox device softwares",
      //     user_id: `company Id = ${customerAdmin.company_id}`,
      //   },
      //   getAutomoxDeviceSoftwareActivity.status
      //     .getAutomoxDeviceSoftwareSuccessfully.code
      // )
    } else {
      // await addEventLog(
      //   {
      //     client_id: null,
      //     client_email: null,
      //     process: "cron function to get automox device softwares",
      //     user_id: null,
      //   },
      //   getAutomoxDeviceSoftwareActivity.status.getAutomoxDeviceSoftwareFailed
      //     .code,
      //   null,
      //   "No company with automox integration is available"
      // )
      // eslint-disable-next-line no-lonely-if
      if (res) {
        res.send("No company with knowbe4 integration is available")
      }
    }
  } catch (error) {
    //   await addEventLog(
    //     {
    //       client_id: null,
    //       client_email: null,
    //       process: "cron function to get automox device softwares",
    //       user_id: null,
    //     },
    //     getAutomoxDeviceSoftwareActivity.status.getAutomoxDeviceSoftwareFailed
    //       .code,
    //     null,
    //     error.message
    //   )
    errorHandler(error)
    if (res) {
      res.status(503).json(error)
    }
  }
}

export default getKnowBe4GroupsController
