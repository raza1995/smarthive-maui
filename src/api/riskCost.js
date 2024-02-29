import axios from "axios"

import { riskCostApiUrls, riskCostBaseUrl } from "../utils/constants"
import { errorHandler } from "../utils/errorHandler"

require("dotenv").config()

const riskCostApi = axios.create({
  baseURL: riskCostBaseUrl,
})

export const getRiskCostToleranceScoreApi = (item) =>
  riskCostApi
    .post(
      riskCostApiUrls.toleranceScore,
      {
        patching: item.patching,
        endpoint: item.endpoint,
        lifecycle: item.lifecycle,
        backup: item.backup,
      },
      // {
      //   headers: {
      //     authorization: `Bearer ${token}`,
      //   },
      // }
    )
    .then((res) => {
      console.log("getRiskCostToleranceScoreApi res ============ ", res?.data?.tolerance_score);
      return res?.data?.tolerance_score || "";
    })
    .catch((error) => {
      errorHandler(error)
      return false;
    })

    export const getRiskCostFactorFinancialLossApi = (payload) =>
    riskCostApi
      .post(
        riskCostApiUrls.financialLoss,
        payload,
        // {
        //   headers: {
        //     authorization: `Bearer ${token}`,
        //   },
        // }
      )
      .then((res) => {
        console.log("api res ======== ", res?.data)
        return res?.data[0];
      })
      .catch((error) => {
        errorHandler(error)
        return false;
      })
      

export default riskCostApi
