import { Op } from "sequelize";
import SecretsTypesModel from "../../SecretsTypes/SecretsTypes.model";
import TagsModel from "../../Tags/tags.model";
// eslint-disable-next-line import/no-cycle
import { createCustomWeightageSecretsScore } from "../privilegeAccessCustomWeightageScore/privilegeAccessCustomWeightageScore.controller";
import privilegeAccessScoreWeightageModel from "../privilegeAccessScoreWeightage/privilegeAccessScoreWeightage.model";
import secretsCustomWeightageScoreModel from "../privilegeAccessCustomWeightageScore/privilegeAccessCustomWeightageScore.model";

// this function is develop to update and add secrets score on any change in secrets that relate with secrets custom score
export const privilegeAccessScoreWeightagesScoresUpdateTrigger = async (
  company_id,
  filter
) => {
  const includeModels = [];
  const query = [
    {
      apply_on_all_secrets: true,
    },
  ];
  console.log(filter);
  if (filter?.secrets_type) {
    includeModels.push({
      model: SecretsTypesModel,
      where: {
        type: {
          [Op.like]: `%${filter.secrets_type}%`,
        },
      },
      through: {
        attributes: [],
      },
      required: false,
      attributes: ["id", "type"],
    });
  }
  if (filter?.tags) {
    // query.push(
    //   sequelize.where(sequelize.fn("char", sequelize.col('content')), 1),
    // )
    includeModels.push({
      model: TagsModel,
      where: {
        label: {
          [Op.in]: filter.tags,
        },
      },
      through: {
        attributes: [],
      },
      required: false,
      attributes: ["id", "label"],
    });
  }
  const assetInclude = [];
  if (filter?.secret_ids) {
    assetInclude.push({
      include: secretsCustomWeightageScoreModel,
      where: {
        secret_id: { [Op.in]: filter.secret_ids },
      },
    });
  }
  const weightages = await privilegeAccessScoreWeightageModel.findAll({
    where: {
      company_id,
      // [Op.or]: query,
    },
    include: [...assetInclude],
    // include: includeModels,
    // attributes: [
    //   "id",
    //   // [sequelize.fn("count", sequelize.col("$tags$")), "tags_length"],
    // ],
  });
  console.log("total weightage ", weightages.length);
  for await (const weightage of weightages) {
    await createCustomWeightageSecretsScore(weightage.id);
  }
};
