import { CliProgressBar } from "../../../utils/cliProgressBar"
import { errorHandler } from "../../../utils/errorHandler"
import knowBe4GroupsModel from "./knowBe4Groups.model"

export const updateOrCreateKnewBe4Group = async (item, company_id) => {
  try {
    const startTime = new Date()

    await knowBe4GroupsModel.updateOne(
      { id: item.id, company_id },
      { ...item, company_id, updatedAt: new Date() },
      { new: true, upsert: true }
    )

    // CliProgressBar(
    //   `Automox device software saving  for company Id ${company_id} `,
    //   i,
    //   items.length,
    //   startTime
    // )

    return true
  } catch (err) {
    errorHandler(err)
    return false
  }
}
