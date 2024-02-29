import { errorHandler } from "../../../utils/errorHandler"
import microsoftDevicesModel from "./microsoftDevices.model"

export const updateOrCreateMicrosoftDevice = async (item, company_id) => {
  try {
    await microsoftDevicesModel.updateOne(
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
