import axios from "axios";
import base64 from "base-64";
import qs from "qs";
import {
  integrationsNames,
  microsoftAccessTokenBaseUrl,
  microsoftBaseUrl,
  microsoftBetaBaseUrl,
} from "../utils/constants";
import IntegrationBaseUrlsModel from "../Mysql/IntegrationBaseUrls/IntegrationBaseUrls.model";

require("dotenv").config();

const microsoftApiInstance = axios.create({
  baseURL: microsoftBaseUrl,
  headers: {
    Accept: "application/json",
  },
});
const microsoftBetaApiInstance = axios.create({
  baseURL: microsoftBetaBaseUrl,
  headers: {
    Accept: "application/json",
  },
});

const microsoftAccessTokenApiInstance = axios.create({
  baseURL: microsoftAccessTokenBaseUrl,
  headers: {},
});

export const getMicrosoftAccessToken = async (
  tenant_id,
  client_id,
  client_secret
) => {
  const tokenURl = `${tenant_id}/oauth2/v2.0/token`;
  const data = qs.stringify({
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });
  const resp = await microsoftAccessTokenApiInstance
    .post(tokenURl, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${base64.encode(
          `${client_id}:${client_secret}`
        )}`,
      },
    })
    .then((result) => result)
    .catch((err) => err.response);
  return resp;
};

export const getMicrosoftUsers = async (token) => {
  const users = await microsoftApiInstance.get("/users", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return users;
};

export const getMicrosoftDevices = async (token) => {
  const devices = await microsoftApiInstance.get(
    "/deviceManagement/managedDevices",
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return devices;
};

export const getMicrosoftDeviceSoftwares = async (
  token,
  device_id,
  nextLink
) => {
  let url = `/deviceManagement/managedDevices/${device_id}/detectedApps`;
  if (nextLink) {
    url = `/deviceManagement/managedDevices/${device_id}/detectedApps?${nextLink}`;
  }

  const softwares = await microsoftBetaApiInstance.get(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return softwares;
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
    const result = await getMicrosoftAccessToken(
      client_id,
      client_secret,
      url.base_url
    );
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

const microsoftGraphAPis = {
  getMicrosoftAccessToken,
  getMicrosoftUsers,
  getMicrosoftDevices,
  //   getCrowdStrikeDeviceById,
};

export default microsoftGraphAPis;
