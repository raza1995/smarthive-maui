import moment from "moment";
import { Op } from "sequelize";
import { secretsTypes } from "../../utils/constants";
import { secretsRiskScoresWeightages } from "../../utils/Constants/scoreWeightages";
import { errorHandler } from "../../utils/errorHandler";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import AssetSecretsModel from "../AssetsSecrets/AssetsSecrets.model";
import humanSQLModel from "../Human/human.model";
import humanAssetsSQLModel from "../HumanAssets/humanAssets.model";
import humanRiskScoreModel from "../HumanRiskScores/humanRiskScore.model";
import {
  createSecretsActivity,
  updateSecretsActivity,
} from "../Logs/ActivitiesType/SecretsActivityType";
import {
  addEventLog,
  createEventPayload,
} from "../Logs/eventLogs/eventLogs.controller";
import secretsCustomWeightageScoreModel from "../PrivilegeAccessScoreManagements/privilegeAccessCustomWeightageScore/privilegeAccessCustomWeightageScore.model";
import privilegeAccessScoreWeightageModel from "../PrivilegeAccessScoreManagements/privilegeAccessScoreWeightage/privilegeAccessScoreWeightage.model";
// eslint-disable-next-line import/no-cycle
import { privilegeAccessScoreWeightagesScoresUpdateTrigger } from "../PrivilegeAccessScoreManagements/Triggers/TriggerFunctions";
import secretTagsModel from "../SecretTags/secretTags.model";
import {
  getSecretTagsByFilter,
  updateOrCreateSecretTags,
} from "../SecretTags/secretTags.service";
import userModel from "../Users/users.model";
import UserSecretsModel from "../UserSecrets/UserSecrets.model";
import vaultService from "./hashicorpVault/vault.service";
import secretsModel from "./secret.model";

