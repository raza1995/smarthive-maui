import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import riskCostFactorSelectedTagsModel from "./riskCostFactorSelectedTags.model";

export const addTagsToRiskCostFactor = async (
  tagIds,
  riskCostFactorId,
  company_id,
  clientDetails,
  transactionObj
) => {
  // try {
    if (tagIds.length > 0) {
      for await (const item of tagIds) {
        const payload = {
          tag_id: item,
          risk_cost_factor_id: riskCostFactorId,
          company_id,
        };
        await riskCostFactorSelectedTagsModel
          .create(payload, transactionObj)
          // .then(async (res) => {
          // })
          // .catch((err) => {
          //   console.log("err ========== ");
          //   errorHandler(err);
          //   return err.message;
          // });
      }
    }
    return true;

  // } catch (err) {
  //   errorHandler(err);
  //   return err.message;
  // }
};

export const deleteRiskCostFactorTags = async (
  riskCostFactorId,
  clientDetails,
  res
) => {
  await riskCostFactorSelectedTagsModel.destroy({
    where: { id: riskCostFactorId },
  });
  return true;
};
