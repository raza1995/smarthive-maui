import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { runCronOfCompanyIntegration } from "../../cron/cron.controller";
import knowBe4UsersModel from "../../mongo/Knowbe4/users/knowBe4Users.model";
import malwareBytesEndpointModel from "../../mongo/malwareBytes/Endpoints/endpoints.model";
import microsoftUsersModel from "../../mongo/microsoft/users/microsoftUsers.model";
import automoxDeviceModel from "../../mongo/models/Automox/automoxDevice.model";
import deviceModel from "../../mongo/models/auvik/device";
import {
  automoxCredentials,
  integrationsIds,
  integrationsNames,
} from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";
import companyModel from "../Companies/company.model";
import companyService, {
  getCompanyHaveIntegration,
} from "../Companies/company.service";
import { updateCompanyRiskScore } from "../HumanRiskScores/humanRiskScore.service";
import integrationService, {
  addUserIntegration,
  updateUserIntegration,
  getUserIntegrations,
  deleteUserIntegration,
  getIntegrationByFilter,
} from "./integration.service";
import validateIntegrationSecrets from "../../mongo/services/integrationValidationService";
import { integrationCreateActivity } from "../Logs/ActivitiesType/integrationActivity";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";

const integrationController = {
  async getUserIntegrations(req, res) {
    try {
      const { user } = req;
      const userIntegrations = await getUserIntegrations(user.company_id);
      return res.json({ valid: true, data: userIntegrations });
    } catch (err) {
      return res
        .status(500)
        .json({ valid: false, error: "Internal Server Error", data: err });
    }
  },
  async saveUserIntegration(req, res) {
    try {
      const integration = req.body;
      //  { integration_name: configForm.slug_name,
      //   integration_category_type: configForm.integration_category_type,
      //   integration_values: values,}
      let message = "Integration added successfully";
      const { user } = req;
      const clientDetails = {
        id: user.id,
        email: user.email,
        company_id: user.company_id,
        ipAddress: req.socket.remoteAddress,
        process: "Integration added",
      };
      const integrationToSave = {
        ...integration,
        company_id: user.company_id,
      };

      const validationStatus = await validateIntegrationSecrets(
        integration.integration_name,
        integration.integration_values
      );
      // console.log("validationStatus ============= ", validationStatus)
      //   return

      if (!validationStatus.valid) {
        await addEventLog(
          {
            ...clientDetails,
            process: `Verify ${integration.integration_name} credentials`,
            user_id: null,
          },
          integrationCreateActivity.status.integrationCreatingFailed.code,
          null,
          validationStatus.message
        );
        return res.status(validationStatus.status).json({
          status: validationStatus.status,
          valid: false,
          error: "Bad request",
          message: validationStatus.message,
        });
      }

      if (validationStatus?.data?.urlId) {
        integrationToSave.integration_base_url_id = validationStatus.data.urlId;
      }

      if (integration.id) {
        // integrationToSave.id = integration.id
        clientDetails.process = "Update Integration";
        await updateUserIntegration(integrationToSave, clientDetails).then(
          async (resp) => {
            const companyWithIntegration = await getCompanyHaveIntegration(
              user.company_id,
              integration.integration_name,
              integration.integration_category_type
            );
            runCronOfCompanyIntegration(companyWithIntegration);
          }
        );
        message = "Integration updated successfully";
      } else {
        const savedIntegration = await addUserIntegration(
          integrationToSave,
          clientDetails
        )
          .then(async (ress) => {
            const companyWithIntegration = await getCompanyHaveIntegration(
              user.company_id,
              integration.integration_name,
              integration.integration_category_type
            );
            runCronOfCompanyIntegration(companyWithIntegration);
          })
          .catch(() => {
            throw Error("Integration service is not available");
          });
      }

      return res.json({ valid: true, message });
    } catch (err) {
      errorHandler(err);
      return res.status(500).json({
        valid: false,
        error: "Internal Server Error",
        message: err.message,
      });
    }
  },
  async saveUserIntegrationByAdmin(req, res) {
    try {
      const integration = req.body;
      console.log("integration", integration);
      let message = "Integration added successfully";
      const { user } = req;
      const { validation_method_name } = integration;

      if (validation_method_name) {
        const validationStatus = await validateIntegrationSecrets(
          integration.integration_name,
          integration.integration_values
        );
        if (!validationStatus.valid) {
          return res.status(validationStatus.status).json({
            status: StatusCodes.BAD_REQUEST,
            valid: false,
            error: "Bed request",
            message: validationStatus.message,
          });
        }
      }
      const clientDetails = {
        id: user.id,
        email: user.email,
        ipAddress: req.socket.remoteAddress,
        process: "Integration added",
      };
      if (integration.id) {
        await updateUserIntegration(integration, clientDetails);
        message = "Integration updated successfully";
      } else {
        await addUserIntegration(integration, clientDetails);
      }

      return res.json({ valid: true, message });
    } catch (err) {
      return res.json({
        valid: false,
        error: "Internal Server Error",
        data: err,
      });
    }
  },

  async deleteUserIntegration(req, res) {
    try {
      const { id } = req.params;
      const { user } = req;
      const integration = await getIntegrationByFilter({ id });
      const company = await companyModel.findOne({
        where: {
          id: user.company_id,
        },
        raw: true,
        nest: true,
      });
      switch (integration.integration_name) {
        case integrationsNames.AUVIK:
          deviceModel.deleteMany({ company_id: user.company_id });
          break;
        case integrationsNames.AUTOMOX:
          automoxDeviceModel.deleteMany({ company_id: user.company_id });
          break;
        case integrationsNames.MALWAREBYTES:
          malwareBytesEndpointModel.deleteMany({ company_id: user.company_id });
          break;
        case integrationsNames.KNOWBE4:
          knowBe4UsersModel.deleteMany({ company_id: user.company_id });
          await updateCompanyRiskScore(company);
          break;
        case integrationsNames.MICROSOFT:
          microsoftUsersModel.deleteMany({ company_id: user.company_id });
          await updateCompanyRiskScore(company);
          break;
        default:
      }

      const deleteResponse = await deleteUserIntegration(id, {
        id: user.id,
        email: user.email,
        ipAddress: req.socket.remoteAddress,
        process: "Delete Integration",
        company_id: user.company_id,
      });

      return res.json({
        valid: true,
        message: "Integration deleted successfully",
      });
    } catch (err) {
      errorHandler(err);
      return res.json({
        valid: false,
        error: "Internal Server Error",
        data: err,
      });
    }
  },

  async validateIntegrations(req, res) {
    try {
      const integration = req.body;
      const validation = await validateIntegrationSecrets(
        integrationsNames.MALWAREBYTES,
        integration
      );
      if (validation.valid) {
        console.log("validation", validation);
        return res.json({ valid: true });
      }
      return res.json({ valid: false, error: validation.message });
    } catch (err) {
      errorHandler(err);
      return res.json({ valid: false, error: err });
    }
  },
  async createAutomoxOrganization(req, res) {
    try {
      const loggedInUser = req.user;
      const message = "Integration added successfully";
      const { user } = req;
      const userAutomoxIntegration =
        await integrationService.getIntegrationByFilter({
          integration_name: integrationsNames.AUTOMOX,
          company_id: user.company_id,
        });
      if (userAutomoxIntegration) {
        res.status(200).json(userAutomoxIntegration);
      } else {
        const integrationToSave = {
          integration_name: integrationsNames.AUTOMOX,
          company_id: user.company_id,
        };
        const company = await companyService.getCompanyByFilter({
          id: user.company_id,
        });
        const data = JSON.stringify({
          name: company.company_name,
        });
        const config = {
          method: "post",
          url: `https://console.automox.com/api/accounts/${automoxCredentials.account_id}/zones`,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${automoxCredentials.api_key}`,
          },
          data,
        };

        await axios(config)
          .then(async (response) => {
            console.log(response.data);
            integrationToSave.integration_values = {
              access_key: response.data.access_key,
              organization_id: response.data.organization_id,
            };
            integrationToSave.integration_category_type = "Patching";
            const savedIntegration =
              await integrationService.addUserIntegration(integrationToSave);
            const companyWithIntegration = await getCompanyHaveIntegration(
              user.company_id,
              savedIntegration.integration_name,
              savedIntegration.integration_category_type
            );
            runCronOfCompanyIntegration(companyWithIntegration);
            res.status(200).json(integrationToSave);
          })
          .catch((error) => {
            res.status(503).json(error);

            errorHandler(error);
          });
      }
    } catch (err) {
      res.status(503).json(err.message);
    }
  },
  async getAutomoxOrganization(req, res) {
    try {
      const { orgId } = req.params;
      const config = {
        method: "get",
        url: "https://console.automox.com/api/orgs?page=0&limit=500",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${automoxCredentials.api_key}`,
        },
      };

      axios(config)
        .then((response) => {
          const organization = response.data.find((org) => org.id === orgId);

          res.status(200).json(organization);
        })
        .catch((error) => {
          errorHandler(error);
          res.status(503).json(error.message);
        });
    } catch (error) {
      errorHandler(error);
      res.status(503).json(error.message);
    }
  },
};
export default integrationController;
