import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { integrationsNames, knowBe4ApiBaseUrl } from "../utils/constants";
import IntegrationBaseUrlsModel from "../Mysql/IntegrationBaseUrls/IntegrationBaseUrls.model";

const knowBe4ApiInstance = axios.create({
  baseURL: knowBe4ApiBaseUrl,
});

export const getKnowBe4Users = async (token, baseUrl) => {
  const users = await axios.get(`${baseUrl}/users`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return users;
};
export const getKnowBe4UsersRriskScoreHistoryApi = async (token, user_id, baseUrl) => {
  const users = await axios.get(
    `${baseUrl}/users/${user_id}/risk_score_history`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return users;
};
export const getKnowBe4Groups = async (token, baseUrl) => {
  const users = await axios.get(`${baseUrl}/groups`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return users;
};
export const getKnowBe4GroupsRriskScoreHistoryApi = async (token, group_id, baseUrl) => {
  const users = await axios.get(
    `${baseUrl}/groups/${group_id}/risk_score_history`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return users;
};

export const findValidBaseUrl = async (token, values) => {
  let resp = {
    valid: false,
  };
  const baseUrls = await IntegrationBaseUrlsModel.findAll({
    where: {
      integration_name: integrationsNames.KNOWBE4,
    },
  });
  for await (const url of baseUrls) {
    if (url.base_url_slug === values.region) {
      const final = await getKnowBe4Users(token, url.base_url)
        .then((result) => true)
        .catch((err) => {});
      if (final) {
        resp = {
          valid: true,
          // status: result.status,
          status: StatusCodes.OK,
          data: { urlId: url.id },
        };
        break;
      }
    }
  }
  return resp;
};

export default knowBe4ApiInstance;
