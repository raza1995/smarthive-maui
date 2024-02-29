import moment from "moment";
import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import assetSQLModel from "../Assets/assets.model";
import AssetTagModel from "../AssetTags/assetTags.model";
import TagsModel from "../Tags/tags.model";
import riskCostFactorSQLModel from "./riskCostFactor.model";
import riskCostFactorSelectedAssetsModel from "../RiskCostFactorSelectedAssets/riskCostFactorSelectedAssets.model";
import riskCostFactorSelectedTagsModel from "../RiskCostFactorSelectedTags/riskCostFactorSelectedTags.model";
import { errorHandler } from "../../utils/errorHandler";
import {
  createCostFactor,
  deletecostFactor,
  getAssetsbyTag,
  getRiskCostFactorListing,
  updateCostFactorPriority,
  UpdateRiskCostFactor,
} from "../Logs/ActivitiesType/RiskCostFactorActivities";
import riskCostFactorOtherCostsModel from "../RiskCostFactorOtherCosts/riskCostFactorOtherCosts.model";
import riskCostFactorAttributesModel from "../RiskCostFactorAttributes/riskCostFactorAttributes.model";
import { findAssetScoreByFilter } from "../AssetScores/assetScore.service";
import { findRiskToleranceByPriority } from "../RiskTolerance/riskTolerance.service";
import { getRiskCostFactorFinancialLossApi } from "../../api/riskCost";
import { updateRiskCostFactorsSelectedAsset } from "../RiskCostFactorSelectedAssets/riskCostFactorSelectedAssets.service";
import { AddAttributeToCalcFinancialLossObj } from "../RiskCostFactorOtherCosts/riskCostFactorOtherCosts.service";
import { getSourceValidation } from "../Assets/assets.service";

export const getAssetsAndTotalCount = async (
  tag_ids,
  user,
  client,
  page = 1,
  size = 10
) => {
  try {
    const AssetTags = await AssetTagModel.findAll({
      where: {
        tag_id: {
          [Op.in]: tag_ids,
        },
      },
      attributes: ["asset_id"],
      group: ["asset_id"],
    });

    const assetTagIds = [];
    if (AssetTags.length) {
      for (const AssetTag of AssetTags) {
        const tagIds = [];
        for (const tagId of tag_ids) {
          const assetTagData = await AssetTagModel.findOne({
            where: {
              tag_id: tagId,
              asset_id: AssetTag.dataValues.asset_id,
            },
          });
          if (assetTagData) {
            tagIds.push(tagId);
          }
        }
        if (tagIds.length === tag_ids.length) {
          assetTagIds.push(AssetTag.dataValues.asset_id);
        }
      }
    }

    const filterObj = {};
    const includeFilterObj = {};
    const sort = "DESC";
    const sortColumn = "createdAt";
    if (user.company_id) {
      filterObj.company_id = user.company_id;
    }
    if (assetTagIds.length) {
      filterObj.id = { [Op.in]: assetTagIds };
    } else {
      return Promise.resolve({ assets: [], totalCount: 0 });
    }

    const response = await assetSQLModel.findAll({
      where: filterObj,
      include: [
        {
          model: AssetTagModel,
          include: [
            {
              model: TagsModel,
            },
          ],
        },
      ],
      order: [[sortColumn, sort]],
      // offset: (page - 1) * size,
      // limit: +size,
    });
    if (client) {
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Get assets and assets count in risk cost factor`,
          user_id: client?.client_id,
        },
        getAssetsbyTag.status.getAssetsByTagSuccessfully.code,
        null
      );
    }
    const totalCount = await assetSQLModel
      .findAll({
        where: filterObj,
        include: [
          {
            model: AssetTagModel,
            where: includeFilterObj,
            required: true,
          },
        ],
      })
      .then((resul) => resul.length ?? 0);
    return Promise.resolve({ assets: response, totalCount });
  } catch (err) {
    if (client) {
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Get assets and assets count in risk cost factor`,
          user_id: client?.client_id,
        },
        getAssetsbyTag.status.getAssetsByTagFailed.code,
        null,
        err.message
      );
    }
    return Promise.reject(err);
  }
};

