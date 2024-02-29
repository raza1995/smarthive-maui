import { CliProgressBar } from "../../../utils/cliProgressBar"
import { errorHandler } from "../../../utils/errorHandler"
import usersRriskScoreHistoryModel from "./knowBe4UsersRriskScoreHistory.model"

export const updateOrCreateKnewBe4UsersRriskScoreHistory = async (
  items,
  user_id,
  company_id
) => {
  try {
    let i = 0
    const startTime = new Date()
    for await (const item of items) {
      const respo = await usersRriskScoreHistoryModel.updateOne(
        { user_id, company_id, date: item.date },
        { ...item, user_id, company_id, updatedAt: new Date() },
        { new: true, upsert: true }
      )
      // CliProgressBar(
      //   `Automox device software saving  for company Id ${company_id} `,
      //   i,
      //   items.length,
      //   startTime
      // )
      i++
    }
    return true
  } catch (err) {
    errorHandler(err)
    return false
  }
}
