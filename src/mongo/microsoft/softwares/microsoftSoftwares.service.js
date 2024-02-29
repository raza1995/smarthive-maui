import { errorHandler } from "../../../utils/errorHandler"
import microsoftDeviceSoftwaresModel from "./microsoftSoftwares.model"

export const updateOrCreateMicrosoftDeviceSoftware = async (item, company_id) => {
  try {
    await microsoftDeviceSoftwaresModel.updateOne(
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
