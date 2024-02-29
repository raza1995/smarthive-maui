import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { errorHandler } from "../../utils/errorHandler";
import { getRiskCostFactorListing } from "../Logs/ActivitiesType/RiskCostFactorActivities";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import { createRiskCostFactorAttribute, findRiskCostFactorAttribute, getAllRiskCostFactorAttributes } from "../RiskCostFactorAttributes/riskCostFactorAttributes.service";
import { addOtherCostsToRiskCostFactor, deleteRiskCostFactorOtherCosts } from "../RiskCostFactorOtherCosts/riskCostFactorOtherCosts.service";
import {
  addAssetsToRiskCostFactor,
  deleteRiskCostFactorAssets,
  getAllRiskCostFactorSelectedAssets,
} from "../RiskCostFactorSelectedAssets/riskCostFactorSelectedAssets.service";
import {
  addTagsToRiskCostFactor,
  deleteRiskCostFactorTags,
} from "../RiskCostFactorSelectedTags/riskCostFactorSelectedTags.service";
import {
  calculateRiskCostFactorFinancialLoss,
  createRiskCostFactor,
  deleteRiskCostFactorByID,
  existRiskCostFactor,
  findAndCountRiskCostFactor,
  findRiskCostFactor,
  findRiskCostFactorById,
  getAllRiskCostFactors,
  updateRiskCostFactor,
  updateRiskCostFactorPriorityWise,
} from "./riskCostFactor.service";
import sequelize from "../db";
import { updateRiskTolerancePriorityWise } from "../RiskTolerance/riskTolerance.service";
import { getAssetsAndTotalCount } from "../Assets/assets.service";

