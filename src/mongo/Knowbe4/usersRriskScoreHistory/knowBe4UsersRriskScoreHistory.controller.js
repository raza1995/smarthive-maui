import { getKnowBe4UsersRriskScoreHistoryApi } from "../../../api/knowbe4"
import { errorHandler } from "../../../utils/errorHandler"
import { updateOrCreateKnewBe4UsersRriskScoreHistory } from "./knowBe4UsersRriskScoreHistory.service"

const fetchAll = async (apiKey, user_id, company_id, baseUrl) =>
  await getKnowBe4UsersRriskScoreHistoryApi(apiKey, user_id, baseUrl)
    .catch((error) => {
      console.log("error.message", error.message)
      return error.message
    })
    .then(async (response) => {
      console.log(response.data)
      if (response?.data?.length > 0) {
        if (
          await updateOrCreateKnewBe4UsersRriskScoreHistory(
            response.data,
            user_id,
            company_id
          )
        ) {
          return response.data
        }
      } else {
        return response.data
      }
    })

const getKnowBe4UsersRriskScoreHistory = async (
  company_id,
  user_id,
  apiKey,
  baseUrl
) => {
  try {
    if (company_id) {
      await fetchAll(apiKey, user_id, company_id, baseUrl)

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

export default getKnowBe4UsersRriskScoreHistory
