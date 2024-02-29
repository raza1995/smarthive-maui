import { errorHandler } from "../../../utils/errorHandler"
import microsoftUsersModel from "./microsoftUsers.model"

export const updateOrCreateMicrosoftUser = async (item, company_id) => {
  try {
    await microsoftUsersModel.updateOne(
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
