import HttpStatus, { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import {
  getAllCompaniesHaveIntegration,
} from "../Companies/company.service";
import patchingPoliciesSQLModel from "./patchingPolicy.model";
import { integrationsNames } from "../../utils/constants";
import { findIntegration } from "../Assets/assets.service";
import {
  convertToBinary,
  convertToDec,
  deletePolicyWithID,
  getPolicyData,
  SaveAutomoxPoliciesForCompany,
  updateOrCreateSinglePolicy,
} from "./patching.service";
import { activitiesData } from "../Logs/logsConstant";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import { getPolicyLog } from "../Logs/ActivitiesType/policyActivityType";
import PolicyGroupsSQLModel from "../PolicyGroups/PolicyGroups.model";
import AssetPatchingInformationModel from "../AssetPatchingInformation/assetPatchingInformation.model";

import { errorHandler } from "../../utils/errorHandler";

export const savePoliciesToMySql = async (req, res) => {
  const Companies = await getAllCompaniesHaveIntegration(
    integrationsNames.AUTOMOX
  );
  console.log("Companies", Companies);
  if (Companies) {
    if (res) {
      res.send("Automox policy data start successfully");
    }
    for await (const company of Companies) {
      await SaveAutomoxPoliciesForCompany(company);
    }
  }
};

// Create a New Policy
export const createPolicy = async (req, res) => {
  try {
    const { user } = req;
    const integration = await findIntegration(user);
    const { body } = req;

    const findOldPolicyCount = await patchingPoliciesSQLModel.count({
      where: {
        company_id: user.company_id,
        name: body.name,
      },
    });
    if (findOldPolicyCount > 0) {
      res.status(400).json({
        error: true,
        message: "Policy name already exists. Please use different name.",
      });
    }

    if (body?.configuration.device_filters) {
      body?.configuration.device_filters?.map((el) => {
        delete el?.oldVal;
        el.value = el.value?.map((tag) => (tag?.value ? tag?.value : tag));
        return el;
      });
    }
    const payload = {
      name: body.name,
      policy_type_name: "patch",
      configuration: {
        auto_patch: body.configuration.auto_patch === "active",
        patch_rule: body.configuration.patch_rule === "all" ? "all" : "filter",
        auto_reboot: body.configuration.auto_reboot || false,
        notify_user: body.configuration.notify_user === "active",
        device_filters_enabled: body.configuration.device_filters_enabled,
        missed_patch_window: body.configuration.missed_patch_window,
        notify_reboot_user: body.configuration.notify_reboot_user,
        pending_reboot_deferral_enabled:
          body?.configuration?.pending_reboot_deferral_enabled,
        notify_user_auto_deferral_enabled:
          body?.configuration?.notify_user_auto_deferral_enabled,
        notify_deferred_reboot_user:
          body.configuration.notify_deferred_reboot_user,
        custom_notification_patch_message:
          body.configuration.custom_notification_patch_message,
        custom_notification_patch_message_mac:
          body.configuration.custom_notification_patch_message_mac,
        custom_notification_reboot_message:
          body.configuration.custom_notification_reboot_message,
        custom_notification_reboot_message_mac:
          body.configuration.custom_notification_reboot_message_mac,
        custom_pending_reboot_notification_message:
          body.configuration.custom_pending_reboot_notification_message,
        custom_pending_reboot_notification_message_mac:
          body.configuration.custom_pending_reboot_notification_message_mac,
        custom_notification_max_delays:
          body.configuration.custom_notification_max_delays,
        custom_notification_deferment_periods:
          body.configuration.custom_notification_deferment_periods,
        custom_pending_reboot_notification_deferment_periods:
          body.configuration
            .custom_pending_reboot_notification_deferment_periods,
        custom_pending_reboot_notification_max_delays:
          body.configuration.custom_pending_reboot_notification_max_delays,
        notify_user_message_timeout:
          body.configuration.notify_user_message_timeout,
        notify_deferred_reboot_user_message_timeout:
          body.configuration.notify_deferred_reboot_user_message_timeout,
        notify_deferred_reboot_user_auto_deferral_enabled:
          body.configuration.notify_deferred_reboot_user_auto_deferral_enabled,
        filters: body?.configuration?.filters,
        timezone: body?.configuration?.timezone,
        patch_ids: body?.configuration?.patch_ids,
        utc_time: body?.configuration?.utc_time,
      },
      schedule_days: convertToDec(body.schedule_days),
      schedule_time: body.schedule_time,
      server_groups: body.server_groups || [],
      notes: body.notes,
    };

    // Filter type
    if (payload.configuration.patch_rule !== "all") {
      payload.configuration.filter_type = body.configuration.patch_rule; // Patch All Except = exclude, Patch Only =  include, Patch by Severity = severity
      if (body.configuration.patch_rule === "severity") {
        payload.configuration.severity_filter =
          body.configuration.severity_filter;
      }
    }

    // Device Filters
    if (body.configuration.device_filters_enabled) {
      payload.configuration.device_filters = body.configuration.device_filters;
    }

    if (body.configuration.filter_type) {
      payload.configuration.filter_type = body.configuration.filter_type;
    }

    // Schedule Week
    if (body.schedule_weeks_of_month) {
      payload.schedule_weeks_of_month = convertToDec(
        body.schedule_weeks_of_month
      );
    }

    if (body.schedule_months) {
      // Schedule Month
      payload.schedule_months = convertToDec(body.schedule_months);
    }

    await updateOrCreateSinglePolicy(payload, user.company_id);

    res.status(HttpStatus.OK).json({
      message: "Policy created successfully",
      name: body.name,
    });

    // if (integration === integrationsNames.AUTOMOX) {
    //   const company = await getCompanyWithIntegtation(
    //     user.company_id,
    //     "automox"
    //   );
    //   payload.organization_id = company.integrations?.integration_values?.organization_id
    //   // For logs
    //   const clientDetails = {
    //     id: user.id,
    //     email: user.email,
    //     ipAddress: req.socket.remoteAddress,
    //     process: "Create Policy",
    //     company_id: company.id,
    //   };
    //   const url = `policies?o=${company.integrations?.integration_values?.organization_id}`;

    //   await automoxAPI
    //     .post(url, payload)
    //     .then(async (response) => {
    //       res.status(HttpStatus.OK).json({
    //         message: "Policy created successfully",
    //         name: body.name,
    //       });
    //       await saveData(company, clientDetails, payload, body);
    //     })
    //     .catch(async (error) => {
    //       // console.log("error", error.response.data);
    //       res.status(400).json({ error, message: error.response.data.errors });
    //     });
    // } else if (integration === integrationsNames.MALWAREBYTES) {
    //   const company = await getCompanyWithIntegtation(
    //     user.company_id,
    //     "malwareBytes"
    //   );
    //   // For logs
    //   const clientDetails = {
    //     id: user.id,
    //     email: user.email,
    //     ipAddress: req.socket.remoteAddress,
    //     process: "Create Policy",
    //     company_id: company.id,
    //   };
    //   await saveData(company, clientDetails, payload, body).then((resp) => {
    //     res.status(HttpStatus.OK).json({
    //       message: "Policy created successfully",
    //       name: body.name,
    //     });
    //   }).catch(async (error) => {
    //     // console.log("error", error.response.data);
    //     res.status(400).json({ error, message: error.message });
    //   });;

    // }
  } catch (err) {
    // errorHandler(err);
    res.status(400).json({ err, message: err?.response?.data?.errors });
  }
};

// get all policies
export const getAllPolicies = async (req, res) => {
  try {
    const { user } = req;
    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Get Policies",
      company_id: user.company_id,
    };
    const { page } = req.query;
    const { size } = req.query;
    const { query } = req;
    const filter = JSON.parse(query.filter || "{}");
    const integration = await findIntegration(user);
    const filterObj = { company_id: user.company_id };
    if (filter.search) {
      filterObj.name = { [Op.like]: `%${filter.search}%` };
    }

    await patchingPoliciesSQLModel
      .findAll({
        where: filterObj,
        offset: (page - 1) * size,
        limit: +size,
        order: [["updatedAt", "DESC"]],
      })
      .then(async (response) => {
        const totalCount = await patchingPoliciesSQLModel.count({
          where: filterObj,
        });
        for (let i = 0; i < response.length; i++) {
          if (response[i].schedule_days) {
            response[i].schedule_days = convertToBinary(
              response[i].schedule_days
            );
          }
          if (response[i].schedule_weeks_of_month) {
            response[i].schedule_weeks_of_month = convertToBinary(
              response[i].schedule_weeks_of_month
            );
          }
          if (response[i].schedule_months) {
            response[i].schedule_months = convertToBinary(
              response[i].schedule_months
            );
          }
        }
        await addEventLog(
          { ...clientDetails, user_id: null },
          getPolicyLog.status.getPolicySuccessfully.code
        );
        return res.status(200).json({
          message: "All policies",
          policies: response,
          page,
          size,
          totalCount,
        });
      })
      .catch(async (err) => {
        await addEventLog(
          { ...clientDetails, user_id: null },
          activitiesData.AuditActivity.activities.getPolicyLog.status
            .getPolicyFailed.code,
          {},
          err.message
        );
        return res.status(500).json({
          message: "Something went wrong",
          err,
        });
      });
  } catch (err) {
    res.status(400).json({ err, message: err.message });
  }
};