export const getComparedTagAssets = async (req, res) => {
  try {
    const { user, query, body } = req;
    const { filter, page, size } = query;
    const request = body;
    const { tag_ids } = request;
    const { company_id } = user;
    const existRiskCostFactorData = await existRiskCostFactor(tag_ids,company_id);
    if(existRiskCostFactorData){
      return res
      .status(500)
      .json({ valid: false, data: null, error: "Risk cost factor already exists with the given tags" });
    }
    const assetsAndTotalCount = await getAssetsAndTotalCount(
      tag_ids,
      user,
      page,
      size
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

// export const addNewRiskCostFactor = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const transactionObj = { transaction: t };
//     const { user } = req;
//     const { body } = req;
//     // For logs
//     const clientDetails = {
//       id: user.id,
//       email: user.email,
//       ipAddress: req.socket.remoteAddress,
//       process: "Create Risk Cost Factor",
//       company_id: user.company_id,
//     };
//     const payload = {
//       company_id: user.company_id,
//       // company_id: null,
//       name: body.name.trim(),
//       base_range_lower_bound: body.base_range_lower_bound,
//       base_range_upper_bound: body.base_range_upper_bound,
//       has_peak_time: body.has_peak_time,
//       peak_range_lower_bound: body.peak_range_lower_bound,
//       peak_range_upper_bound: body.peak_range_upper_bound,
//       has_peak_all_days: body.has_peak_all_days,
//       peak_range_from_date: body.peak_range_from_date,
//       peak_range_to_date: body.peak_range_to_date,
//       has_other_costs: body.has_other_costs,
//     };
//     const filterObj = {};
//     filterObj.company_id = user.company_id;
//     filterObj.name = body.name.trim();
    
//     const existRiskCostFactorData = await findRiskCostFactor(filterObj);
//     if(existRiskCostFactorData){
//       return res.status(500).json({
//         message: "Risk cost factor already exists with same name.",
//         valid: false,
//       });  
//     }

//     const riskCostFactorData = await createRiskCostFactor(
//       payload,
//       clientDetails,
//       transactionObj
//     );
//     if(!riskCostFactorData){
//       return res.status(500).json({
//         message: "Something went wrong.",
//         valid: false,
//       });  
//     }
//     await addAssetsToRiskCostFactor(
//       body.asset_ids,
//       riskCostFactorData.id,
//       user.company_id,
//       clientDetails,
//       transactionObj
//     );
//     await addTagsToRiskCostFactor(
//       body.tag_ids,
//       riskCostFactorData.id,
//       user.company_id,
//       clientDetails,
//       transactionObj
//     );
//     if(body?.other_costs?.length){
//       await addOtherCostsToRiskCostFactor(
//         body.other_costs,
//         riskCostFactorData.id,
//         user.company_id,
//         clientDetails,
//         transactionObj
//       );
//     }
//     res.status(200).json({
//       message: "Risk cost factor created successfully",
//       valid: true,
//     });
//     await t.commit();
//   } catch (err) {
//     errorHandler(err);
//     res.status(400).json({ err, message: err.message });
//     await t.rollback();
//   }
// };

export const addNewRiskCostFactor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const transactionObj = { transaction: t };
    const { user } = req;
    const { body } = req;
    // console.log("req body ============== ", body)
    // return
    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Create Risk Cost Factor",
      company_id: user.company_id,
    };
    const payload = {
      company_id: user.company_id,
      // company_id: null,
      name: body.name.trim(),
      base_range_lower_bound: body.base_range_lower_bound,
      base_range_upper_bound: body.base_range_upper_bound,
      has_peak_time: body.has_peak_time,
      peak_range_lower_bound: body.peak_range_lower_bound,
      peak_range_upper_bound: body.peak_range_upper_bound,
      has_peak_all_days: body.has_peak_all_days,
      peak_range_from_date: body.peak_range_from_date,
      peak_range_to_date: body.peak_range_to_date,
      has_other_costs: body.has_other_costs,
    };
    let CalcFinancialLossObj = {};
    const filterObj = {};
    filterObj.company_id = user.company_id;
    filterObj.name = body.name.trim();
    
    const existRiskCostFactorData = await findRiskCostFactor(filterObj);
    if(existRiskCostFactorData){      
      return res.status(500).json({
        message: "Risk cost factor already exists with same name.",
        valid: false,
      });  
    }

    const getRiskCostFactorCount = await findAndCountRiskCostFactor(user.company_id);
    const priority = getRiskCostFactorCount + 1;

    const riskCostFactorData = await createRiskCostFactor(
      {
        ...payload,
        priority
      },
      clientDetails,
      transactionObj
    );
    if(!riskCostFactorData){
      return res.status(500).json({
        message: "Something went wrong.",
        valid: false,
      });  
    }
    if(body?.other_costs?.length){
      CalcFinancialLossObj = await addOtherCostsToRiskCostFactor(
        body.other_costs,
        riskCostFactorData.id,
        user.company_id,
        clientDetails,
        transactionObj,
        CalcFinancialLossObj
      );
    }
    await addAssetsToRiskCostFactor(
      body.asset_ids,
      riskCostFactorData.id,
      user.company_id,
      clientDetails,
      transactionObj
    );
    await addTagsToRiskCostFactor(
      body.tag_ids,
      riskCostFactorData.id,
      user.company_id,
      clientDetails,
      transactionObj
    );
    await t.commit();
    // console.log("CalcFinancialLossObj constoller =========== ", CalcFinancialLossObj)
    calculateRiskCostFactorFinancialLoss(riskCostFactorData.id, CalcFinancialLossObj).catch(async (err)=>{
      await t.rollback();
      errorHandler(err);
    })
    res.status(200).json({
      message: "Risk cost factor created successfully",
      valid: true,
    });
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ err, message: err.message });
    await t.rollback();
  }
};

export const riskCostFactorList = async (req, res) => {
  try {
    const { query } = req;
    const { filter, size, page } = query;
    const { user } = req;
    const riskCostFactors = await getAllRiskCostFactors(
      user.company_id,
      filter,
      page,
      size
    );
    res.status(200).json({
      message: "Risk cost factor fetched successfully",
      ...riskCostFactors,
    });
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ err, message: "Something went wrong" });
  }
};

