import base64 from "base-64";
import axios from "axios";
import IntegrationBaseUrlsModel from "../Mysql/IntegrationBaseUrls/IntegrationBaseUrls.model";
import { druvaApiBaseUrl, integrationsNames } from "../utils/constants";

export const getDruvaAccessToken = async (
  client_id,
  client_secret,
  baseURL,
  scope = "read"
) => {
  const encodedParams = new URLSearchParams();
  encodedParams.set("scope", "read");
  encodedParams.set("grant_type", "client_credentials");
  // const resp = await axios.request(options)
  const resp = await axios
    .post(`${baseURL}/token`, encodedParams, {
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
        authorization: `Basic ${base64.encode(
          `${client_id}:${client_secret}`
        )}`,
      },
    })
    .then((result) => result)
    .catch((err) => err.response);
  return resp;
};

export const findDruvaBaseUrlAndGetAccessToken = async (
  client_id,
  client_secret
) => {
  let resp = {
    valid: false,
  };
  const baseUrls = await IntegrationBaseUrlsModel.findAll({
    where: {
      integration_name: integrationsNames.DRUVA,
    },
  });

  for await (const url of baseUrls) {
    const result = await getDruvaAccessToken(
      client_id,
      client_secret,
      url.base_url
    );
    console.log("result =========== ", result);
    if (result.status === 200 || result.status === 201) {
      resp = {
        valid: true,
        status: result.status,
        data: {
          urlId: url.id,
          baseURL: url.base_url,
          access_token: result.data.access_token,
        },
      };
      break;
    }
  }
  return resp;
};

export const getDruvaDeviceAPI = async (token, baseUrl, params) =>
  new Promise((resolve, reject) => {
    const url = `${baseUrl}/insync/endpoints/v1/devices`;
    if (token) {
      axios
        .get(
          url,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          { params }
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error.headers);
          reject(error.response.data);
        });
    }
  });
  export const getDruvaBackupsAPI = async (token, baseUrl, params) =>
  new Promise((resolve, reject) => {
    const url = `${baseUrl}/insync/endpoints/v1/backups?lastSuccessful=true`;
    if (token) {
      axios
        .get(
          url,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          { params }
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error.headers);
          reject(error.response.data);
        });
    }
  });