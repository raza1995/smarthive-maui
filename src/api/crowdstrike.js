import axios from "axios";
import qs from "qs";
import { crowdStrikeEndpoints, integrationsNames } from "../utils/constants";
import IntegrationBaseUrlsModel from "../Mysql/IntegrationBaseUrls/IntegrationBaseUrls.model";

require("dotenv").config();

const crowdStrikeBaseUrls = {
  "US-1": "api.crowdstrike.com",
  "US-2": "api.us-2.crowdstrike.com",
  "EU-1": "api.eu-1.crowdstrike.com",
  "US-GOV-1": "api.laggar.gcw.crowdstrike.com",
};

export const getAccessToken = async (
  client_id,
  client_secret,
  baseUrl
) => {
  const tokenURl = "/oauth2/token";
  const data = qs.stringify({
    client_id,
    client_secret,
  });
  const resp = await axios
    .post(`${baseUrl}${tokenURl}`, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((result) => result)
    .catch((err) => err.response);
  return resp;
};

export const findCrowdStrikeBaseUrlAndGetAccessToken = async (
  client_id,
  client_secret
) => {
  let resp = {
    valid: false,
  };
  const baseUrls = await IntegrationBaseUrlsModel.findAll({
    where: {
      integration_name: integrationsNames.CROWDSTRIKE,
    },
  });

  for await (const url of baseUrls) {
    const result = await getAccessToken(client_id, client_secret, url.base_url);
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

export const getCrowdStrikeDeviceIDsAPI = async (
  token,
  baseUrl = crowdStrikeBaseUrls["EU-1"]
) =>
  new Promise((resolve, reject) => {
    const url = `${baseUrl}/devices/queries/devices-scroll/v1`;
    if (token) {
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error.headers);
          reject(error.response.data);
        });
    }
  });
export const getCrowdStrikeDeviceById = async (
  token,
  deviceId,
  baseUrl = crowdStrikeBaseUrls["EU-1"]
) =>
  new Promise((resolve, reject) => {
    const url = `${baseUrl}/devices/entities/devices/v1?ids=${deviceId}`;
    if (token) {
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error.data);
          reject(error.data);
        });
    }
  });

const crowdStrikeAPis = {
  getAccessToken,
  getCrowdStrikeDeviceIDsAPI,
  getCrowdStrikeDeviceById,
};

export default crowdStrikeAPis;