export const deleteRiskCostFactor = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;

    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Delete Risk Cost Factor",
      company_id: user.company_id,
    };
    const riskCostFactor = await findRiskCostFactorById(id);
    if(!riskCostFactor || riskCostFactor.company_id !== user.company_id){
      return res.status(500).json({
        message: "Risk cost factor not associated with this user.",
        valid: false,
      });  
    }
    deleteRiskCostFactorByID(riskCostFactor, clientDetails, res);
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

// export const editRiskCostFactor = async (req, res) => {
//   try {
//     const { user } = req;
//     const { body } = req;
//     const { id } = req.params;
//     // For logs
//     const clientDetails = {
//       id: user.id,
//       email: user.email,
//       ipAddress: req.socket.remoteAddress,
//       process: "Update Risk Cost Factor",
//       company_id: user.company_id,
//     };
//     const payload = {
//       company_id: user.company_id,
//       name: body.name.trim(),
//       base_range_lower_bound: body.base_range_lower_bound,
//       base_range_upper_bound: body.base_range_upper_bound,
//       has_peak_time: body.has_peak_time,
//       peak_range_lower_bound: body.peak_range_lower_bound,
//       peak_range_upper_bound: body.peak_range_upper_bound,
//       has_peak_all_days: body.has_peak_all_days,
//       peak_range_from_date: body.peak_range_from_date,
//       peak_range_to_date: body.peak_range_to_date,
//       has_other_costs: body.has_other_costs,
//     };
//     const riskCostFactor = await findRiskCostFactorById(id);
//     if(!riskCostFactor || riskCostFactor.company_id !== user.company_id){
//       return res.status(500).json({
//         message: "Risk cost factor not associated with this user.",
//         valid: false,
//       });  
//     }
//     const filterObj = {};
//     filterObj.company_id = user.company_id;
//     filterObj.name = body.name.trim();
//     if (id) {
//       filterObj.id = { [Op.ne]: id };
//     }
//     const existRiskCostFactorData = await findRiskCostFactor(filterObj);
//     if(existRiskCostFactorData){
//       return res.status(500).json({
//         message: "Risk cost factor already exists with same name.",
//         valid: false,
//       });  
//     }
//     await updateRiskCostFactor(payload, id, clientDetails);
//     await deleteRiskCostFactorOtherCosts(id);
//     if(body?.other_costs?.length){
//       await addOtherCostsToRiskCostFactor(
//         body.other_costs,
//         id,
//         user.company_id,
//         clientDetails
//       );
//     }
//     res.status(200).json({
//       message: "Risk cost factor updated successfully",
//       valid: true,
//     });
//   } catch (err) {
//     errorHandler(err);
//     res.status(400).json({ err, message: "Something went wrong" });
//   }
// };

export const editRiskCostFactor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // const result = await sequelize.transaction(async (t) => {
      const transactionObj = { transaction: t };
      const { user } = req;
      const { body } = req;
      const { id } = req.params;
      // For logs
      const clientDetails = {
        id: user.id,
        email: user.email,
        ipAddress: req.socket.remoteAddress,
        process: "Update Risk Cost Factor",
        company_id: user.company_id,
      };
      const payload = {
        company_id: user.company_id,
        name: body.name.trim(),
        base_range_lower_bound: body.base_range_lower_bound,
        base_range_upper_bound: body.base_range_upper_bound,
        has_peak_time: body.has_peak_time,
        peak_range_lower_bound: body.peak_range_lower_bound,
        peak_range_upper_bound: body.peak_range_upper_bound,
        has_peak_all_days: body.has_peak_all_days,
        peak_range_from_date: body.peak_range_from_date,
        peak_range_to_date: body.peak_range_to_date,
        has_other_costs: body.has_other_costs,
      };
      let CalcFinancialLossObj = {};
      const riskCostFactor = await findRiskCostFactorById(id);
      if(!riskCostFactor || riskCostFactor.company_id !== user.company_id){
        return res.status(500).json({
          message: "Risk cost factor not associated with this user.",
          valid: false,
        });  
      }
      const filterObj = {};
      filterObj.company_id = user.company_id;
      filterObj.name = body.name.trim();
      if (id) {
        filterObj.id = { [Op.ne]: id };
      }
      const existRiskCostFactorData = await findRiskCostFactor(filterObj);
      if(existRiskCostFactorData){
        return res.status(500).json({
          message: "Risk cost factor already exists with same name.",
          valid: false,
        });  
      }
      await updateRiskCostFactor(payload, id, clientDetails, transactionObj);
      await deleteRiskCostFactorOtherCosts(id);
      if(body?.other_costs?.length){
        CalcFinancialLossObj = await addOtherCostsToRiskCostFactor(
          body.other_costs,
          id,
          user.company_id,
          clientDetails,
          transactionObj,
          CalcFinancialLossObj
        );
      }
      await t.commit();
      // console.log("CalcFinancialLossObj constoller =========== ", CalcFinancialLossObj)
       calculateRiskCostFactorFinancialLoss(id, CalcFinancialLossObj).catch(async (err)=>{
        await t.rollback();
        errorHandler(err);
      })
      res.status(200).json({
        message: "Risk cost factor updated successfully",
        valid: true,
      });
    // });
  } catch (err) {
    errorHandler(err);
    res.status(400).json({ err, message: "Something went wrong" });
    await t.rollback();
  }
};

