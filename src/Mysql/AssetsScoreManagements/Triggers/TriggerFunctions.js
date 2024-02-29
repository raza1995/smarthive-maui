import { Op } from "sequelize";
import { createCustomWeightageAssetsScore } from "../assetsCustomWeightageScore/assetsCustomWeightageScore.controller";
import assetsScoreWeightageModel from "../assetsScoreWeightage/assetsScoreWeightage.model";


// this function is develop to update and add assets score on any change in assets that relate with assets custom score
export const assetsScoreWeightagesScoresUpdateTrigger = async (
  company_id,
  filter
) => {
  const query = {};
  const weightages = await assetsScoreWeightageModel.findAll({
    where: {
      company_id,
      ...query,
    },
    attributes: ["id"],
  });
  console.log("total weightage ", weightages.length);
  for await (const weightage of weightages) {
    await createCustomWeightageAssetsScore(weightage.id);
  }
};