// edit policy
export const editPolicy = async (req, res) => {
  try {
    const { user } = req;
    const integration = await findIntegration(user);
    const { body } = req;

    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Edit Policy",
      company_id: user.company_id,
    };

    if (body?.configuration.device_filters) {
      body?.configuration.device_filters?.map((el) => {
        delete el?.oldVal;
        el.value = el.value?.map((tag) => (tag?.value ? tag?.value : tag));
        return el;
      });
    }
    const payload = {
      name: body.name,
      policy_type_name: "patch",
      configuration: {
        auto_patch: body.configuration.auto_patch === "active",
        patch_rule: body.configuration.patch_rule === "all" ? "all" : "filter",
        auto_reboot: body.configuration.auto_reboot || false,
        notify_user: body.configuration.notify_user === "active",
        device_filters_enabled: body.configuration.device_filters_enabled,
        pending_reboot_deferral_enabled:
          body?.configuration?.pending_reboot_deferral_enabled,
        notify_user_auto_deferral_enabled:
          body?.configuration?.notify_user_auto_deferral_enabled,
        missed_patch_window: body.configuration.missed_patch_window,
        notify_reboot_user: body.configuration.notify_reboot_user,
        notify_deferred_reboot_user:
          body.configuration.notify_deferred_reboot_user,
        custom_notification_patch_message:
          body.configuration.custom_notification_patch_message,
        custom_notification_patch_message_mac:
          body.configuration.custom_notification_patch_message_mac,
        custom_notification_reboot_message:
          body.configuration.custom_notification_reboot_message,
        custom_notification_reboot_message_mac:
          body.configuration.custom_notification_reboot_message_mac,
        custom_pending_reboot_notification_message:
          body.configuration.custom_pending_reboot_notification_message,
        custom_pending_reboot_notification_message_mac:
          body.configuration.custom_pending_reboot_notification_message_mac,
        custom_notification_max_delays:
          body.configuration.custom_notification_max_delays,
        custom_notification_deferment_periods:
          body.configuration.custom_notification_deferment_periods,
        custom_pending_reboot_notification_deferment_periods:
          body.configuration
            .custom_pending_reboot_notification_deferment_periods,
        custom_pending_reboot_notification_max_delays:
          body.configuration.custom_pending_reboot_notification_max_delays,
        notify_user_message_timeout:
          body.configuration.notify_user_message_timeout,
        notify_deferred_reboot_user_message_timeout:
          body.configuration.notify_deferred_reboot_user_message_timeout,
        notify_deferred_reboot_user_auto_deferral_enabled:
          body.configuration.notify_deferred_reboot_user_auto_deferral_enabled,
        filters: body?.configuration?.filters,
        timezone: body?.configuration?.timezone,
        patch_ids: body?.configuration?.patch_ids,
        utc_time: body?.configuration?.utc_time,
      },
      schedule_days: convertToDec(body.schedule_days),
      schedule_time: body.schedule_time,
      server_groups: body.server_groups || [],
      notes: body.notes,
    };

    // Filter type
    if (payload.configuration.patch_rule !== "all") {
      payload.configuration.filter_type = body.configuration.patch_rule; // Patch All Except = exclude, Patch Only =  include, Patch by Severity = severity
      if (body.configuration.patch_rule === "severity") {
        payload.configuration.severity_filter =
          body.configuration.severity_filter;
      }
    }

    // Device Filters
    if (body.configuration.device_filters_enabled) {
      payload.configuration.device_filters = body.configuration.device_filters;
    }

    if (body.configuration.filter_type) {
      payload.configuration.filter_type = body.configuration.filter_type;
    }

    // Schedule Week
    if (body.schedule_weeks_of_month) {
      payload.schedule_weeks_of_month = convertToDec(
        body.schedule_weeks_of_month
      );
    }

    if (body.schedule_months) {
      // Schedule Month
      payload.schedule_months = convertToDec(body.schedule_months);
    }

    const policyData = await getPolicyData(body);

    await updateOrCreateSinglePolicy(payload, user.company_id, body.id).then(
      () => {
        res.status(200).json({ message: "Policy updated successfully" });
      }
    );
    // await updatePolicy(payload, policyData, clientDetails).then(() => {
    //   res.status(200).json({ message: "Policy updated successfully" });
    // });

    // const url = `policies/${policyData.policy_id}?o=${company.integrations?.integration_values?.organization_id}`;
    // await automoxAPI
    //   .put(url, payload)
    //   .then(async (response) => {
    //     await saveData(company, clientDetails);
    //     await updatePolicy(payload, policyData, clientDetails).then(() => {
    //       res.status(200).json({ message: "Policy updated successfully" });
    //     });
    //   })
    //   .catch(async (error) => {
    //     // Event Logs Handler
    //     const eventLogs = await addEventLog(
    //       { ...clientDetails, user_id: null },
    //       activitiesData.AuditActivity.activities.editPolicyLog.status
    //         .editPolicyFailed.code,
    //       null,
    //       error.message
    //     );
    //     // console.log("error.response.data", error.response.data);
    //     res.status(400).json({ error, message: error.response.data });
    //   });
  } catch (err) {
    // console.log("errrr", err);
    res.status(400).json({ err, message: err.message });
  }
};