export const riskCostFactorAttributes = async (req, res) => {
  try {
    const { query } = req;
    const { filter, size, page } = query;
    const { user } = req;
    const riskCostFactorAttributesData = await getAllRiskCostFactorAttributes(
      user.company_id
    );
    res.status(200).json({
      message: "Risk cost factor attributes fetched successfully",
      ...riskCostFactorAttributesData,
    });
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ err, message: "Something went wrong" });
  }
};

export const addNewRiskCostFactorAttribute = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const transactionObj = { transaction: t };
      const { user } = req;
      const { body } = req;
      // For logs
      const clientDetails = {
        id: user.id,
        email: user.email,
        ipAddress: req.socket.remoteAddress,
        process: "Create Risk Cost Factor Attribute",
        company_id: user.company_id,
      };
      const payload = {
        company_id: user.company_id,
        attribute_name: body.attribute_name.trim()
      };
      const existRiskCostFactorAttribute = await findRiskCostFactorAttribute(payload);
      if(existRiskCostFactorAttribute){
        return res.status(500).json({
          message: "Risk cost factor attribute already exists with same name.",
          valid: false,
        });  
      }
      payload.description = body.description.trim();
      const riskCostFactorAttributeData = await createRiskCostFactorAttribute(
        payload,
        clientDetails,
        transactionObj
      );
      res.status(200).json({
        message: "Risk cost factor attribute created successfully",
        valid: true,
        ...riskCostFactorAttributeData
      });
    });
  } catch (err) {
    res.status(400).json({ err, message: err.message });
  }
};

export const riskCostFactorSelectedAssetsList = async (req, res) => {
  try {
    const { query, user, params } = req;
    const { filter, size, page } = query;
    const { risk_cost_factor_id } = params;
    const riskCostFactorSelectedAssets = await getAllRiskCostFactorSelectedAssets(
      risk_cost_factor_id,
      filter,
      page,
      size
    );
    res.status(200).json({
      message: "Risk cost factor selected assets fetched successfully",
      ...riskCostFactorSelectedAssets,
    });
  } catch (err) {
    errorHandler(err);
    return res.status(400).json({ err, message: "Something went wrong" });
  }
};

export const updateRiskCostFactorPriority = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const transactionObj = { transaction: t };
    const { user, body } = req;
    const { risk_cost_factors } = body;
    // For logs
    const clientDetails = {
      id: user.id,
      email: user.email,
      ipAddress: req.socket.remoteAddress,
      process: "Update Risk Cost Factor Priority",
      company_id: user.company_id,
    };
    await updateRiskCostFactorPriorityWise(risk_cost_factors, user.company_id, clientDetails, transactionObj);
    await t.commit();
    res.status(200).json({
      message: "Risk cost factor priority updated successfully",
      valid: true,
    });
  } catch (err) {
    await t.rollback();
    errorHandler(err);
    res.status(400).json({ err, message: "Something went wrong" });
  }
};

