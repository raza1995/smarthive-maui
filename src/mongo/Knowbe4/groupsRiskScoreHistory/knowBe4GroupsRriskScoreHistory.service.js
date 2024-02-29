import { CliProgressBar } from "../../../utils/cliProgressBar"
import { errorHandler } from "../../../utils/errorHandler"
import groupsRriskScoreHistoryModel from "./knowBe4GroupsRriskScoreHistory.model"

export const updateOrCreateKnewBe4GroupsRriskScoreHistory = async (
  items,
  group_id,
  company_id
) => {
  try {
    let i = 0
    const startTime = new Date()
    for await (const item of items) {
      const respo = await groupsRriskScoreHistoryModel.updateOne(
        { group_id, company_id, date: item.date },
        { ...item, group_id, company_id, updatedAt: new Date() },
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
