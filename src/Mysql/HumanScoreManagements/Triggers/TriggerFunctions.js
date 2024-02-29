import { Op } from "sequelize";
import { createHumanCustomWeightageSecretsScore } from "../HumanCustomWeightageScore/HumanCustomWeightageScore.controller";
import HumanScoreWeightageModel from "../HumanScoreWeightage/HumanScoreWeightage.model";

// this function is develop to update and add assets score on any change in assets that relate with assets custom score
export const HumansScoreWeightagesScoresUpdateTrigger = async (
  company_id,
  filter
) => {
  const query = {};
  const weightages = await HumanScoreWeightageModel.findAll({
    where: {
      company_id,
      ...query,
    },
    attributes: ["id"],
  });
  console.log("total weightage ", weightages.length);
  for await (const weightage of weightages) {
    await createHumanCustomWeightageSecretsScore(weightage.id);
  }
};
