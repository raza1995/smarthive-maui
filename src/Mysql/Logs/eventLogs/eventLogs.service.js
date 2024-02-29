import { diff } from "deep-object-diff";
import { Op } from "sequelize";
import assetSQLModel from "../../Assets/assets.model";
import userModel from "../../Users/users.model";
import activityModel from "../Activities/activity.madel";
import activityCategoryModel from "../ActivityCategories/activityCategories.model";
import activityStatusModel from "../activityStatus/activityStatus.model";
import eventLogsModel from "./eventLogs.model";
import eventPayloadModel from "../eventPayload/eventPayload.model";
import sequelize from "../../db";
import { logsPublicValue, valueAccessTypes } from "../logsPublicValues";
import { restrictedActivityCodes } from "../../../utils/constants";

const getObjectValues = (values, table_effected, attributes_effected) => {
  if (typeof values === "object" && values) {
    const valuesObject = {};
    attributes_effected?.forEach((item) => {
      if (!["id", "company_id", "asset_id", "integration_id"].includes(item)) {
        if (
          logsPublicValue[table_effected]?.[item] !== valueAccessTypes.PRIVATE
        ) {
          if (
            logsPublicValue[table_effected]?.[item] === valueAccessTypes.PUBLIC
          ) {
            valuesObject[item] = values?.[item];
          } else {
            valuesObject[item] =
              values?.[item] !== undefined || values?.[item] !== null
                ? "Confidential Data"
                : "N/A";
          }
        }
      }
    });
    return valuesObject;
  }
  return null;
};