// delete policy
export const deletePolicy = async (req, res) => {
  try {
    const { user } = req;
    // For logs
    const integration = await findIntegration(user);
    const body = req.params;
    const policyData = await getPolicyData(body);
    await deletePolicyWithID(policyData);
    res.status(200).json({ message: "Policy deleted successfully" });
    // const url = `policies/${policyData.policy_id}?o=${company.integrations?.integration_values?.organization_id}`;
    // await automoxAPI
    //   .delete(url)
    //   .then(async (response) => {
    //     await deletePolicyWithID(policyData);
    //     res.status(200).json({ message: "Policy deleted successfully" });
    //   })
    //   .catch(async (error) => {
    //     // Event Logs Handler
    //     const eventLogs = await addEventLog(
    //       { ...clientDetails, user_id: null },
    //       activitiesData.AuditActivity.activities.deletePolicyLog.status
    //         .deletePolicyFailed.code,
    //       null,
    //       error.message
    //     );
    //     res.status(400).json({ error, message: error.message });
    //   });
  } catch (err) {
    res.status(400).json({ err, message: err.message });
  }
};

// get policy by company id
export const getPolicyByCompanyId = async (req, res) => {
  try {
    const { user } = req;
    const integration = await findIntegration(user);
    if (
      [integrationsNames.AUTOMOX, integrationsNames.MALWAREBYTES].includes(
        integration
      )
    ) {
      const clientDetails = {
        id: user.id,
        email: user.email,
        ipAddress: req.socket.remoteAddress,
        process: "Get patching Policy",
        company_id: user.company_id,
      };
      await patchingPoliciesSQLModel
        .findAll({
          where: {
            company_id: user.company_id,
          },
          order: [["createdAt", "ASC"]],
          // offset: (page - 1) * size,
          // limit: +size,
        })
        .then(async (response) => {
          await addEventLog(
            { ...clientDetails, user_id: null },
            activitiesData.AuditActivity.activities.getPolicyLog.status
              .getPolicySuccessfully.code,
            {}
          );
          return res.status(200).json({
            message: "Policies fetch successfully",
            policies: response,
          });
        })
        .catch(async (err) => {
          await addEventLog(
            { ...clientDetails, user_id: null },
            activitiesData.AuditActivity.activities.getPolicyLog.status
              .getPolicyFailed.code,
            {},
            err.message
          );
          return res.status(500).json({ err, message: "Something went wrong" });
        });
    } else {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Patching integration is not available" });
    }
  } catch (error) {
    errorHandler(error);
    return res
      .status(500)
      .json({ err: error, message: "Something went wrong" });
  }
};

