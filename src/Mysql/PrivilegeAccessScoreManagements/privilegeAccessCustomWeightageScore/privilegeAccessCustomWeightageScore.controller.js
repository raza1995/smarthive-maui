import { Op } from "sequelize";
import { errorHandler } from "../../../utils/errorHandler";
import { createSecretsCustomScoreActivity } from "../../Logs/ActivitiesType/SecretsActivityType";
import {
  addEventLog,
  createEventPayload,
} from "../../Logs/eventLogs/eventLogs.controller";
import secretsModel from "../../secrets/secret.model";
// eslint-disable-next-line import/no-cycle
import {
  calculateFinalSecretScore,
  getUserSecrets,
} from "../../secrets/secret.service";
import SecretsTypesModel from "../../SecretsTypes/SecretsTypes.model";
import TagsModel from "../../Tags/tags.model";
import privilegeAccessScoreWeightageModel from "../privilegeAccessScoreWeightage/privilegeAccessScoreWeightage.model";
import secretsCustomWeightageScoreModel from "./privilegeAccessCustomWeightageScore.model";

const addCustomScoreInSecretsTable = async (secret_id) => {
  const CustomWeightageScores = await secretsCustomWeightageScoreModel.findAll({
    where: {
      secret_id,
    },
    include: [
      {
        model: privilegeAccessScoreWeightageModel,
        required: true,
      },
    ],
    order: [[privilegeAccessScoreWeightageModel, "priority", "ASC"]],
  });
  return CustomWeightageScores.length > 0
    ? secretsModel.update(
        {
          custom_methodology_risk_score: CustomWeightageScores[0].risk_score,
        },
        {
          where: {
            id: secret_id,
          },
          individualHooks: true,
        }
      )
    : false;
};
const updateAndCreateCustomWeightageSecretsScore = async (
  secret,
  secretsRiskScoresWeightages,
  weightage_id,
  client
) => {
  const risk_score = calculateFinalSecretScore(
    secret?.secrets_strength_score || 0,
    secret?.secrets_upto_date_score || 0,
    secret?.linked_human_score || 0,
    secret?.linked_asset_score || 0,
    secretsRiskScoresWeightages
  );

  const secretsScoreInDb = await secretsCustomWeightageScoreModel.findOne({
    where: {
      secret_id: secret.id,
      weightage_id,
    },
  });
  const secretScore = {
    company_id: secret.company_id,
    weightage_id,
    secret_id: secret.id,
    risk_score,
  };
  if (secretsScoreInDb?.id) {
    await secretsCustomWeightageScoreModel.update(secretScore, {
      where: {
        id: secretsScoreInDb.id,
      },
    });
    if (client) {
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Update "${secret.name}" privilege access custom weightage score`,
          user_id: client?.client_id,
          asset_id: null,
          target_id: secretsScoreInDb.id,
          effected_table: secretsCustomWeightageScoreModel.tableName,
          company_id: secret.company_id,
          isSystemLog: false,
        },
        createSecretsCustomScoreActivity.status.Successfully.code,
        createEventPayload(
          { id: secretsScoreInDb.id, ...secretScore },
          JSON.parse(JSON.stringify(secretsScoreInDb)),
          secretsCustomWeightageScoreModel.tableName
        )
      );
    }
  } else {
    const newScore = await secretsCustomWeightageScoreModel.create(secretScore);
    if (client) {
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Calculate "${secret.name}" privilege access custom weightage score`,
          user_id: client?.client_id,
          asset_id: null,
          target_id: newScore.id,
          effected_table: secretsCustomWeightageScoreModel.tableName,
          company_id: secret.company_id,
          isSystemLog: false,
        },
        createSecretsCustomScoreActivity.status.Successfully.code,
        createEventPayload(
          JSON.parse(JSON.stringify(newScore)),
          {},
          secretsCustomWeightageScoreModel.tableName
        )
      );
    }
  }
  await addCustomScoreInSecretsTable(secret.id);
};

export const createCustomWeightageSecretsScore = async (
  customWeightageId,
  client
) => {
  try {
    const customWeightageData =
      await privilegeAccessScoreWeightageModel.findOne({
        where: {
          id: customWeightageId,
        },
        include: [
          {
            model: SecretsTypesModel,
            through: {
              attributes: [],
            },
            attributes: ["id", "type"],
          },
          {
            model: TagsModel,
            through: {
              attributes: [],
            },
            attributes: ["id", "label"],
          },
        ],
      });
    const secretsLinked = await getUserSecrets(
      customWeightageData.created_by_id,
      1,
      "all",
      customWeightageData.apply_on_all_secrets
        ? {}
        : {
            tags: customWeightageData.tags,
            secrets_types: customWeightageData?.secrets_types?.map(
              (el) => el.type
            ),
          }
    );
    const secretsRiskScoresWeightages = {
      strengthScoreWeightage: customWeightageData.secrets_strength_weightage,
      secretsUptoDateScoreWeightage:
        customWeightageData.secrets_upto_date_weightage,
      humanScoreWeightage: customWeightageData.linked_humans_weightage,
      assetScoreWeightage: customWeightageData.linked_assets_weightage,
    };

    const oldAssetsScore = await secretsCustomWeightageScoreModel.findAll({
      where: {
        weightage_id: customWeightageData.id,
      },
      order: [["updatedAt", "DESC"]],
      limit: 2,
    });
    const lastUpdatedAtDate = oldAssetsScore?.[0]?.updatedAt;
    for await (const secrets of secretsLinked.userSecrets) {
      await updateAndCreateCustomWeightageSecretsScore(
        secrets,
        secretsRiskScoresWeightages,
        customWeightageData.id,
        client
      );
    }
    if (lastUpdatedAtDate) {
      const deleteScore = await secretsCustomWeightageScoreModel.destroy({
        where: {
          weightage_id: customWeightageData.id,
          updatedAt: { [Op.lte]: lastUpdatedAtDate },
        },
      });
      if (deleteScore) console.log("score deleted", deleteScore);
    }
  } catch (err) {
    errorHandler(err);
  }
};

export const sortAssetScores = (
  assets_custom_weightage_scores,
  defaultScore
) => {
  const asset_scores = assets_custom_weightage_scores.sort(
    (a, b) =>
      a.assets_score_weightage.priority - b.assets_score_weightage.priority
  );
  asset_scores.push({
    risk_score: defaultScore?.default_risk_score,
    pure_risk_score: defaultScore?.pure_risk_score,
    assets_score_weightage: {
      name: "Default",
      priority:
        (asset_scores?.[asset_scores.length - 1]?.assets_score_weightage
          ?.priority || 0) + 1,
    },
  });
  return asset_scores;
};
