import { errorHandler } from "../../utils/errorHandler";
import { findRiskCostFactorAttribute } from "../RiskCostFactorAttributes/riskCostFactorAttributes.service";
import riskCostFactorOtherCostsModel from "./riskCostFactorOtherCosts.model";

export const AddAttributeToCalcFinancialLossObj = async (riskCostFactorOtherCostData, CalcFinancialLossObj) => {
  // console.log("id ========== ", id)
  // const riskCostFactorOtherCostData = await findRiskCostFactorOtherCostById(id);
  // console.log("riskCostFactorOtherCostData ========= ", riskCostFactorOtherCostData, riskCostFactorOtherCostData.risk_cost_factor_attribute_id)
  if(riskCostFactorOtherCostData){
    const filterObj = {};
    filterObj.id = riskCostFactorOtherCostData.risk_cost_factor_attribute_id;
    const riskCostFactorAttributeData = await findRiskCostFactorAttribute(filterObj);
    if(riskCostFactorAttributeData){
      const attributeName = riskCostFactorAttributeData.dataValues.attribute_name.replace(" ","_");
      const attributeNameMin = `${attributeName}_min`;
      const attributeNameMax = `${attributeName}_max`;
      const attributeNameMod = `${attributeName}_mod`;
      CalcFinancialLossObj[attributeNameMin] = parseInt(riskCostFactorOtherCostData.lower_bound,10);
      CalcFinancialLossObj[attributeNameMax] = parseInt(riskCostFactorOtherCostData.upper_bound,10);
      CalcFinancialLossObj[attributeNameMod] = (parseInt(riskCostFactorOtherCostData.lower_bound,10) + parseInt(riskCostFactorOtherCostData.upper_bound,10))/2;
    }
  }
  return CalcFinancialLossObj;
};

export const addOtherCostsToRiskCostFactor = async (
  otherCosts,
  riskCostFactorId,
  company_id,
  clientDetails,
  transactionObj,
  CalcFinancialLossObj
) => {
  // try {
    if (otherCosts.length > 0) {
      for await (const item of otherCosts) {
        const payload = {
          risk_cost_factor_id: riskCostFactorId,
          risk_cost_factor_attribute_id: item.risk_cost_factor_attribute_id,
          lower_bound: item.lower_bound,
          upper_bound: item.upper_bound,
        };
        const riskCostFactorOtherCostResponse =
          await riskCostFactorOtherCostsModel
            .create(payload, transactionObj)
            .then(async (res) => {
              // console.log("res ========= ", res);
              const filterObj = {};
              filterObj.id = item.risk_cost_factor_attribute_id;
              await AddAttributeToCalcFinancialLossObj(res, CalcFinancialLossObj);
              // const riskCostFactorAttributeData = await findRiskCostFactorAttribute(filterObj);
              // if(riskCostFactorAttributeData){
              //   const attributeName = riskCostFactorAttributeData.dataValues.attribute_name.replace(" ","_");
              //   const attributeNameMin = `${attributeName}_min`;
              //   const attributeNameMax = `${attributeName}_max`;
              //   const attributeNameMod = `${attributeName}_mod`;
              //   CalcFinancialLossObj[attributeNameMin] = parseInt(item.lower_bound,10);
              //   CalcFinancialLossObj[attributeNameMax] = parseInt(item.upper_bound,10);
              //   CalcFinancialLossObj[attributeNameMod] = (parseInt(item.lower_bound,10) + parseInt(item.upper_bound,10))/2;
              // }

            })
            // .catch((err) => {
            //   errorHandler(err);
            // });
      }
    }
    return CalcFinancialLossObj;
  // } catch (err) {
  //   errorHandler(err);
  //   return err.message;
  // }
};

export const deleteRiskCostFactorOtherCosts = async (riskCostFactorId) => {
  await riskCostFactorOtherCostsModel.destroy({
    where: { 	risk_cost_factor_id: riskCostFactorId },
  });
  return true;
};

export const findRiskCostFactorOtherCostById = async (id) => {
  const riskCostFactorOtherCostData = await riskCostFactorOtherCostsModel.findOne({
    where: { id },
  });
  // console.log("data =========== ", riskCostFactorOtherCostData)
  return riskCostFactorOtherCostData;
};


