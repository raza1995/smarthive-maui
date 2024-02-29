import { Op } from "sequelize";
import { downtimeProbabilityUpdate } from "../Logs/ActivitiesType/DowntimeProbabilityActivities";
import { addEventLog, createEventPayload } from "../Logs/eventLogs/eventLogs.controller";
import downtimeProbabilitySQLModel from "./downtimeProbability.model";


// export const getAllDowntimeProbabilities = async (
//   company_id,
//   queryFilter,
//   page = 1,
//   size = 10
// ) => {
//   let filter = {};
//   const filterObj = {};
//   let filterRequired = false;
//   const sort = "DESC";
//   const sortColumn = "createdAt";

//   if (queryFilter) {
//     filter = JSON.parse(queryFilter);
//   }

//   if (filter?.search) {
//     filterObj.label = { [Op.like]: `%${filter?.search}%` };
//     filterRequired = true;
//   }

//   const downtimeProbabilityData = await downtimeProbabilitySQLModel.findAll({
//     order: [[sortColumn, sort]],
//     offset: (page - 1) * size,
//     limit: +size,
//   });

//   const totalCount = await downtimeProbabilitySQLModel
//     .findAndCountAll({
//     })
//     .then((resp) => resp.rows.length);

//   return { downtimeProbabilityData, totalCount };
// };

export const getAllDowntimeProbabilities = async (
  company_id,
  queryFilter,
  page = 1,
  size = 10
) => {
  let filter = {};
  const filterObj = {};
  let filterRequired = false;
  const sort = "DESC";
  const sortColumn = "createdAt";

  if (queryFilter) {
    filter = JSON.parse(queryFilter);
  }

  if (filter?.search) {
    filterObj.label = { [Op.like]: `%${filter?.search}%` };
    filterRequired = true;
  }

  const downtimeProbabilityData = await downtimeProbabilitySQLModel.findAll({
    where: {
      company_id,
    },
    order: [[sortColumn, sort]],
    offset: (page - 1) * size,
    limit: +size,
  });

  const totalCount = await downtimeProbabilitySQLModel
    .findAndCountAll({
      where: {
        company_id,
      },
    })
    .then((resp) => resp.rows.length);

  return { downtimeProbabilityData, totalCount };
};

export const updateDowntimeProbability = async (payload, id, clientDetails, transactionObj) => {
  try {
    await downtimeProbabilitySQLModel.update(payload, {
      where: { id },
      ...transactionObj
    });
    const riskCostFactorData = downtimeProbabilitySQLModel.findOne({
      where: {
        id,
      },
    });
    clientDetails.target_id = id;
    clientDetails.effected_table = downtimeProbabilitySQLModel.tableName;
    // Event Logs Handler
    await addEventLog(
      { ...clientDetails },
      downtimeProbabilityUpdate.status.downtimeProbabilityUpdateSuccessfully.code,
      createEventPayload(
        {},
        JSON.parse(JSON.stringify(payload)),
        downtimeProbabilitySQLModel.tableName
      )
    );
    return riskCostFactorData;
  } catch (error) {
    // Event Logs Handler
    await addEventLog(
      { ...clientDetails, user_id: null },
      downtimeProbabilityUpdate.status.downtimeProbabilityUpdateFailed.code,
      null,
      error.message
    );
    return error.message;
  }
};
