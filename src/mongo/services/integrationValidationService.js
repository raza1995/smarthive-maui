import { StatusCodes } from "http-status-codes";
import { integrationsNames } from "../../utils/constants";
import { findMalwareBytesBaseUrlAndGetAccessToken } from "./MalwareBytes/malwareByteServices";
import { getMicrosoftAccessToken } from "../../api/microsoft";
import { findCrowdStrikeBaseUrlAndGetAccessToken } from "../../api/crowdstrike";
import { findSentinalOneBaseUrlAndVarifyApiToken } from "../../api/sentinelOneApi";
import { findAuvikBaseUrlAndGetAccessToken } from "../../api/auvik";
import { findValidBaseUrl } from "../../api/knowbe4";
import { findDruvaBaseUrlAndGetAccessToken } from "../../api/druva";

const malwareBytes = async (values) => {
  // params.append('Authorization', `Basic base64(mwb-cloud-${client_id}:${client_secret})`);
  const { client_id, client_secret } = values;
  const resp = await findMalwareBytesBaseUrlAndGetAccessToken(
    client_id,
    client_secret
  );
  if (resp.valid) {
    return {
      valid: true,
      status: resp.status,
      data: resp.data,
    };
  }
  return {
    status: StatusCodes.BAD_REQUEST,
    valid: false,
    message: "Invalid client id or client secret",
  };
};
const crowdStrike = async (values) => {
  const { client_id, client_secret } = values;

  const resp = await findCrowdStrikeBaseUrlAndGetAccessToken(
    client_id,
    client_secret
  );
  if (resp.valid) {
    return {
      valid: true,
      status: resp.status,
      data: resp.data,
    };
  }
  return {
    status: StatusCodes.BAD_REQUEST,
    valid: false,
    message: "Invalid client id or client secret",
  };
};

const validateSentinalOne = async (values) => {
  const { api_token } = values;

  const resp = await findSentinalOneBaseUrlAndVarifyApiToken(api_token);
  console.log(resp);
  if (resp.status === 200 || resp.status === 201) {
    return {
      valid: true,
      status: resp.status,
      data: resp.data,
    };
  }
  return {
    status: StatusCodes.BAD_REQUEST,
    valid: false,
    message: "Invalid api_token",
  };
};

const validateAuvik = async (values) => {
  const resp = await findAuvikBaseUrlAndGetAccessToken("/tenants", values);
  if (resp.valid) {
    return {
      valid: true,
      status: resp.status,
      data: resp.data,
    };
  }
  return {
    status: StatusCodes.BAD_REQUEST,
    valid: false,
    message: "Invalid username or password",
  };
};

const validateMicrosoft = async (values) => {
  const { tenant_id, client_id, client_secret } = values;

  const resp = await getMicrosoftAccessToken(
    tenant_id,
    client_id,
    client_secret
  )
    .then((result) => result)
    .catch((err) => err.response);
  console.log(resp.status);
  if (resp.status === 200 || resp.status === 201) {
    return {
      valid: true,
      status: resp.status,
      data: resp.data,
    };
  }
  return {
    status: StatusCodes.BAD_REQUEST,
    valid: false,
    message: "Invalid client id or secret",
  };
};

const validateKnowbe4 = async (values) => {
  console.log(values);
  const { apiKey } = values;

  const resp = await findValidBaseUrl(apiKey, values);

  if (resp.valid) {
    return {
      valid: true,
      status: resp.status,
      data: resp.data,
    };
  }
  return {
    status: StatusCodes.NOT_ACCEPTABLE,
    valid: false,
    message: "Invalid token",
  };

  // const resp = await getKnowBe4Users(apiKey)
  //   .then((result) => result)
  //   .catch((err) => err.response);
  // console.log(resp.status);
  // if (resp.status === 200 || resp.status === 201) {
  //   return {
  //     valid: true,
  //     status: resp.status,
  //     data: resp.data,
  //   };
  // }
  // return {
  //   status: StatusCodes.NOT_ACCEPTABLE,
  //   valid: false,
  //   message: "Invalid token",
  // };
};

const validateDruva = async (values) => {
  // params.append('Authorization', `Basic base64(mwb-cloud-${client_id}:${client_secret})`);
  const { client_id, client_secret } = values;
  const resp = await findDruvaBaseUrlAndGetAccessToken(
    client_id,
    client_secret
  );
  if (resp.valid) {
    return {
      valid: true,
      status: resp.status,
      data: resp.data,
    };
  }
  return {
    status: StatusCodes.BAD_REQUEST,
    valid: false,
    message: "Invalid client id or client secret",
  };
};


const validateIntegrationSecrets = async (
  integrationName,
  integrationValues
) => {
  switch (integrationName) {
    case integrationsNames.MALWAREBYTES:
      return malwareBytes(integrationValues);
    case integrationsNames.CROWDSTRIKE:
      return crowdStrike(integrationValues);
    case integrationsNames.AUTOMOX:
      return {
        valid: true,
        status: 200,
      };
    case integrationsNames.SENTINELONE:
      return validateSentinalOne(integrationValues);
    case integrationsNames.MICROSOFT:
      return validateMicrosoft(integrationValues);
    case integrationsNames.KNOWBE4:
      return validateKnowbe4(integrationValues);
    case integrationsNames.AUVIK:
      return validateAuvik(integrationValues);
    case integrationsNames.DRUVA:
      return validateDruva(integrationValues);
      // return {
      //   valid: true,
      //   status: 200,
      // };
    default:
      return {
        status: StatusCodes.NOT_ACCEPTABLE,
        valid: false,
        message: "Integration service not available",
      };
  }
};
export default validateIntegrationSecrets;
