import { errorHandler } from "../../../utils/errorHandler"
import knowBe4UsersModel from "./knowBe4Users.model"

export const updateOrCreateKnewBe4User = async (item, company_id) => {
  try {
    await knowBe4UsersModel.updateOne(
      { id: item.id, company_id },
      { ...item, company_id, updatedAt: new Date() },
      { new: true, upsert: true }
    )
    return true
  } catch (err) {
    errorHandler(err)
    return false
  }
}