export const existRiskCostFactor = async (tag_ids, company_id) => {
  try {
    const existData = null;
    const riskCostFactorData = await riskCostFactorSQLModel.findAll({
      where: {
        company_id,
      },
      include: [
        {
          model: riskCostFactorSelectedTagsModel,
          where: {
            tag_id: {
              [Op.in]: tag_ids,
            },
          },
          required: true,
        },
      ],
    });
    if (riskCostFactorData.length) {
      for (const riskCostFactor of riskCostFactorData) {
        const tagIds = [];
        const riskCostFactorTagCount = await riskCostFactorSelectedTagsModel
          .findAndCountAll({
            where: {
              risk_cost_factor_id: riskCostFactor.dataValues.id,
            },
          })
          .then((resp) => resp.rows.length);
        for (const tagId of tag_ids) {
          const selectedTagData = await riskCostFactorSelectedTagsModel.findOne(
            {
              where: {
                tag_id: tagId,
                risk_cost_factor_id: riskCostFactor.dataValues.id,
              },
            }
          );
          if (selectedTagData) {
            tagIds.push(tagId);
          }
        }
        if (
          tagIds.length === tag_ids.length &&
          tag_ids.length === riskCostFactorTagCount
        ) {
          return Promise.resolve(riskCostFactor);
        }
      }
    } else {
      return Promise.resolve(existData);
    }
    return Promise.resolve(existData);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const createRiskCostFactor = async (
  payload,
  clientDetails,
  transactionObj
) => {
  try {
    const riskCostFactorData = await riskCostFactorSQLModel.create(
      payload,
      transactionObj
    );
    clientDetails.target_id = riskCostFactorData.id;
    clientDetails.effected_table = riskCostFactorSQLModel.tableName;
    if (clientDetails) {
      await addEventLog(
        { ...clientDetails, user_id: clientDetails.id },
        createCostFactor.status.createCostFactorSuccessfully.code,
        createEventPayload(
          {},
          JSON.parse(JSON.stringify(payload)),
          riskCostFactorSQLModel.tableName
        )
      );
    }
    return riskCostFactorData;
  } catch (error) {
    if (clientDetails) {
      await addEventLog(
        { ...clientDetails, user_id: clientDetails.id },
        createCostFactor.status.createCostFactorFailed.code,
        null,
        error.message
      );
    }
    errorHandler(error);
    return false;
  }
};

export const getAllRiskCostFactors = async (
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

  if (page && size) {
    pageObj.offset = (page - 1) * size;
    pageObj.limit = +size;
  }

  const riskCostFactorData = await riskCostFactorSQLModel.findAll({
    where: {
      company_id,
    },
    include: [
      {
        model: riskCostFactorSelectedAssetsModel,
        include: [
          {
            model: assetSQLModel,
          },
        ],
      },
      {
        model: riskCostFactorSelectedTagsModel,
        include: [
          {
            model: TagsModel,
            where: filterObj,
            required: filterRequired,
          },
        ],
      },
      {
        model: riskCostFactorOtherCostsModel,
        include: [
          {
            model: riskCostFactorAttributesModel,
          },
        ],
      },
    ],
    order: [[sortColumn, sort]],
    // offset: (page - 1) * size,
    // limit: +size,
    ...pageObj,
  });

  const totalCount = await riskCostFactorSQLModel
    .findAndCountAll({
      where: {
        company_id,
      },
      include: [
        {
          model: riskCostFactorSelectedTagsModel,
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
  if (size) {
    totalPage =
      totalCount % size > 0
        ? Math.floor(totalCount / size) + 1
        : Math.floor(totalCount / size);
  }

  return { riskCostFactorData, totalCount, totalPage };
};

export const findRiskCostFactorById = async (id) => {
  const riskCostFactorData = await riskCostFactorSQLModel.findOne({
    where: {
      id,
    },
    include: [
      {
        model: riskCostFactorSelectedAssetsModel,
        include: [
          {
            model: assetSQLModel,
          },
        ],
      },
      {
        model: riskCostFactorSelectedTagsModel,
      },
    ],
  });
  return riskCostFactorData;
};

export const deleteRiskCostFactorByID = async (
  riskCostFactorData,
  clientDetails,
  res
) => {
  try {
    await riskCostFactorSQLModel.destroy({
      where: { id: riskCostFactorData?.dataValues?.id },
    });

    await addEventLog(
      { ...clientDetails, user_id: clientDetails.id },
      deletecostFactor.status.deleteCostFactorSuccessfully.code,
      null
    );
    return res.status(StatusCodes.OK).json({
      valid: true,
      message: "Risk Cost Factor deleted successfully",
    });
  } catch (error) {
    errorHandler(error);
    await addEventLog(
      { ...clientDetails, user_id: clientDetails.id },
      deletecostFactor.status.deleteCostFactorFailed.code,
      null,
      error.message
    );
  }
};

export const updateRiskCostFactor = async (
  payload,
  id,
  clientDetails,
  transactionObj
) => {
  try {
    await riskCostFactorSQLModel.update(payload, {
      where: { id },
      ...transactionObj,
    });
    const riskCostFactorData = riskCostFactorSQLModel.findOne({
      where: {
        id,
      },
    });
    clientDetails.target_id = id;
    clientDetails.effected_table = riskCostFactorSQLModel.tableName;
    // Event Logs Handler
    await addEventLog(
      { ...clientDetails },
      UpdateRiskCostFactor.status.updateRiskCostFactorSuccessfully.code,
      createEventPayload(
        {},
        JSON.parse(JSON.stringify(payload)),
        riskCostFactorSQLModel.tableName
      )
    );
    return riskCostFactorData;
  } catch (error) {
    // Event Logs Handler
    await addEventLog(
      { ...clientDetails, user_id: null },
      UpdateRiskCostFactor.status.updateRiskCostFactorFailed.code,
      null,
      error.message
    );
    // return error.message;
    return false;
  }
};

export const updateRiskCostFactorsAssetsCount = async (company_id) => {
  try {
    const riskCostFactorsData = await riskCostFactorSQLModel.findAll({
      where: {
        company_id,
      },
      include: [
        {
          model: riskCostFactorSelectedTagsModel,
          attributes: ["tag_id"],
        },
      ],
    });
    
    const SourceValidation = await getSourceValidation(
      company_id,
      []
    );

    if(riskCostFactorsData.length > 0){
      for await (const riskCostFactorData of riskCostFactorsData) {            
        const tag_ids = [];
        if (riskCostFactorData.risk_cost_factor_selected_tags.length > 0) {
          await riskCostFactorData.risk_cost_factor_selected_tags.map(
            async (u) => {
              tag_ids.push(u.dataValues.tag_id);
            }
          );
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
        })
         
          riskCostFactorSelectedAssetsModel.destroy({
            where: { risk_cost_factor_id: riskCostFactorData.id },
          })
          
          const assetTagIds = [];
          if (AssetTags.length > 0) {
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
                  risk_cost_factor_id: riskCostFactorData.id,
                  company_id,
                };
                await riskCostFactorSelectedAssetsModel
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
  } catch (error) {
    errorHandler(error);
  }
};

export const findRiskCostFactor = async (filter) => {
  const riskCostFactorData = await riskCostFactorSQLModel.findOne({
    where: filter,
  });

  return riskCostFactorData;
};

export const findAndCountRiskCostFactor = async (company_id) => {
  const totalCount = await riskCostFactorSQLModel
    .findAndCountAll({
      where: {
        company_id,
      },
    })
    .then((resp) => resp.rows.length);
  return totalCount;
};

export const updateRiskCostFactorPriorityWise = async (
  risk_cost_factors,
  company_id,
  clientDetails,
  transactionObj
) => {
  try {
    if (risk_cost_factors?.length > 0) {
      for await (const risk_cost_factor of risk_cost_factors) {
        const riskCostFactorData = await riskCostFactorSQLModel.findOne({
          where: {
            id: risk_cost_factor.id,
          },
        });
        if (riskCostFactorData?.id) {
          await riskCostFactorSQLModel.update(
            { priority: risk_cost_factor.priority },
            {
              where: {
                id: risk_cost_factor.id,
                company_id,
              },
              ...transactionObj,
            }
          );

          clientDetails.target_id = riskCostFactorData.id;
          clientDetails.effected_table = riskCostFactorSQLModel.tableName;
          // Event Logs Handler
          await addEventLog(
            { ...clientDetails },
            updateCostFactorPriority.status.updateCostFactorPrioritySuccessfully
              .code,
            createEventPayload(
              {},
              JSON.parse(JSON.stringify(risk_cost_factor)),
              riskCostFactorSQLModel.tableName
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
      updateCostFactorPriority.status.updateCostFactorPriorityFailed.code,
      null,
      error.message
    );
    return false;
  }
};

export const calculateRiskCostFactorFinancialLoss = async (
  id,
  CalcFinancialLossObj
) => {
  try {
    const riskCostFactorData = await findRiskCostFactorById(id);
    // const CalcFinancialLossObj = {};
    
    if(riskCostFactorData?.dataValues?.risk_cost_factor_selected_assets?.length > 0){
      if(riskCostFactorData.dataValues.has_peak_time === "yes"){
        const currentDate = moment().format('MM-DD');
        const rangeStart = moment(riskCostFactorData.dataValues.peak_range_from_date, 'YYYY-MM-DD').format('MM-DD');
        const rangeEnd = moment(riskCostFactorData.dataValues.peak_range_to_date, 'YYYY-MM-DD').format('MM-DD');
        if(currentDate >= rangeStart && currentDate <= rangeEnd){
          CalcFinancialLossObj.peak_range_min = riskCostFactorData.dataValues.peak_range_lower_bound;
          CalcFinancialLossObj.peak_range_mod = (riskCostFactorData.dataValues.peak_range_lower_bound + riskCostFactorData.dataValues.peak_range_upper_bound)/2;
          CalcFinancialLossObj.peak_range_max = riskCostFactorData.dataValues.peak_range_upper_bound;
        }else{
          CalcFinancialLossObj.base_range_min = riskCostFactorData.dataValues.base_range_lower_bound;
          CalcFinancialLossObj.base_range_mod = (riskCostFactorData.dataValues.base_range_lower_bound + riskCostFactorData.dataValues.base_range_upper_bound)/2;
          CalcFinancialLossObj.base_range_max = riskCostFactorData.dataValues.base_range_upper_bound;
        }
      } else {
        CalcFinancialLossObj.base_range_min =
          riskCostFactorData.dataValues.base_range_lower_bound;
        CalcFinancialLossObj.base_range_mod =
          (riskCostFactorData.dataValues.base_range_lower_bound +
            riskCostFactorData.dataValues.base_range_upper_bound) /
          2;
        CalcFinancialLossObj.base_range_max =
          riskCostFactorData.dataValues.base_range_upper_bound;
      }
      for await (const item of riskCostFactorData.dataValues.risk_cost_factor_selected_assets) {
        if(item?.dataValues?.asset_id){
          const filterObj = {};
          filterObj.company_id = riskCostFactorData.dataValues.company_id;
          filterObj.asset_id = item.dataValues.asset_id;
          const assetScoreData = await findAssetScoreByFilter(filterObj)
          // if(assetScoreData){
          CalcFinancialLossObj.patching =
            assetScoreData?.dataValues?.patching_score || 0;
          CalcFinancialLossObj.endpoint =
            assetScoreData?.dataValues?.endpoint_score || 0;
          CalcFinancialLossObj.lifecycle =
            assetScoreData?.dataValues?.lifecycle_score || 0;
          CalcFinancialLossObj.backup =
            assetScoreData?.dataValues?.backup_score || 0;
          // }
          // CalcFinancialLossObj.name = item.dataValues.id;
          CalcFinancialLossObj.name =
            item.dataValues.asset.dataValues.asset_name;
          delete filterObj.company_id;
          const toleranceData = await findRiskToleranceByPriority(filterObj);
          if(toleranceData?.dataValues?.id){
            const financialLossScenarioObj = {};
            financialLossScenarioObj.scenarios = [CalcFinancialLossObj];
            financialLossScenarioObj.tolerance_score =
              toleranceData?.dataValues?.tolerance_score;
            const financialLossResp = await getRiskCostFactorFinancialLossApi(
              financialLossScenarioObj
            );
            if (financialLossResp) {
              filterObj.risk_cost_factor_id = riskCostFactorData.dataValues.id;
              financialLossResp.asset_score = Math.round(financialLossResp?.asset_score);
              financialLossResp.difference_from_baseline = Math.round(financialLossResp?.difference_from_baseline);
              financialLossResp.downtime_cost = Math.round(financialLossResp?.downtime_cost);
              financialLossResp.financial_loss = Math.round(financialLossResp?.financial_loss);
              const updateAssetData = await updateRiskCostFactorsSelectedAsset(filterObj, financialLossResp);
            }
          }
        }
      }
    }
    return false;
  } catch (error) {
    // Event Logs Handler
    errorHandler(error);
    return false;
  }
};

export const findRiskCostFactorByPriority = async (company_id, filter) => {
  const riskCostFactorData = await riskCostFactorSQLModel.findOne({
    where: {
      company_id,
    },
    order: [["priority", "ASC"]],
    include: [
      {
        model: riskCostFactorSelectedAssetsModel,
        where: filter,
      },
    ],
  });
  return riskCostFactorData;
};

export const findAllRiskCostFactors = async (company_id) => {
  const riskCostFactorData = await riskCostFactorSQLModel.findAll({
    where: {
      company_id,
    },
    order: [["priority", "ASC"]],
    attributes: ["id", "company_id", "name", "priority"],
    include: [
      {
        model: riskCostFactorOtherCostsModel,
      },
    ],
  });
  return riskCostFactorData;
};

export const updateRiskCostFactorsTolerance = async (company_id) => {
  const riskCostFactors = await findAllRiskCostFactors(company_id);
  if(riskCostFactors.length){
    for await (const riskCostFactor of riskCostFactors) {
      let CalcFinancialLossObj = {};
      if (riskCostFactor.risk_cost_factor_other_costs.length) {
        for await (const riskCostFactorOtherCost of riskCostFactor.risk_cost_factor_other_costs) {
          CalcFinancialLossObj = await AddAttributeToCalcFinancialLossObj(riskCostFactorOtherCost, CalcFinancialLossObj); 
        }
      }
      const calculateRiskCostFactorFinancialLossData = await calculateRiskCostFactorFinancialLoss(riskCostFactor.id, CalcFinancialLossObj);
    }
  }
};