export const getSecretHumanAnsAssetsAvgScore = async (
  secret_id,
  secrets_asset_id
) => {
  const secretLinkedUsers = await UserSecretsModel.findAll({
    where: {
      secret_id,
    },
    attributes: ["id", "access_role"],
    include: [
      {
        model: userModel,
        attributes: ["id", "full_name", "email"],
        include: [
          {
            model: humanSQLModel,
            required: true,
          },
        ],
        required: true,
      },
    ],
  })
    .then((resp) => JSON.parse(JSON.stringify(resp)))
    .catch((err) => {
      errorHandler(err);
      throw Error(err);
    });

  const humansIds = secretLinkedUsers.map(
    (secretsUser) => secretsUser.user.human.id
  );
  const humansAssetIds = await humanAssetsSQLModel
    .findAll({
      where: {
        human_id: { [Op.in]: humansIds },
      },
      attributes: ["asset_id"],
    })
    .then((resp) => resp.map((item) => item.asset_id));
  if (secrets_asset_id) {
    humansAssetIds.push(secrets_asset_id);
  }
  const humanScore =
    (await humanRiskScoreModel.sum("risk_score", {
      where: { human_id: { [Op.in]: humansIds } },
    })) || 0;
  const assetScore =
    (await AssetScoreSQLModel.sum("risk_score", {
      where: { asset_id: { [Op.in]: humansAssetIds } },
    })) || 0;
  const humanAverageScore =
    humansIds.length > 0 ? humanScore / humansIds.length : "N/A";
  const assetsAverageScore =
    humansAssetIds.length > 0 ? assetScore / humansAssetIds.length : "N/A";

  return { humanAverageScore, assetsAverageScore };
};
export const calculateFinalSecretScore = (
  secretsStrengthScore = 0,
  secretsUptoDateScore = 0,
  humanScore = "N/A",
  assetScore = "N/A",
  secretsScoresWeightages
) => {
  let totalScore =
    secretsStrengthScore * secretsScoresWeightages.strengthScoreWeightage +
    secretsUptoDateScore *
      secretsScoresWeightages.secretsUptoDateScoreWeightage;

  let totalWeight =
    secretsScoresWeightages.strengthScoreWeightage +
    secretsScoresWeightages.secretsUptoDateScoreWeightage;
  if (humanScore !== "N/A" && humanScore >= 0) {
    totalScore += humanScore * secretsScoresWeightages.humanScoreWeightage;
    totalWeight += secretsScoresWeightages.humanScoreWeightage;
  }
  if (assetScore !== "N/A" && assetScore >= 0) {
    totalScore += assetScore * secretsScoresWeightages.assetScoreWeightage;
    totalWeight += secretsScoresWeightages.assetScoreWeightage;
  }

  const finalSecretsRiskScore = Math.round(totalScore / totalWeight);
  // console.log({
  //   secretsStrengthScore,
  //   secretsUptoDateScore,
  //   humanScore,
  //   assetScore,
  //   totalScore,
  //   totalWeight,
  //   finalSecretsRiskScore,
  // });
  return finalSecretsRiskScore < 851 ? finalSecretsRiskScore : 850;
};
export const calculateSecretScore = (
  secrets,
  lastUpdatedAt,
  humanScore = "N/A",
  assetScore = "N/A",
  secretsScoresWeightages
) => {
  const lowerCapRegex = /(?=.*[a-z])/gm;
  const upperCapRegex = /(?=.*[A-Z])/gm;
  const spacialCarRegex = /(?=.*[@#$%^&-+=()])/gm;

  const allScore = Object.keys(secrets).map((el) => {
    const password = secrets[el];
    let score = 350;
    const validation = [
      lowerCapRegex.test(password),
      upperCapRegex.test(password),
      spacialCarRegex.test(password),
    ].filter((item) => item);
    if (password.length < 15) {
      score = 350;
    } else if (validation.length === 2) {
      score = 500;
    } else if (validation.length === 3) {
      score = 850;
    }

    return score;
  });
  const secretsStrengthScore = allScore.sort((a, b) => a - b)?.[0];

  let secretsUptoDateScore = 100;
  if (lastUpdatedAt) {
    const currentDate = moment();
    const lastUpdatedAtFrom = moment(lastUpdatedAt);
    const timeDiff = currentDate.diff(lastUpdatedAtFrom, "days");
    if (timeDiff < 31) {
      secretsUptoDateScore = 850;
    } else if (timeDiff < 61) {
      secretsUptoDateScore = 700;
    } else if (timeDiff < 91) {
      secretsUptoDateScore = 500;
    } else {
      secretsUptoDateScore = 100;
    }
  }
  return {
    secretsStrengthScore,
    secretsUptoDateScore,
    linkedHumanScore: humanScore,
    linkedAssetScore: assetScore,
    secretScore: calculateFinalSecretScore(
      secretsStrengthScore,
      secretsUptoDateScore,
      humanScore,
      assetScore,
      secretsScoresWeightages
    ),
  };
};
const createAndUpdateSecretsTags = (tags, secret_id, company_id, client) => {
  if (tags?.length >= 0) {
    updateOrCreateSecretTags(tags, company_id, secret_id, client);
  }
};
export const createSecrets = async (data, client) =>
  secretsModel
    .create(data)
    .then(async (resp) => {
      const newSecret = JSON.parse(JSON.stringify(resp));
      await addEventLog(
        { ...client, target_id: newSecret.id },
        createSecretsActivity.status.createSecretsSuccess.code,
        createEventPayload(newSecret, {}, secretsModel.tableName)
      );
      console.log(
        "company id ==============================>",
        newSecret.company_id
      );
      createAndUpdateSecretsTags(
        data.tags,
        newSecret.id,
        newSecret.company_id,
        client
      );
      await privilegeAccessScoreWeightagesScoresUpdateTrigger(data.company_id, {
        secrets_type: data.secrets_type,
        tags: data.tags,
      });
      return newSecret;
    })
    .catch(async (err) => {
      await addEventLog(
        { ...client, target_id: "" },
        createSecretsActivity.status.createSecretsFailed.code,
        null,
        err.message
      );
      throw Error(err);
    });

export const updateSecrets = async (secrets_id, data, client) => {
  const oldData = await secretsModel
    .findOne({
      where: {
        id: secrets_id,
      },
    })
    .then((resp) => JSON.parse(JSON.stringify(resp)));
  const tags = await getSecretTagsByFilter({
    secret_id: secrets_id,
  });

  await secretsModel
    .update(data, {
      where: {
        id: secrets_id,
      },
    })
    .then(async () => {
      const newSecret = await secretsModel
        .findOne({
          where: {
            id: secrets_id,
          },
        })
        .then((resp) => JSON.parse(JSON.stringify(resp)));
      createAndUpdateSecretsTags(
        data.tags,
        newSecret.id,
        newSecret.company_id,
        client
      );
      console.log("data--------------------", data);
      await privilegeAccessScoreWeightagesScoresUpdateTrigger(
        newSecret.company_id,
        {
          secrets_type: data.secrets_type,
          tags:
            data?.tags?.length > 0
              ? [...data.tags, ...tags.map((el) => el.label)]
              : tags.map((el) => el.label),
        }
      );
      await addEventLog(
        { ...client, target_id: secrets_id },
        updateSecretsActivity.status.updateSecretsSuccess.code,
        createEventPayload(newSecret, oldData, secretsModel.tableName)
      );
    })
    .catch(async (err) => {
      await addEventLog(
        { ...client, target_id: secrets_id },
        updateSecretsActivity.status.updateSecretsFailed.code,
        null,
        err.message
      );
      throw err;
    });
};

const secretsFilterQueryBuilder = (filter) => {
  const query = {};
  const modelIncludes = [];
  if (filter?.name) {
    query.name = { [Op.like]: `%${filter?.name}%` };
  }
  if (filter?.search) {
    query.name = { [Op.like]: `%${filter?.search}%` };
  }
  if (filter?.secrets_types?.length > 0) {
    query.secrets_type = { [Op.in]: filter?.secrets_types };
  }
  if (filter?.tags?.length > 0) {
    modelIncludes.push({
      model: secretTagsModel,
      where: {
        tag_id: { [Op.in]: filter?.tags?.map((tag) => tag.id) },
      },
      required: true,
    });
  }
  if (filter?.asset_ids?.length > 0) {
    modelIncludes.push({
      model: AssetSecretsModel,
      where: {
        asset_id: { [Op.in]: filter?.asset_ids },
      },
      required: true,
    });
  }

  return {
    query,
    modelIncludes,
  };
};

export const getUserSecrets = async (
  user_id,
  page,
  size,
  filter,
  attributesInclude = []
) => {
  let paginationQuery = {};
  if (size !== "all") {
    paginationQuery = {
      offset: (page - 1) * size,
      limit: +size,
    };
  }
  const { query, modelIncludes } = secretsFilterQueryBuilder(filter);
  const userSecrets = await secretsModel.findAll({
    where: query,
    include: [
      {
        model: UserSecretsModel,
        where: {
          user_id,
        },
        attributes: ["user_id", "access_role"],
        required: true,
      },
      {
        model: secretsCustomWeightageScoreModel,
        attributes: ["risk_score"],
        include: [
          {
            model: privilegeAccessScoreWeightageModel,
            attributes: ["name", "priority"],
          },
        ],
      },
      ...modelIncludes,
    ],
    attributes: {
      include: [...attributesInclude],
    },
    ...paginationQuery,
    order: [
      ["deleted", "ASC"],
      ["createdAt", "DESC"],
    ],
  });
  const totalCount = await secretsModel
    .findAndCountAll({
      where: query,
      include: [
        {
          model: UserSecretsModel,
          where: {
            user_id,
          },
          required: true,
        },
        ...modelIncludes,
      ],
    })
    .then((resp) => resp.rows.length);
  return { userSecrets, totalCount };
};

export const getUserSecretsStatics = async (user_id, filter) => {
  const { query, modelIncludes } = secretsFilterQueryBuilder(filter);
  const totalCount = await secretsModel
    .findAndCountAll({
      where: query,
      include: [
        {
          model: UserSecretsModel,
          where: {
            user_id,
          },
          required: true,
        },
        ...modelIncludes,
      ],
    })
    .then((resp) => resp.rows.length);

  /* *********************** secrets types count ************************************** */

  let secretsTypesCounts = [];
  if (filter?.secrets_types?.length > 0) {
    secretsTypesCounts = await Promise.all(
      await filter?.secrets_types?.map(async (type) => ({
        type,
        count: await secretsModel
          .findAndCountAll({
            where: { ...query, secrets_type: type },

            include: [
              {
                model: UserSecretsModel,
                where: {
                  user_id,
                },
                required: true,
              },
              ...modelIncludes,
            ],
          })
          .then((resp) => resp.rows.length),
      }))
    );
  } else {
    secretsTypesCounts = [];
    await Promise.all(
      await secretsTypes?.map(async (type) => {
        const count = await secretsModel
          .findAndCountAll({
            where: { ...query, secrets_type: type },
            include: [
              {
                model: UserSecretsModel,
                where: {
                  user_id,
                },
                required: true,
              },
              ...modelIncludes,
            ],
          })
          .then((resp) => resp.rows.length);
        if (count > 0) {
          secretsTypesCounts.push({
            type,
            count,
          });
        }
      })
    );
  }

  const secretsCountWithCustomScoreQuery = {};
  if (filter?.secretsCustomScoreFilter?.notIncludedWeightageIds) {
    secretsCountWithCustomScoreQuery.weightage_id = {
      [Op.notIn]:
        filter?.secretsCustomScoreFilter?.notIncludedWeightageIds || [],
    };
  }
  const secretsCountWithCustomScore = await secretsModel
    .findAndCountAll({
      where: query,
      include: [
        {
          model: UserSecretsModel,
          where: {
            user_id,
          },
          required: true,
        },
        {
          model: secretsCustomWeightageScoreModel,
          where: secretsCountWithCustomScoreQuery,
          required: true,
        },
        ...modelIncludes,
      ],
    })
    .then((resp) => resp.rows.length);

  return { secretsTypesCounts, totalCount, secretsCountWithCustomScore };
};

export const sortSecretsScore = (
  secrets_custom_weightage_scores,
  defaultScore
) => {
  const secret_scores = secrets_custom_weightage_scores.sort(
    (a, b) =>
      a.privilege_access_score_weightage.priority -
      b.privilege_access_score_weightage.priority
  );
  secret_scores.push({
    risk_score: defaultScore,
    privilege_access_score_weightage: {
      name: "Default",
      priority:
        (secret_scores?.[secret_scores.length - 1]
          ?.privilege_access_score_weightage?.priority || 0) + 1,
    },
  });
  return secret_scores;
};

export const updateSecretsScore = async (secret_id, user) => {
  const secrets = await secretsModel.findOne({ where: { id: secret_id } });
  const { humanAverageScore, assetsAverageScore } =
    await getSecretHumanAnsAssetsAvgScore(secrets.id, secrets.asset_id);
  console.log({ humanAverageScore, assetsAverageScore });
  const decryptOldSecrets = await vaultService
    .getSecret(
      `/${secrets.created_by_id}/${secrets.secrets_type}/${secrets.id}`
    )
    .then((resp) => resp.data.data)
    .catch((err) => errorHandler(err));

  const { secretsLastUpdatedAt } = secrets;
  const {
    secretsStrengthScore,
    secretsUptoDateScore,
    linkedHumanScore,
    linkedAssetScore,
    secretScore,
  } = calculateSecretScore(
    decryptOldSecrets,
    secretsLastUpdatedAt,
    humanAverageScore,
    assetsAverageScore,
    secretsRiskScoresWeightages
  );
  console.log({ newScore: secretScore, oldSCore: secrets.secrets_score });
  if (secretScore !== secrets.secrets_score) {
    await updateSecrets(
      secrets.id,
      {
        secrets_strength_score: secretsStrengthScore,
        secrets_upto_date_score: secretsUptoDateScore,
        linked_human_score: linkedHumanScore,
        linked_asset_score: linkedAssetScore,
        secrets_score: secretScore,
      },
      {
        id: user?.id,
        email: user?.email,
        ipAddress: user?.ipAddress || "",
        process: `Secrets score updated`,
        user_id: null,
        asset_id: "",
        company_id: user?.company_id,
        isSystemLog: true,
        effected_table: secretsModel.tableName,
      }
    );
  }
};

export const assetsLinkedSecretsScoresUpdateTrigger = async (asset_ids) => {
  const userSecrets = await secretsModel.findAll({
    include: [
      {
        model: AssetSecretsModel,
        where: {
          asset_id: { [Op.in]: asset_ids },
        },
        required: true,
      },
    ],
  });
  console.log("total secrets to update ", userSecrets.length);
  for await (const Secret of userSecrets) {
    await updateSecretsScore(Secret.id);
  }
};


export const humanLinkedSecretsScoresUpdateTrigger = async (user_ids) => {
  const userSecrets = await secretsModel.findAll({
    include: [
      {
        model: UserSecretsModel,
        where: {
          user_id: { [Op.in]: user_ids },
        },
        required: true,
      },
    ],
  });
  console.log("total secrets to update ", userSecrets.length);
  for await (const Secret of userSecrets) {
    await updateSecretsScore(Secret.id);
  }
};