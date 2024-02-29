import axios from "axios";
import base64 from "base-64";
import { StatusCodes } from "http-status-codes";
import { endPoints, integrationsNames, inventory } from "../utils/constants";
import { errorHandler } from "../utils/errorHandler";
import IntegrationBaseUrlsModel from "../Mysql/IntegrationBaseUrls/IntegrationBaseUrls.model";

require("dotenv").config();

// const Auvik = axios.create({
//   baseURL: endPoints,
//   headers: {
//     Accept: "application/vnd.api+json",
//   },
// });

export const AuvikGet = (url, credentials) =>
  new Promise((resolve, reject) => {
    const secrets = `${credentials?.username || process.env.AUVIK_USER_ID}:${
      credentials?.password || process.env.AUVIK_KEY
    }`;
    const token = base64.encode(secrets);
    console.log("API called AuvikGet");
    axios
      .get(url, {
        headers: {
          authorization: `Basic ${token}`,
        },
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        errorHandler(error);
        reject(error);
      });
  });

export const getAccessToken = async (url, credentials) =>
  new Promise((resolve, reject) => {
    const secrets = `${credentials?.username}:${credentials?.password}`;
    const token = base64.encode(secrets);
    console.log("API called");
    axios
      .get(url, {
        headers: {
          authorization: `Basic ${token}`,
        },
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        errorHandler(error);
        resolve(error);
      });
  });

export const findAuvikBaseUrlAndGetAccessToken = async (url_patch, values) => {
  let resp = {
    valid: false,
  };
  const baseUrls = await IntegrationBaseUrlsModel.findAll({
    where: {
      integration_name: integrationsNames.AUVIK,
    },
  });
  for await (const url of baseUrls) {
    const result = await getAccessToken(url.base_url + url_patch, values);
    if (result.status === 200 || result.status === 201) {
      const tenantId = result?.data?.data?.filter(
        (ten) => ten.id === values.tenant_id
      );
      if (tenantId.length > 0) {
        const url2 = `${url.base_url}/${inventory.DEVICE}info?page[first]=2&tenants=${values.tenant_id}`;
        const final = await AuvikGet(url2, values)
          .then(() => true)
          .catch((err) => {});
        if (final) {
          resp = {
            valid: true,
            status: result.status,
            data: { urlId: url.id },
            base_url: url.base_url,
          };
          break;
        }
      }
    }
  }
  return resp;
};

const auvikAPis = {
  getAccessToken,
};

export default auvikAPis;
