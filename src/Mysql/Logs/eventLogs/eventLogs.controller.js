import { diff } from "deep-object-diff";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import activityModel from "../Activities/activity.madel";
import activityStatusModel from "../activityStatus/activityStatus.model";
import eventPayloadModel from "../eventPayload/eventPayload.model";
import eventLogsModel from "./eventLogs.model";
import { logger } from "../../../../logs/config";
// eslint-disable-next-line import/no-cycle
import { findUserById, findUserOAuthId } from "../../Users/users.service";
import { getEventLogs, getEventLogsByCategory } from "./eventLogs.service";
import {
  restrictedActivityCodes,
  severitiesTypes,
} from "../../../utils/constants";
import { EndpointActivityCategory, PatchingActivity } from "../logsConstant";
import activityCategoryModel from "../ActivityCategories/activityCategories.model";
import { errorHandler } from "../../../utils/errorHandler";

export const addEventLog = async (
  client,
  statusCode,
  eventPayload = null,
  errorReason = ""
) => {
  try {
    const activity = await activityModel.findOne({
      include: [
        {
          model: activityStatusModel,
          where: { code: statusCode },
          required: true,
        },
      ],
      raw: true,
      nest: true,
    });
    const createLogEvent = async () => {
      const log = await eventLogsModel.create({
        client_id: client?.id || null,
        client_email: client?.email || null,
        company_id: client?.company_id || null,
        user_id: client?.user_id || null,
        asset_id: client?.asset_id || null,
        target_id: client?.target_id || null,
        effected_table: client?.effected_table || null,
        activity_code: activity.code,
        activity_id: activity.id,
        process: client.process,
        client_ip_address: client.ipAddress,
        status_code: activity.logs_activity_statuses.code,
        status_id: activity.logs_activity_statuses.id,
        error_reason: errorReason,
        is_system_log: !!client?.isSystemLog,
      });
      return log;
    };
    if (eventPayload) {
      if (eventPayload?.attributes_effected?.length > 0) {
        // console.log(client.process,eventPayload.attributes_effected);
        const eventLog = await createLogEvent();
        await eventPayloadModel.create({
          event_id: eventLog.id,
          activity_label: activity.label,
          ...eventPayload,
        });
        return eventLog;
      }
    } else {
      // console.log(client.process);
      const eventLog = await createLogEvent();
      return eventLog;
    }

    return;
  } catch (err) {
    errorHandler(err);
    logger.error(JSON.stringify(err));
  }
};

export const createEventPayload = (newData, oldData, tableName) => {
  const dataDiff = diff(newData, oldData);
  delete dataDiff.updatedAt;
  const attributesEffected = Object.keys(dataDiff).map((key) => key);

  return {
    table_effected: tableName,
    effected_item_id: newData?.id || oldData?.id,
    attributes_effected: attributesEffected,
    new_values: newData,
    old_values: oldData,
  };
};

export const getLogsStatics = async (req, res) => {
  try {
    const { user } = req;
    const { company_id } = user;
    const count = await eventLogsModel.count({
      where: {
        [Op.or]: [
          {
            user_id: user.id,
          },
          { company_id },
        ],
        status_code: {
          [Op.notIn]: restrictedActivityCodes,
        },
      },
    });
    const highSeverityLogsCount = await eventLogsModel.count({
      where: {
        [Op.or]: [
          {
            user_id: user.id,
          },
          { company_id },
        ],
        status_code: {
          [Op.notIn]: restrictedActivityCodes,
        },
      },
      include: [
        {
          model: activityStatusModel,
          where: { severity: severitiesTypes.high },
          as: "activity_status",
          required: true,
        },
      ],
    });
    const mediumSeverityLogsCount = await eventLogsModel.count({
      where: {
        [Op.or]: [
          {
            user_id: user.id,
          },
          { company_id },
        ],
        status_code: {
          [Op.notIn]: restrictedActivityCodes,
        },
      },
      include: [
        {
          model: activityStatusModel,
          where: { severity: severitiesTypes.medium },
          as: "activity_status",
          required: true,
        },
      ],
    });
    const lowSeverityLogsCount = await eventLogsModel.count({
      where: {
        [Op.or]: [
          {
            user_id: user.id,
          },
          { company_id },
        ],
        status_code: {
          [Op.notIn]: restrictedActivityCodes,
        },
      },
      include: [
        {
          model: activityStatusModel,
          where: { severity: severitiesTypes.low },
          as: "activity_status",
          required: true,
        },
      ],
    });
    return res.status(StatusCodes.OK).json({
      totalLogs: count,
      highSeverityLogsCount,
      mediumSeverityLogsCount,
      lowSeverityLogsCount,
    });
  } catch (err) {
    errorHandler(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ valid: false, error: "Something went wrong", stack: err });
  }
};

