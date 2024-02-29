import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { errorHandler } from "../../utils/errorHandler";
import assetSQLModel from "../Assets/assets.model";
import sequelize from "../db";
import riskToleranceSelectedAssetsModel from "../RiskToleranceSelectedAssets/riskToleranceSelectedAssets.model";
import riskToleranceSelectedTagsModel from "../RiskToleranceSelectedTags/riskToleranceSelectedTags.model";
import riskToleranceSettingsModel from "../RiskToleranceSettings/riskToleranceSettings.model";
import TagsModel from "../Tags/tags.model";
import riskToleranceSQLModel from "./riskTolerance.model";
import { createTolerance, deleteRiskTolerance, updateTolerance, updateTolerancePriority } from "../Logs/ActivitiesType/RiskToleranceActivities";
import { addEventLog, createEventPayload } from "../Logs/eventLogs/eventLogs.controller";
import AssetTagModel from "../AssetTags/assetTags.model";
import { getSourceValidation } from "../Assets/assets.service";

export const findRiskTolerance = async (filter) => {

  const riskToleranceData = await riskToleranceSQLModel.findOne({
    where: filter
  });
  return riskToleranceData;
};

export const findRiskToleranceById = async (id) => {
  const riskToleranceData = await riskToleranceSQLModel.findOne({
    where: {
      id,
    },
    include: [
      {
        model: riskToleranceSelectedAssetsModel,
      },
      {
        model: riskToleranceSelectedTagsModel,
      },
      {
        model: riskToleranceSettingsModel,
      },
    ],
  });
  return riskToleranceData;
};

export const createRiskTolerance = async (payload, clientDetails, transactionObj) => {
  try {
    const riskToleranceData = await riskToleranceSQLModel.create(payload, transactionObj);
    clientDetails.target_id = riskToleranceData.id;
    clientDetails.effected_table = riskToleranceSQLModel.tableName;
    if (clientDetails) {
      await addEventLog(
        { ...clientDetails, user_id: clientDetails.id },
        createTolerance.status.createToleranceSuccessfully.code,
        createEventPayload(
          {},
          JSON.parse(JSON.stringify(payload)),
          riskToleranceSQLModel.tableName
        )
      );
    }
    return riskToleranceData;
  } catch (error) {
    if (clientDetails) {
      await addEventLog(
        { ...clientDetails, user_id: clientDetails.id },
        createTolerance.status.createToleranceFailed.code,
        null,
        error.message
      );
    }
    errorHandler(error);
    return false;
  }
};

export const getAllRiskTolerances = async (
  company_id,
  queryFilter,
  page,
  size
) => {
  let filter = {};
  const filterObj = {};
  const pageObj = {};
  let filterRequired = false;
  const sort = "ASC";
  const sortColumn = "priority";

  if (queryFilter) {
    filter = JSON.parse(queryFilter);
  }

  if (filter?.search) {
    filterObj.label = { [Op.like]: `%${filter?.search}%` };
    filterRequired = true;
  }

  if(page && size){
    pageObj.offset = (page - 1) * size;
    pageObj.limit = +size;
  }
  const riskToleranceData = await riskToleranceSQLModel.findAll({
    where: {
      company_id,
    },
    include: [
      {
        model: riskToleranceSelectedAssetsModel,
        include: [
          {
            model: assetSQLModel,
          },
        ],
      },
      {
        model: riskToleranceSelectedTagsModel,
        include: [
          {
            model: TagsModel,
            where: filterObj,
            required: filterRequired,
          },
        ],
      },
      {
        model: riskToleranceSettingsModel,
        // include: [
        //   {
        //     model: riskToleranceAttributesModel,
        //   },
        // ],
      },
    ],
    order: [[sortColumn, sort]],
    // offset: (page - 1) * size,
    // limit: +size,
    ...pageObj
  });

  const totalCount = await riskToleranceSQLModel
    .findAndCountAll({
      where: {
        company_id,
      },
      include: [
        {
          model: riskToleranceSelectedTagsModel,
          required: true,
          include: [
            {
              model: TagsModel,
              where: filterObj,
              required: filterRequired,
            },
          ],
        },
      ],
    })
    .then((resp) => resp.rows.length);

  let totalPage;
  if(size){
    totalPage =
    totalCount % size > 0
      ? Math.floor(totalCount / size) + 1
      : Math.floor(totalCount / size);
  }

  return { riskToleranceData, totalCount, totalPage };
};

