import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import riskToleranceSettingsModel from "./riskToleranceSettings.model";
import { getIntegrationByFilter } from "../Integration/integration.service";
import { assetType, integrationCategoryType, toleranceType } from "../../utils/constants";

export const addSettingsToRiskTolerance = async (
  settings,
  riskTolerance,
  company_id,
  clientDetails,
  transactionObj
) => {
  try {
    const calcToleranceObj = {};
    if (settings.length > 0) {
      for await (const item of settings) {
        const existIntegration = await getIntegrationByFilter({company_id, integration_category_type: item.integration_type});
        // if(!existIntegration){
        //   return false;
        // }
        let score = 0;
        if(item.condition === toleranceType.optimal){
          score = 850;
        }else{
          if(item.integration_type === integrationCategoryType.patching){
            if(item.condition_value > 3){
              score = 0;
            }else if(item.condition_value <= 3 && item.condition_value >= 2){
              score = 585;
            }else if(item.condition_value < 2 && item.condition_value >= 1){
              score = 625;
            }else{
              score = 850;
            }
          }
          if(item.integration_type === integrationCategoryType.endpoint){
            if(item.condition_value <= 3){
              score = 850;
            }else if(item.condition_value > 3 && item.condition_value <= 6){
              score = 750;
            }else if(item.condition_value > 6){
              score = 350;
            }
          }
          if(item.integration_type === integrationCategoryType.backup){
            if(item.condition_value >= 8){
              score = 575;
            }else if(item.condition_value >= 4 && item.condition_value < 8){
              score = 630;
            }else if(item.condition_value <= 3){
              score = 850;
            }
          }
          if(item.integration_type === integrationCategoryType.lifecycle){
            if(item.condition_value === 0){
              score = 850;
            }else if(item.condition_value > 0 && riskTolerance.asset_type === assetType.network){
              score = 350;
            }else if(item.condition_value > 0 && riskTolerance.asset_type === assetType.nonNetwork){
              score = 710;
            }
          }
        }
        // console.log("riskTolerance =========== ", riskTolerance, riskTolerance.id)
        const payload = {
          risk_tolerance_id: riskTolerance.id,
          integration_type: item.integration_type,
          condition: item.condition,
          condition_value: item.condition === toleranceType.tolerance ? item.condition_value : null,
          score
        };
        const riskToleranceOtherCostResponse =
          await riskToleranceSettingsModel
            .create(payload, transactionObj)
            // .then(async (res) => {
            //   console.log("response ------ ");
            // })
            // .catch((err) => {
            //   errorHandler(err);
            // });
        const integration = item.integration_type.toLowerCase();
        calcToleranceObj[integration] = score;
      }
    }
    // calcToleranceObj[integrationCategoryType.backup.toLowerCase()] = 0;
    calcToleranceObj[integrationCategoryType.lifecycle.toLowerCase()] = 0;
    return calcToleranceObj;
  } catch (err) {
    errorHandler(err);
    // return err.message;
    return false;
  }
};

export const deleteRiskToleranceSettings = async (riskToleranceId) => {
  await riskToleranceSettingsModel.destroy({
    where: { 	risk_tolerance_id: riskToleranceId },
  });
  return true;
};