export const getUserLogs = async (req, res) => {
  try {
    const { user } = req;
    const { company_id } = user;
    const { size, page } = req.query;
    const offset = size * (page - 1);
    const limit = +size;
    // console.log(req.query.filter);
    const filter = JSON.parse(req.query.filter);
    const filterQuery = {};
    if (filter?.search) {
      filterQuery.process = { [Op.like]: `%${filter?.search}%` };
    }
    if (filter?.severity?.length > 0) {
      filterQuery["$activity_status.severity$"] = {
        [Op.in]: filter.severity,
      };
    }
    if (filter?.status?.length > 0) {
      filterQuery["$activity_status.status$"] = {
        [Op.in]: filter.status,
      };
    }
    const logs = await getEventLogs(
      {
        [Op.or]: [
          {
            user_id: user.id,
          },
          { company_id },
        ],
        ...filterQuery,
      },
      offset,
      limit,
      filter?.sortBy
    );
    return res.json(logs);
  } catch (err) {
    errorHandler(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ valid: false, error: "Something went wrong", stack: err });
  }
};

export const getUserLogsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await findUserById(user_id);
    const LoginUser = await findUserOAuthId(req.user.sub);
    if (user.company_id === LoginUser.company_id) {
      const { size, page } = req.query;
      const offset = size * (page - 1);
      const limit = +size;
      // console.log(req.query.filter);
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const filterQuery = {};
      if (filter?.search) {
        filterQuery.process = { [Op.like]: `%${filter?.search}%` };
      }
      if (filter?.severity?.length > 0) {
        filterQuery["$activity_status.severity$"] = {
          [Op.in]: filter.severity,
        };
      }
      if (filter?.status?.length > 0) {
        filterQuery["$activity_status.status$"] = {
          [Op.in]: filter.status,
        };
      }
      const logs = await getEventLogs(
        {
          [Op.or]: [
            {
              user_id,
            },
            { client_id: user_id },
          ],
          ...filterQuery,
        },
        offset,
        limit,
        filter?.sortBy
      );
      return res.status(StatusCodes.OK).json(logs);
    }
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ valid: false, error: "You are not allow to this user data" });
  } catch (err) {
    errorHandler(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ valid: false, error: "Something went wrong", stack: err });
  }
};

export const getAssetAllLogs = async (req, res) => {
  try {
    const { user } = req;
    const { company_id } = user;
    const { asset_id } = req.params;
    const { size, page } = req.query;
    const offset = size * (page - 1);
    const limit = +size;
    const logs = await getEventLogs(
      {
        asset_id,
        company_id,
      },
      offset,
      limit
    );

    return res.json(logs);
  } catch (err) {
    errorHandler(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ valid: false, error: "Something went wrong", stack: err });
  }
};

export const getPatchingAssetLogs = async (req, res) => {
  try {
    const { user } = req;
    const { asset_id } = req.params;
    const { size, page } = req.query;
    const offset = size * (page - 1);
    const limit = +size;
    const logsData = await getEventLogsByCategory(
      {
        asset_id,
      },
      offset,
      limit,
      PatchingActivity.code
    );

    return res.json(logsData);
  } catch (err) {
    errorHandler(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ valid: false, error: "Something went wrong", stack: err });
  }
};

export const getEndpointAssetLogs = async (req, res) => {
  try {
    const { user } = req;
    const { asset_id } = req.params;
    console.log(asset_id);
    const { size, page } = req.query;
    const offset = size * (page - 1);
    const limit = +size;
    const logsData = await getEventLogsByCategory(
      {
        asset_id,
      },
      offset,
      limit,
      EndpointActivityCategory.code
    );

    return res.json(logsData);
  } catch (err) {
    errorHandler(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ valid: false, error: "Something went wrong", stack: err });
  }
};

export const getLogsActiveCSV = async (req, res) => {
  try {
    const logsData = await activityCategoryModel.findAll({
      attributes: ["label", "code"],
      include: [
        {
          model: activityModel,
          as: "activity_categories",
          attributes: ["label", "code"],
          required: true,
          include: [
            {
              model: activityStatusModel,
              attributes: ["label", "code", "severity", "status"],
            },
          ],
        },
      ],
    });
    let activitiesArray = [];
    logsData.forEach((category) => {
      const activities = category.activity_categories.map((activityItem) => {
        const activity = JSON.parse(JSON.stringify(activityItem));
        const success = activity.logs_activity_statuses.filter(
          (item) => item.status === "success"
        )[0];
        const failed = activity.logs_activity_statuses.filter(
          (item) => item.status === "failed"
        )[0];
        console.log(success, failed);
        return [
          category.label,
          category.code,
          activity.label,
          activity.code,
          success.label,
          success.code,
          success.severity,
          failed.label,
          failed.code,
          failed.severity,
        ];
      });
      activitiesArray = [...activitiesArray, ...activities];
    });
    const csvString = [
      [
        "Activity Category",
        "Activity Category code",
        "Activity",
        "Activity Code",
        "Success Status",
        "Success status code",
        "Success severity",
        "Failure Status",
        "Failure status code",
        "Failure severity",
      ],
      ...activitiesArray,
    ]
      .map((e) => e.join(","))
      .join("\n");
    res.header("Content-Type", "text/csv");
    res.attachment("log_sheet.csv");
    return res.send(csvString);
  } catch (err) {
    errorHandler(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ valid: false, error: "Something went wrong", stack: err });
  }
};
