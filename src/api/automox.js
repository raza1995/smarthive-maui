import axios from "axios"

require("dotenv").config()

const automoxAPI = axios.create({
  baseURL: "https://console.automox.com/api/",
  headers: {
    Accept: "application/json",
    Authorization: process.env.AUTOMOX_TOKEN,
  },
})

export const automoxClientAPI = axios.create({
  baseURL: "https://console.automox.com/api/",
  headers: {
    Accept: "application/json",
  },
})

automoxAPI.interceptors.request.use(
  (config) => {
    console.log("url", config.url)
    // Do something before request is sent
    return config
  },
  (error) =>
    // Do something with request error
    Promise.reject(error)
)
export const issueAutomoxDeviceCommand = async (
  device_id,
  organization_id,
  data
) => {
  const url = `servers/${device_id}/queues?o=${organization_id}`
  console.log(data)
  await automoxAPI
    .post(url, { ...data })
    .then(async (response) => {
      console.log(response.data)
    })
    .catch(async (error) => {
      console.log("error", error.message)
    })
}
export default automoxAPI