// get policy by policy id
export const getPolicyByID = async (req, res) => {
  const body = req.params;
  try {
    await patchingPoliciesSQLModel
      .findOne({
        where: {
          id: body.id,
        },
        include: [
          {
            model: PolicyGroupsSQLModel,
            attributes: ["patching_group_id"],
          },
        ],
      })
      .then(async (response) => {
        if (response === null) {
          return res.status(400).json({
            message: "Policy not found",
          });
        }
        if (response.server_groups?.length) {
          response.server_groups = await patchingPoliciesSQLModel.findAll({
            where: { server_groups: { [Op.in]: response.server_groups } },
          });
        }
        if (response.schedule_days) {
          response.schedule_days = convertToBinary(response.schedule_days);
        }
        if (response.schedule_weeks_of_month) {
          response.schedule_weeks_of_month = convertToBinary(
            response.schedule_weeks_of_month
          );
        }
        if (response.schedule_months) {
          response.schedule_months = convertToBinary(response.schedule_months);
        }

        return res.status(200).json({
          message: "fetch policy successfully",
          policy: response,
        });
      })
      .catch((err) =>
        res.status(500).json({
          message: err.message,
        })
      );
  } catch (err) {
    res.status(400).json({ err, message: err.message });
  }
};

export const getDeviceTargettingOptions = async (req, res) => {
  try {
    const { user } = req;
    const filterObj = {
      company_id: user.company_id,
      asset_type: "non-network",
    };
    const { query } = req;
    const array = [];
    if (query.type === "tags") {
      // await AssetPropertySQLModel.findAll({
      //   where: { company_id: user.company_id },
      //   include: [
      //     {
      //       model: assetSQLModel,
      //       where: filterObj,
      //       required: true,
      //     },
      //   ],
      //   attributes: ["tags"],
      // }).then((data) => {
      //   data.map((item) => {
      //     item.tags.filter((tag) => {
      //       array.push(tag);
      //     });
      //   });
      // });
    } else if (query.type === "os") {
      await AssetPatchingInformationModel.findAll({
        where: { company_id: user.company_id },
        attributes: ["os_family"],
        group: ["os_family"],
        // group: 'os_family'
      }).then((data) => {
        data.map((item) => array.push(item.os_family));
      });
    } else if (query.type === "os_version") {
      await AssetPatchingInformationModel.findAll({
        where: { company_id: user.company_id },
        attributes: ["os_name"],
        group: ["os_name"],
      }).then((data) => {
        data.map((item) => array.push(item.os_name));
      });
    }

    res.status(200).json({
      valid: true,
      message: "",
      data: array,
    });
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ err, message: err.message });
  }
};
