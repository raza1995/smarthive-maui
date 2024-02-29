import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import riskToleranceSelectedTagsModel from "./riskToleranceSelectedTags.model";

export const addTagsToRiskTolerance = async (
  tagIds,
  riskToleranceId,
  company_id,
  clientDetails,
  transactionObj
) => {
    if (tagIds.length > 0) {
      for await (const item of tagIds) {
        const payload = {
          tag_id: item,
          risk_tolerance_id: riskToleranceId,
          company_id,
        };
        await riskToleranceSelectedTagsModel
          .create(payload, transactionObj)
          // .then(async (res) => {
          //   console.log("res ========== ");
          // })
      }
    }
    return true;

};

export const deleteRiskToleranceTags = async ( riskToleranceId ) => {
  await riskToleranceSelectedTagsModel.destroy({
    where: { risk_tolerance_id: riskToleranceId },
  });
  return true;
};
