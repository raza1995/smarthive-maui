import axios from "axios";
import { integrationsNames, sentinelOneApiEndpoint } from "../utils/constants";
import IntegrationBaseUrlsModel from "../Mysql/IntegrationBaseUrls/IntegrationBaseUrls.model";

require("dotenv").config();

export const sentinelOneApiGet = (url, ApiToken) => {
  console.log(url, ApiToken);
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        headers: {
          Authorization: `ApiToken ${ApiToken}`,
        },
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const findSentinalOneBaseUrlAndVarifyApiToken = async (api_token) => {
  let resp = {
    valid: false,
  };
  const baseUrls = await IntegrationBaseUrlsModel.findAll({
    where: {
      integration_name: integrationsNames.SENTINELONE,
    },
  });

  for await (const url of baseUrls) {
    const result = await sentinelOneApiGet(`${url.base_url}/user`, api_token)
      .then((res) => res)
      .catch((err) => err.response);
    if (result.status === 200 || result.status === 201) {
      resp = {
        valid: true,
        status: result.status,
        data: { urlId: url.id },
      };
      break;
    }
  }
  return resp;
};
