import mongoose, { model, Schema } from "mongoose"

const microsoftDevicesSoftwaresSchema = Schema(
  {
    id: String,
    company_id: String,
    device_id: String,
    displayName: String,
    version: String,
    sizeInByte: Number,
    deviceCount: Number,
    publisher: String,
    platform: String,
  },
  {
    timestamps: true,
  }
)

const microsoftDeviceSoftwaresModel = model(
  "microsoft_device_softwares",
  microsoftDevicesSoftwaresSchema
)
export default microsoftDeviceSoftwaresModel