export const deleteRiskToleranceByID = async (
  riskToleranceData,
  clientDetails,
  res
) => {
  try {
    await riskToleranceSQLModel.destroy({
      where: { id: riskToleranceData?.dataValues?.id },
    });

    await addEventLog(
      { ...clientDetails, user_id: clientDetails.id },
      deleteRiskTolerance.status.deleteRiskToleranceSuccessfully.code,
      null
    );
    // return res.status(StatusCodes.OK).json({
    //   valid: true,
    //   message: "Risk tolerance deleted successfully",
    // });
    return true;
  } catch (error) {
    errorHandler(error);
    await addEventLog(
      { ...clientDetails, user_id: clientDetails.id },
      deleteRiskTolerance.status.deleteRiskToleranceFailed.code,
      null,
      error.message
    );
    return false;
  }
};

export const existRiskTolerance = async (
  tag_ids,
  company_id,
) => {
  try {
    const existData = null;
    const riskToleranceData = await riskToleranceSQLModel.findAll({
      where: {
        company_id,
      },
      include: [
        {
          model: riskToleranceSelectedTagsModel,
          where: {
            tag_id: {
              [Op.in]: tag_ids,
            },
          },
          required: true
        },
      ]
    });
    if(riskToleranceData.length){
      for (const riskTolerance of riskToleranceData) {
        const tagIds = [];
        const riskToleranceTagCount = await riskToleranceSelectedTagsModel.findAndCountAll({
          where: {
            risk_tolerance_id: riskTolerance.dataValues.id,
          }
        }).then((resp) => resp.rows.length);
        for (const tagId of tag_ids) {
          const selectedTagData = await riskToleranceSelectedTagsModel.findOne({
            where: {
              tag_id: tagId,
              risk_tolerance_id: riskTolerance.dataValues.id,
            }
          });
          if (selectedTagData) {
            tagIds.push(tagId);
          }
        }
        if (tagIds.length === tag_ids.length && tag_ids.length === riskToleranceTagCount) {
          return Promise.resolve( riskTolerance );
        }
      }
    }else{
      return Promise.resolve( existData );
    }
    return Promise.resolve( existData );
  } catch (err) {
    return Promise.reject(err);
  }
};

export const updateRiskTolerance = async (payload, id, clientDetails, transactionObj) => {
  try {
    await riskToleranceSQLModel.update(payload, {
      where: { id },
      ...transactionObj
    });
    const riskToleranceData = riskToleranceSQLModel.findOne({
      where: {
        id,
      },
    });
    clientDetails.target_id = id;
    clientDetails.effected_table = riskToleranceSQLModel.tableName;
    // Event Logs Handler
    await addEventLog(
      { ...clientDetails },
      updateTolerance.status.updateToleranceSuccessfully.code,
      createEventPayload(
        {},
        JSON.parse(JSON.stringify(payload)),
        riskToleranceSQLModel.tableName
      )
    );
    return riskToleranceData;
  } catch (error) {
    // Event Logs Handler
    await addEventLog(
      { ...clientDetails, user_id: null },
      updateTolerance.status.updateToleranceFailed.code,
      null,
      error.message
    );
    return false;
  }
};

