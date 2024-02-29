import { getKnowBe4GroupsRriskScoreHistoryApi } from "../../../api/knowbe4"
import { errorHandler } from "../../../utils/errorHandler"
import { updateOrCreateKnewBe4GroupsRriskScoreHistory } from "./knowBe4GroupsRriskScoreHistory.service"

const fetchAll = async (apiKey, group_id, company_id, baseUrl) =>
  await getKnowBe4GroupsRriskScoreHistoryApi(apiKey, group_id, baseUrl)
    .catch((error) => {
      console.log("error.message", error.message)
      return error.message
    })
    .then(async (response) => {
      console.log(response.data)
      if (response?.data?.length > 0) {
        if (
          await updateOrCreateKnewBe4GroupsRriskScoreHistory(
            response.data,
            group_id,
            company_id
          )
        ) {
          return response.data
        }
        // else {
        //   throw Error("Error occured")
        // }
      } else {
        return response.data
      }
    })

const getKnowBe4GroupsRriskScoreHistory = async (
  company_id,
  group_id,
  apiKey,
  baseUrl
) => {
  try {
    if (company_id) {
      await fetchAll(apiKey, group_id, company_id, baseUrl)

      // await addEventLog(
      //   {
      //     client_id: null,
      //     client_email: null,
      //     process: "cron function to get automox device softwares",
      //     group_id: `company Id = ${customerAdmin.company_id}`,
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
      //     group_id: null,
      //   },
      //   getAutomoxDeviceSoftwareActivity.status.getAutomoxDeviceSoftwareFailed
      //     .code,
      //   null,
      //   "No company with automox integration is available"
      // )
      console.log("No company with knowbe4 integration is available")
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
  }
}

export default getKnowBe4GroupsRriskScoreHistory
