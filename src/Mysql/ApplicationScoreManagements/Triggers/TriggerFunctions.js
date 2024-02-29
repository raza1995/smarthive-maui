import { Op } from "sequelize";
// eslint-disable-next-line import/no-cycle
import { createApplicationCustomWeightageSecretsScore } from "../ApplicationCustomWeightageScore/ApplicationCustomWeightageScore.controller";
import ApplicationScoreWeightageModel from "../ApplicationScoreWeightage/ApplicationScoreWeightage.model";

// this function is develop to update and add assets score on any change in assets that relate with assets custom score
export const ApplicationsScoreWeightagesScoresUpdateTrigger = async (
  company_id,
  filter
) => {
  const query = {};
  const weightages = await ApplicationScoreWeightageModel.findAll({
    where: {
      company_id,
      ...query,
    },
    attributes: ["id"],
  });
  console.log("total weightage ", weightages.length);
  for await (const weightage of weightages) {
    await createApplicationCustomWeightageSecretsScore(weightage.id);
  }
};