export const updateRiskTolencesAssetsCount = async (company_id) => {
  try {
    const riskTolerancesData = await riskToleranceSQLModel.findAll({
      where: {
        company_id,
      },
      include: [
        {
          model: riskToleranceSelectedTagsModel,
          attributes: ["tag_id"]
        },
      ],
    });

    const SourceValidation = await getSourceValidation(
      company_id,
      []
    );

    if(riskTolerancesData.length > 0){
      for await (const riskToleranceData of riskTolerancesData) {              
        const tag_ids = [];
        if(riskToleranceData.risk_tolerance_selected_tags.length > 0){
          await riskToleranceData.risk_tolerance_selected_tags.map(async (u) => {
            tag_ids.push(u.dataValues.tag_id);
          })
        }

        const AssetTags = await assetSQLModel.findAll({
          include: [
            {
              model: AssetTagModel,
              where: {
                tag_id: {
                  [Op.in]: tag_ids,
                },
              },
              include: [
                {
                  model: TagsModel,
                },
              ],
            },
            { ...SourceValidation },
          ],
          attributes: ["id"],
        });

        await riskToleranceSelectedAssetsModel.destroy({
          where: { risk_tolerance_id: riskToleranceData.id },
        });
        
        const assetTagIds = [];
        if (AssetTags.length) {
          for await (const AssetTag of AssetTags) {
            const tagIds = [];
            for await (const tagId of tag_ids) {
              const assetTagData = await AssetTagModel.findOne({
                where: {
                  tag_id: tagId,
                  asset_id: AssetTag.dataValues.id,
                },
              });
              if (assetTagData) {
                tagIds.push(tagId);
              }
            }

            if (tagIds.length === tag_ids.length) {
              const payload = {
                asset_id: AssetTag.dataValues.id,
                risk_tolerance_id: riskToleranceData.id,
                company_id,
              };
              await riskToleranceSelectedAssetsModel
                  .create(payload)
                  // .then(async (res) => {
                  //   console.log("res created");
                  // })
                  // .catch((err) => {
                  //   errorHandler(err);
                  // });
            }
          }
        }
      }
    }
    
    return true;
    // return riskCostFactorData;
  } catch (error) {
    errorHandler(error);
  }
};

export const updateRiskTolerancePriorityWise = async (tolerances, company_id, clientDetails, transactionObj) => {
  try {
    if (tolerances?.length > 0) {
      for await (const tolerance of tolerances) {
        const riskToleranceData = await riskToleranceSQLModel.findOne({
          where: {
            id: tolerance.id,
          },
        });
        if (riskToleranceData?.id) {
          await riskToleranceSQLModel.update(
            { priority: tolerance.priority },
            {
              where: {
                id: tolerance.id,
                company_id,
              },
              ...transactionObj
            }
          );

          clientDetails.target_id = riskToleranceData.id;
          clientDetails.effected_table = riskToleranceSQLModel.tableName;
          // Event Logs Handler
          await addEventLog(
            { ...clientDetails },
            updateTolerancePriority.status.updateTolerancePrioritySuccessfully.code,
            createEventPayload(
              {},
              JSON.parse(JSON.stringify(tolerance)),
              riskToleranceSQLModel.tableName
            )
          );
        }
      }
      return true;
    }
    return false;
  } catch (error) {
    // Event Logs Handler
    errorHandler(error);
    await addEventLog(
      { ...clientDetails, user_id: null },
      updateTolerancePriority.status.updateTolerancePriorityFailed.code,
      null,
      error.message
    );
    return false;
  }
};

export const findAndCountRiskTolerance = async (company_id) => {

  const totalCount = await riskToleranceSQLModel
    .findAndCountAll({
      where: {
        company_id,
      },
    })
    .then((resp) => resp.rows.length);
  return totalCount;
};

export const findRiskToleranceByPriority = async (filter) => {

  const riskToleranceData = await riskToleranceSQLModel.findOne({
    // where: filter,
    order: [['priority', 'ASC']],
    include: [
      {
        model: riskToleranceSelectedAssetsModel,
        where: filter
      },
    ],
  });
  return riskToleranceData;
};