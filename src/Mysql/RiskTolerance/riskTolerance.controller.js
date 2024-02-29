import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import { getAssetsAndTotalCount, getGroupAssetSubTypesWithCount, getGroupAssetTypesWithCount } from "../Assets/assets.service";
import { getGroupAssetTags } from "../AssetTags/assetTags.service";
import sequelize from "../db";
import { addAssetsToRiskTolerance, deleteRiskToleranceAssets } from "../RiskToleranceSelectedAssets/riskToleranceSelectedAssets.service";
import { addTagsToRiskTolerance, deleteRiskToleranceTags } from "../RiskToleranceSelectedTags/riskToleranceSelectedTags.service";
import { addSettingsToRiskTolerance, deleteRiskToleranceSettings } from "../RiskToleranceSettings/riskToleranceSettings.service";
import { createRiskTolerance, deleteRiskToleranceByID, existRiskTolerance, findAndCountRiskTolerance, findRiskTolerance, findRiskToleranceById, getAllRiskTolerances, updateRiskTolerance, updateRiskTolerancePriorityWise } from "./riskTolerance.service";
import { getRiskCostToleranceScoreApi } from "../../api/riskCost";
import { calculateRiskCostFactorFinancialLoss, findAllRiskCostFactors, updateRiskCostFactorsTolerance } from "../RiskCostFactor/riskCostFactor.service";
import { AddAttributeToCalcFinancialLossObj } from "../RiskCostFactorOtherCosts/riskCostFactorOtherCosts.service";

export const getComparedTagAssets = async (req, res) => {
  try {
    const { user, query, body } = req;
    const { page, size } = query;
    const { tag_ids, asset_type } = body;
    const { company_id } = user;
    const existRiskToleranceData = await existRiskTolerance(tag_ids,company_id);
    if(existRiskToleranceData && !body.id){
      return res
      .status(500)
      .json({ valid: false, data: null, error: "Risk tolerance already exists with the given tags" });
    }
    const assetsAndTotalCount = await getAssetsAndTotalCount(
      tag_ids,
      user,
      page,
      size,
      asset_type
    );
    return res.json({
      valid: true,
      data: assetsAndTotalCount.assets,
      totalCount: assetsAndTotalCount.totalCount,
    });
  } catch (error) {
    errorHandler(error);
    return res
      .status(500)
      .json({ valid: false, data: null, error: error.message });
  }
};

export const getAssetTypes = async (req, res) => {
  try {
    const { user} = req;
    const { company_id } = user;
    const filterObj = {};
    filterObj.company_id = company_id;
    const assetData = await getGroupAssetTypesWithCount(filterObj);
    return res.json({
      valid: true,
      data: assetData,
    });
  } catch (error) {
    errorHandler(error);
    return res
      .status(500)
      .json({ valid: false, data: null, error: error.message });
  }
};

export const getAssetSubTypes = async (req, res) => {
  try {
    const { user, params} = req;
    const { company_id } = user;
    const { asset_type } = params;
    const filterObj = {};
    filterObj.company_id = company_id;
    filterObj.asset_type = asset_type;
    const assetData = await getGroupAssetSubTypesWithCount(filterObj);
    return res.json({
      valid: true,
      data: assetData,
    });
  } catch (error) {
    errorHandler(error);
    return res
      .status(500)
      .json({ valid: false, data: null, error: error.message });
  }
};

export const getAssetTags = async (req, res) => {
  try {
    const { user, params} = req;
    const { company_id } = user;
    const { asset_type } = params;
    const filterObj = {};
    filterObj.company_id = company_id;
    filterObj.asset_type = asset_type;
    const assetData = await getGroupAssetTags(filterObj);
    return res.json({
      valid: true,
      data: assetData,
    });
  } catch (error) {
    errorHandler(error);
    return res
      .status(500)
      .json({ valid: false, data: null, error: error.message });
  }
};

export const addNewRiskTolerance = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const transactionObj = { transaction: t };
    const { user } = req;
    const { body } = req;
    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Create Risk Tolerance",
      company_id: user.company_id,
    };
    const payload = {
      company_id: user.company_id,
      // company_id: null,
      name: body.name.trim(),
      asset_type: body.asset_type,
    };
    const filterObj = {};
    filterObj.company_id = user.company_id;
    filterObj.name = body.name.trim();
    
    const existRiskToleranceData = await findRiskTolerance(payload);
    if(existRiskToleranceData){
      return res.status(500).json({
        message: "Risk tolerance already exists with same name.",
        valid: false,
      });  
    }

    // delete filterObj.name;
    // const orderObj = {};
    // orderObj.order = [["priority", "DESC"]];
    // const getLastPriorityRiskTolerance = await findRiskTolerance(filterObj, orderObj);
    // const priority = getLastPriorityRiskTolerance?.dataValues?.priority
    // ? (getLastPriorityRiskTolerance?.dataValues?.priority || 0) + 1
    // : 1; 

    const getRiskToleranceCount = await findAndCountRiskTolerance(user.company_id);
    const priority = getRiskToleranceCount + 1;

    const riskToleranceData = await createRiskTolerance(
      {
        ...payload,
        priority
      },
      clientDetails,
      transactionObj
    );
    if(!riskToleranceData){
      return res.status(500).json({
        message: "Something went wrong.",
        valid: false,
      });  
    }
    if(body?.asset_ids?.length){
      await addAssetsToRiskTolerance(
        body.asset_ids,
        riskToleranceData.id,
        user.company_id,
        clientDetails,
        transactionObj
      );
    }
    if(body?.tag_ids?.length){
      await addTagsToRiskTolerance(
        body.tag_ids,
        riskToleranceData.id,
        user.company_id,
        clientDetails,
        transactionObj
      );
    }
    if(body?.settings?.length){
      const addSettings = await addSettingsToRiskTolerance(
        body.settings,
        riskToleranceData,
        user.company_id,
        clientDetails,
        transactionObj
      );
      if(!addSettings){
        return res.status(500).json({
          message: "Something went wrong.",
          valid: false,
        });  
      }
      const tolerance_score = await getRiskCostToleranceScoreApi(addSettings)
      await updateRiskTolerance({tolerance_score}, riskToleranceData.id, null, transactionObj);
    }
    updateRiskCostFactorsTolerance(user.company_id);
    res.status(200).json({
      message: "Risk tolerance created successfully",
      valid: true,
    });
    await t.commit();
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ err, message: err.message });
    await t.rollback();
  }
};