const getPropertyEffected = (logPayload) => {
  const propertyEffected = [];
  // console.log(logPayload?.attributes_effected, logPayload.table_effected);
  logPayload?.attributes_effected?.forEach((item) => {
    if (!["id", "company_id", "asset_id", "integration_id"].includes(item)) {
      if (
        logsPublicValue[logPayload.table_effected]?.[item] !==
        valueAccessTypes.PRIVATE
      ) {
        if (
          logsPublicValue[logPayload.table_effected]?.[item] ===
          valueAccessTypes.PUBLIC
        ) {
          if (
            typeof logPayload?.new_values?.[item] === "object" ||
            typeof logPayload?.old_values?.[item] === "object"
          ) {
            if (
              Array.isArray(logPayload?.new_values?.[item]) ||
              Array.isArray(logPayload?.old_values?.[item])
            ) {
              const currant_value = [];
              const old_value = [];

              logPayload?.new_values?.[item]?.forEach((el) => {
                currant_value.push(
                  getObjectValues(
                    el,
                    item,
                    Object.keys(el).map((key) => key)
                  )
                );
              });
              logPayload?.old_values?.[item]?.forEach((el) => {
                old_value.push(
                  getObjectValues(
                    el,
                    item,
                    Object.keys(el).map((key) => key)
                  )
                );
              });
              propertyEffected.push({
                property: item,
                currant_value: currant_value.length > 0 ? currant_value : "N/A",
                old_value: old_value.length > 0 ? old_value : "N/A",
              });
            } else {
              const dataDiff = diff(
                logPayload?.new_values?.[item],
                logPayload?.old_values?.[item] || {}
              );
              delete dataDiff?.updatedAt;
              const attributesEffected = Object.keys(dataDiff).map(
                (key) => key
              );
              propertyEffected.push({
                property: item,
                currant_value: getObjectValues(
                  logPayload?.new_values?.[item],
                  item,
                  attributesEffected
                ),
                old_value: getObjectValues(
                  logPayload?.old_values?.[item],
                  item,
                  attributesEffected
                ),
              });
            }
          } else {
            propertyEffected.push({
              property: item,
              currant_value: logPayload?.new_values?.[item],
              old_value: logPayload?.old_values?.[item],
            });
          }
        } else {
          propertyEffected.push({
            property: item,
            currant_value: "Confidential Data",
            old_value:
              logPayload?.old_values?.[item] !== undefined ||
              logPayload?.old_values?.[item] !== null
                ? "Confidential Data"
                : "N/A",
          });
        }
      }
    }
  });

  return propertyEffected;
};
export const getEventLogs = async (query, offset = 0, limit = 10, sortBy) => {
  const count = await eventLogsModel.count({
    distinct: "id",
    where: {
      ...query,
      status_code: {
        [Op.notIn]: restrictedActivityCodes,
      },
    },
    include: [
      {
        model: activityStatusModel,
        attributes: ["status", "label", "code", "severity"],
        as: "activity_status",
        required: true,
      },
    ],
  });
  const eventLog = await eventLogsModel.findAll({
    where: {
      ...query,
      status_code: {
        [Op.notIn]: restrictedActivityCodes,
      },
    },
    attributes: [
      "id",
      "client_id",
      "process",
      "effected_table",
      "target_id",
      "error_reason",
      "client_ip_address",
      "is_system_log",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: activityModel,
        as: "activity",
        attributes: ["label", "code"],
        required: true,
      },
      {
        model: assetSQLModel,
        attributes: ["asset_name", "asset_type"],
      },
      {
        model: activityStatusModel,
        attributes: ["status", "label", "code", "severity"],
        as: "activity_status",
        required: true,
      },
      {
        model: userModel,
        as: "Client",
        attributes: ["full_name", "email"],
      },
      {
        model: userModel,
        as: "user",
        attributes: ["full_name", "email"],
      },
      {
        model: eventPayloadModel,
      },
    ],
    offset,
    limit,
    order: [["createdAt", sortBy === "oldest" ? "ASC" : "DESC"]],
  });
  const logs = await Promise.all(
    eventLog.map(async (el) => {
      const log = JSON.parse(JSON.stringify(el));
      if (log?.logs_event_payload?.table_effected) {
        const propertyEffected = getPropertyEffected(log.logs_event_payload);
        delete log?.logs_event_payload;
        return {
          ...log,
          propertyEffected,
        };
      }
      return log;
    })
  );
  return {
    logs,
    totalLogs: count,
  };
};
export const getEventLogsByCategory = async (
  query,
  offset = 0,
  limit = 10,
  category_code
) => {
  const count = await eventLogsModel.count({
    where: query,
    include: [
      {
        model: activityModel,
        as: "activity",
        attributes: ["label", "code"],
        required: true,
        include: [
          {
            model: activityCategoryModel,
            as: "activity_categories",
            where: {
              code: category_code,
            },
          },
        ],
      },
    ],
  });
  const eventLog = await eventLogsModel.findAll({
    where: query,
    attributes: [
      "id",
      "client_id",
      "process",
      "error_reason",
      "client_ip_address",
      "is_system_log",
      "createdAt",
      "updatedAt",
      // [
      //   sequelize.literal(
      //     `(SELECT * FROM logs_event.effected_table as effected_table  WHERE effected_table.id = logs_event.target_id`
      //   ),
      //   "effected_table",
      // ],
    ],
    include: [
      {
        model: activityModel,
        as: "activity",
        attributes: ["label", "code"],
        required: true,
        include: [
          {
            model: activityCategoryModel,
            as: "activity_categories",
            where: {
              code: category_code,
            },
          },
        ],
      },
      {
        model: assetSQLModel,
        attributes: ["asset_name", "asset_type"],
      },
      {
        model: activityStatusModel,
        attributes: ["status", "label", "code", "severity"],
        as: "activity_status",
        required: true,
      },
      {
        model: userModel,
        as: "Client",
        attributes: ["full_name", "email"],
      },
      {
        model: userModel,
        as: "user",
        attributes: ["full_name", "email"],
      },
      {
        model: eventPayloadModel,
      },
    ],
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  });
  const logs = await Promise.all(
    eventLog.map(async (el) => {
      const log = JSON.parse(JSON.stringify(el));
      if (log?.logs_event_payload?.table_effected) {
        const propertyEffected = getPropertyEffected(log.logs_event_payload);
        delete log?.logs_event_payload;
        return {
          ...log,
          propertyEffected,
        };
      }
      return log;
    })
  );
  return {
    logs,
    totalLogs: count,
  };
};
