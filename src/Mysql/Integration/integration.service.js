import { roles } from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";
import {
  integrationCreateActivity,
  integrationDeleteActivity,
  integrationUpdateActivity,
} from "../Logs/ActivitiesType/integrationActivity";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import rolesSQLModel from "../Roles/roles.model";
import userRolesSQLModel from "../UserRoles/userRoles.model";
import userModel from "../Users/users.model";
import IntegrationModel from "./integration.model";

export const addUserIntegration = async (userIntegration, client) => {
  try {
    console.log("Integration To Update", userIntegration);
    const response = await IntegrationModel.create(userIntegration);

    if (client) {
      const fyndAdminRole = await rolesSQLModel.findOne({
        where: { company_id: response.company_id, slug: roles.Admin },
        raw: true,
        nest: true,
      });
      const user = await userModel.findOne({
        where: { company_id: response.company_id },
        include: [
          {
            model: userRolesSQLModel,
            where: {
              role_id: fyndAdminRole?.id,
            },
            // attributes:["id","role_id"],
            required: true,
          },
        ],
      });
      const eventLogs = await addEventLog(
        { ...client, user_id: user.id, company_id: user.company_id },
        integrationCreateActivity.status.integrationCreatedSuccessfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(response)),
          {},
          IntegrationModel.tableName,
          client.process
        )
      );
    }

    return response;
  } catch (err) {
    if (client) {
      const eventLogs = await addEventLog(
        { ...client, user_id: null, company_id: null },
        integrationCreateActivity.status.integrationCreatingFailed.code,
        err.message
      );
    }
    errorHandler(err);
    throw Error(err);
  }
};

export const updateUserIntegration = async (userIntegration, client) => {
  console.log("userIntegrationa", userIntegration);
  try {
    const oldData = await IntegrationModel.findOne({
      where: { id: userIntegration.id },
    });
    const response = await IntegrationModel.update(userIntegration, {
      where: { id: userIntegration.id },
    });

    if (client) {
      const newData = await IntegrationModel.findOne({
        where: { id: userIntegration.id },
      });
      const user = await userModel.findOne({
        where: { company_id: newData.company_id },
      });
      const eventLogs = await addEventLog(
        { ...client, user_id: user?.id, company_id: newData.company_id },
        integrationUpdateActivity.status.integrationUpdatedSuccessfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(newData)),
          JSON.parse(JSON.stringify(oldData)),
          IntegrationModel.tableName,
          client.process
        )
      );
    }

    return Promise.resolve(response);
  } catch (err) {
    if (client) {
      const eventLogs = await addEventLog(
        { ...client, user_id: null, comapny_id: null },
        integrationUpdateActivity.status.integrationUpdatingFailed.code,
        err.message
      );
    }
    return Promise.reject(err);
  }
};

export const getUserIntegrations = async (company_id) => {
  try {
    const response = await IntegrationModel.findAll({
      where: { company_id },
    });
    return Promise.resolve(response);
  } catch (err) {
    return Promise.reject(err);
  }
};
export const deleteUserIntegration = async (id, client) => {
  try {
    const oldData = await IntegrationModel.findOne({ where: { id } });
    const response = await IntegrationModel.destroy({ where: { id } });
    if (client) {
      const eventLogs = await addEventLog(
        { ...client, user_id: null },
        integrationDeleteActivity.status.integrationDeletedSuccessfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(oldData)),
          {},
          IntegrationModel.tableName,
        )
      );
    }
    return Promise.resolve(response);
  } catch (err) {
    if (client) {
      const eventLogs = await addEventLog(
        { ...client, user_id: null },
        integrationDeleteActivity.status.integrationDeletionFailed.code,
        err.message
      );
    }
    return Promise.reject(err);
  }
};
export const getIntegrationByFilter = async (filter) => {
  try {
    const response = await IntegrationModel.findOne({ where: filter });
    return Promise.resolve(response);
  } catch (err) {
    return Promise.reject(err);
  }
};
export const getIntegrationValues = async (company_id, integration_name) => {
  try {
    const response = await IntegrationModel.findOne({
      where: {
        company_id,
        integration_name,
      },
    });
    return Promise.resolve(response?.integration_values);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getIntegrationsByType = async (
  company_id,
  integration_category_type
) => {
  try {
    const response = await IntegrationModel.findAll({
      where: {
        company_id,
        integration_category_type,
      },
    });
    return Promise.resolve(response);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getUserIntegrationSupport = async (company_id) => {
  try {
    const response = await IntegrationModel.findAll({
      where: { company_id },
      attributes: ["integration_category_type", "id", "integration_name"],
    });
    return Promise.resolve(response);
  } catch (err) {
    errorHandler(err);
    return Promise.reject(err);
  }
};
export const getCompanyIntegrationIds = async (
  company_id,
  integrationCategoryType
) => {
  try {
    const condition = {};
    if (integrationCategoryType) {
      condition.integration_category_type = integrationCategoryType;
    }
    const response = await IntegrationModel.findAll({
      where: { company_id, ...condition },
      attributes: ["integration_category_type", "id", "integration_name"],
    }).then((res) => res.map((item) => item.id));
    return Promise.resolve(response);
  } catch (err) {
    errorHandler(err);
    return Promise.reject(err);
  }
};

const integrationService = {
  addUserIntegration,
  updateUserIntegration,
  getUserIntegrations,
  deleteUserIntegration,
  getIntegrationByFilter,
};
export default integrationService;