export const riskToleranceList = async (req, res) => {
  try {
    const { query } = req;
    const { filter, size, page } = query;
    const { user } = req;
    const riskTolerances = await getAllRiskTolerances(
      user.company_id,
      filter,
      page,
      size
    );
    res.status(200).json({
      message: "Risk tolerance fetched successfully",
      ...riskTolerances,
    });
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ err, message: "Something went wrong" });
  }
};

export const deleteRiskTolerance = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;

    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Delete Risk Tolerance",
      company_id: user.company_id,
    };
    const riskTolerance = await findRiskToleranceById(id);
    if(!riskTolerance || riskTolerance.company_id !== user.company_id){
      return res.status(500).json({
        message: "Risk tolerance not associated with this user.",
        valid: false,
      });  
    }
    await deleteRiskToleranceByID(riskTolerance, clientDetails, res);
    updateRiskCostFactorsTolerance(user.company_id);
    res.status(200).json({
      message: "Risk tolerance deleted successfully",
      valid: true,
    });
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ err, message: "Something went wrong" });
  }
};


// View Detail of Risk cost factor by id
// export const fetchCostFactorDetail = async (req, res) => {
//   try {
//     const { user } = req;
//     const body = req.params;
//     // For logs
//     const clientDetails = {
//       id: user.id,
//       email: user.email,
//       ipAddress: req.socket.remoteAddress,
//       process: "View Detail of Risk Cost Factor",
//       company_id: user.company_id,
//     };
//     const riskCostFactor = await findRiskCostFactorById(body.id);

//     return res.status(StatusCodes.ACCEPTED).json({
//       valid: true,
//       message: "Risk Cost Factor details fetched successfully",
//       riskCostFactor
//     });

//   } catch (err) {
//     errorHandler(err);
//     res.status(400).json({ err, message: "Something went wrong" });
//   }
// }

export const editRiskTolerance = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const transactionObj = { transaction: t };
    const { user } = req;
    const { body } = req;
    const { id } = req.params;
    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Update Risk Tolerance",
      company_id: user.company_id,
    };
    const payload = {
      company_id: user.company_id,
      name: body.name.trim(),
      asset_type: body.asset_type,
    };
    const riskTolerance = await findRiskToleranceById(id);
    if(!riskTolerance || riskTolerance.company_id !== user.company_id){
      return res.status(500).json({
        message: "Risk tolerance not associated with this user.",
        valid: false,
      });  
    }
    const filterObj = {};
    filterObj.company_id = user.company_id;
    filterObj.name = body.name.trim();
    filterObj.asset_type = body.asset_type;
    if (id) {
      filterObj.id = { [Op.ne]: id };
    }
    const existRiskToleranceData = await findRiskTolerance(filterObj);
    if(existRiskToleranceData){
      return res.status(500).json({
        message: "Risk tolerance already exists with same name.",
        valid: false,
      });  
    }
    await updateRiskTolerance(payload, id, clientDetails, transactionObj);
    await deleteRiskToleranceAssets(id);
    if(body?.asset_ids?.length){
      await addAssetsToRiskTolerance(
        body.asset_ids,
        id,
        user.company_id,
        clientDetails,
        transactionObj
      );
    }
    await deleteRiskToleranceTags(id);
    if(body?.tag_ids?.length){
      await addTagsToRiskTolerance(
        body.tag_ids,
        id,
        user.company_id,
        clientDetails,
        transactionObj
      );
    }
    await deleteRiskToleranceSettings(id);
    if(body?.settings?.length){
      const addSettings = await addSettingsToRiskTolerance(
        body.settings,
        riskTolerance.dataValues,
        user.company_id,
        clientDetails,
        transactionObj
      );
      if(!addSettings){
        return res.status(500).json({
          message: "Something went wrong.",
          valid: false,
        });  
      }
      const tolerance_score = await getRiskCostToleranceScoreApi(addSettings)
      // console.log("tolerance_score ========== ", addSettings, tolerance_score)
      await updateRiskTolerance({tolerance_score}, riskTolerance.dataValues.id, null, transactionObj);
    }
    await t.commit();
    updateRiskCostFactorsTolerance(user.company_id);
    res.status(200).json({
      message: "Risk tolerance updated successfully",
      valid: true,
    });
  } catch (err) {
    await t.rollback();
    errorHandler(err);
    res.status(400).json({ err, message: "Something went wrong" });
  }
};

export const updateRiskTolerancePriority = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const transactionObj = { transaction: t };
    const { user, body } = req;
    const { tolerances } = body;
    // console.log("here =========== ", tolerances)
    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Update Risk Tolerance Priority",
      company_id: user.company_id,
    };
    await updateRiskTolerancePriorityWise(tolerances, user.company_id, clientDetails, transactionObj);
    await t.commit();
    updateRiskCostFactorsTolerance(user.company_id);
    res.status(200).json({
      message: "Risk tolerance priority updated successfully",
      valid: true,
    });
  } catch (err) {
    await t.rollback();
    errorHandler(err);
    res.status(400).json({ err, message: "Something went wrong" });
  }
};

