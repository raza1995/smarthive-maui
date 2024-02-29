import { diff } from "deep-object-diff";
import { StatusCodes } from "http-status-codes";
import moment from "moment";
import { Op } from "sequelize";
import { secretUserRoles } from "../../utils/constants";
import {
  scoreNotAvailable,
  secretsRiskScoresWeightages,
} from "../../utils/Constants/scoreWeightages";
import { decryptObject, EncryptObject } from "../../utils/crypto";
import { errorHandler } from "../../utils/errorHandler";
import assetSQLModel from "../Assets/assets.model";
import AssetScoreSQLModel from "../AssetScores/assetScore.model";
import sequelize from "../db";
import SecretsActivityCategory, {
  secretsInteractionActivity,
} from "../Logs/ActivitiesType/SecretsActivityType";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import { getEventLogsByCategory } from "../Logs/eventLogs/eventLogs.service";
import secretsCustomWeightageScoreModel from "../PrivilegeAccessScoreManagements/privilegeAccessCustomWeightageScore/privilegeAccessCustomWeightageScore.model";
import privilegeAccessScoreWeightageModel from "../PrivilegeAccessScoreManagements/privilegeAccessScoreWeightage/privilegeAccessScoreWeightage.model";

import { getSecretTagsByFilter } from "../SecretTags/secretTags.service";
import UserSecretsModel from "../UserSecrets/UserSecrets.model";
import { updateOrCreateUserSecrets } from "../UserSecrets/UserSecrets.service";

import vault from "./hashicorpVault/vault.service";
import secretsModel from "./secret.model";
import {
  calculateSecretScore,
  createSecrets,
  getSecretHumanAnsAssetsAvgScore,
  getUserSecrets,
  getUserSecretsStatics,
  sortSecretsScore,
  updateSecrets,
} from "./secret.service";
import { linkAssetsWithSecret } from "../AssetsSecrets/AssetsSecrets.service";

require("dotenv").config();

const secretController = {
  async create(req, res) {
    try {
      const data = req.body;
      const { secrets_type, secrets, name } = data;
      const { user } = req;
      const decryptSecrets = decryptObject(secrets);
      if (data.id) {
        const userSecrets = await secretsModel
          .findOne({
            where: {
              id: data.id,
            },
            include: [
              {
                model: UserSecretsModel,
                where: {
                  user_id: user.id,
                  access_role: secretUserRoles.Admin,
                },
                attributes: [],
                required: true,
              },
            ],
          })
          .then((resp) => JSON.parse(JSON.stringify(resp)));
        if (userSecrets?.id) {
          const { humanAverageScore, assetsAverageScore } =
            await getSecretHumanAnsAssetsAvgScore(
              userSecrets.id,
              data?.asset_id
            );
          console.log({ humanAverageScore, assetsAverageScore });
          const decryptOldSecrets = await vault
            .getSecret(
              `/${userSecrets.created_by_id}/${userSecrets.secrets_type}/${userSecrets.id}`
            )
            .then((resp) => resp.data.data)
            .catch((err) => errorHandler(err));
          const dataDiff = diff(decryptSecrets, decryptOldSecrets);
          const attributesEffected =
            Object.keys(dataDiff).map((key) => key).length > 0;

          const secretsLastUpdatedAt = attributesEffected
            ? new Date()
            : userSecrets.secretsLastUpdatedAt;

          const {
            secretsStrengthScore,
            secretsUptoDateScore,
            linkedHumanScore,
            linkedAssetScore,
            secretScore,
          } = calculateSecretScore(
            decryptSecrets,
            secretsLastUpdatedAt,
            humanAverageScore,
            assetsAverageScore,
            secretsRiskScoresWeightages
          );
          await updateSecrets(
            userSecrets.id,
            {
              name,
              secrets_type,
              secrets_strength_score: secretsStrengthScore,
              secrets_upto_date_score: secretsUptoDateScore,
              linked_human_score: linkedHumanScore,
              linked_asset_score: linkedAssetScore,
              secrets_score: secretScore,
              company_id: user.company_id,
              secretsLastUpdatedAt,
              created_by_id: user.id,
              asset_id: data?.asset_id?.trim() || null,
              tags: data.tags,
            },
            {
              id: user.id,
              email: user.email,
              ipAddress: req.socket.remoteAddress,
              process: `updated Secrets ${name}`,
              user_id: null,
              asset_id: data?.asset_id?.trim() || null,
              company_id: user?.company_id,
              isSystemLog: false,
              effected_table: secretsModel.tableName,
            }
          );
          console.log(data);
          const path = `/${userSecrets.created_by_id}/${secrets_type}/${userSecrets.id}`;
          await vault.storeSecret(path, decryptSecrets);
          await linkAssetsWithSecret(userSecrets.id, data?.asset_id);
          // await privilegeAccessScoreWeightagesScoresUpdateTrigger(
          //   userSecrets.id,
          //   userSecrets.company_id,
          //   { secrets_type, tags: data.tags }
          // );

          res.status(StatusCodes.CREATED).json({
            message: "Secrets Update Successfully",
          });
        } else {
          res.status(StatusCodes.FORBIDDEN).json({
            message: "You don't have access to update it",
          });
        }
      } else {
        let assetScore = scoreNotAvailable;
        if (data?.asset_id) {
          assetScore = await assetSQLModel
            .findOne({
              where: { id: data?.asset_id },
              include: [
                {
                  model: AssetScoreSQLModel,
                  attributes: ["risk_score"],
                },
              ],
            })
            .then((resp) => resp.asset_score?.risk_score);
        }

        const {
          secretsStrengthScore,
          secretsUptoDateScore,
          linkedHumanScore,
          linkedAssetScore,
          secretScore,
        } = calculateSecretScore(
          decryptSecrets,
          new Date(),
          "N/A",
          assetScore,
          secretsRiskScoresWeightages
        );
        const newSecret = await createSecrets(
          {
            name,
            secrets_type,
            secrets_score: secretScore,
            secrets_strength_score: secretsStrengthScore,
            secrets_upto_date_score: secretsUptoDateScore,
            linked_human_score: linkedHumanScore,
            linked_asset_score: linkedAssetScore,
            company_id: user.company_id,
            created_by_id: user.id,
            secretsLastUpdatedAt: new Date(),
            asset_id: data?.asset_id?.trim() || null,
            tags: data.tags,
          },
          {
            id: user.id,
            email: user.email,
            ipAddress: req.socket.remoteAddress,
            process: `New secrets ${name} has been added`,
            user_id: user.id,
            asset_id: data?.asset_id?.trim() || null,
            company_id: user?.company_id,
            isSystemLog: false,
          }
        );

        const path = `/${user.id}/${secrets_type}/${newSecret.id}`;
        await vault.storeSecret(path, decryptSecrets);
        updateOrCreateUserSecrets(
          [
            {
              user_id: user.id,
              secret_id: newSecret.id,
              access_role: "Admin",
            },
          ],
          // user.company_id,
          user,
          newSecret,
          {
            client_id: user?.id,
            client_email: user?.email,
            full_name: user?.full_name,
            ipAddress: req.socket.remoteAddress,
            company_id: user.company_id,
          }
        );

        // await privilegeAccessScoreWeightagesScoresUpdateTrigger(
        //   newSecret.company_id,
        //   { secrets_type, tags: data.tags }
        // );
        res.status(StatusCodes.CREATED).json({
          message: "Secrets Created Successfully",
        });
      }
      // Store into DB 1
    } catch (err) {
      errorHandler(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: err.message });
    }
  },

  async getSecretsLogs(req, res) {
    try {
      const { size, page } = req.query;
      const { secret_id } = req.params;
      const offset = size * (page - 1);
      const limit = +size;
      const logsData = await getEventLogsByCategory(
        { target_id: secret_id },
        offset,
        limit,
        SecretsActivityCategory.code
      );

      return res.json(logsData);
    } catch (err) {
      errorHandler(err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ valid: false, error: "Something went wrong", stack: err });
    }
  },
  async createSecretsLogs(req, res) {
    try {
      const { user } = req;
      const { secrets_id, action } = req.body;

      await addEventLog(
        {
          id: user.id,
          email: user.email,
          ipAddress: req.socket.remoteAddress,
          process: action,
          user_id: null,
          asset_id: "",
          company_id: user?.company_id,
          is_system_log: false,
          target_id: secrets_id,
          effected_table: secretsModel.tableName || null,
        },
        secretsInteractionActivity.status.secretsInteractedSuccessfully.code
      );

      return res.json({ msg: "done" });
    } catch (err) {
      errorHandler(err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ valid: false, error: "Something went wrong", stack: err });
    }
  },
  async getAll(req, res) {
    try {
      const { user } = req;
      const { page, size } = req.query;
      const filter = JSON.parse(req.query?.filter || JSON.stringify({}));
      await secretsModel.destroy({
        where: {
          deleted: true,
          updatedAt: { [Op.lt]: moment().subtract(7, "days") },
        },
      });
      const attributesInclude = [
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM user_secrets WHERE user_secrets.secret_id=secrets.id )`
          ),
          "user_with_access_count",
        ],
      ];
      const { userSecrets, totalCount } = await getUserSecrets(
        user.id,
        page,
        size,
        filter,
        attributesInclude
      );

      res.status(StatusCodes.OK).send({
        secrets: await Promise.all(
          userSecrets.map(async (resp) => {
            const respData = JSON.parse(JSON.stringify(resp));
            const tags = await getSecretTagsByFilter({
              secret_id: resp.id,
            });
            const { secrets_custom_weightage_scores } = respData;
            delete respData.secrets_custom_weightage_scores;
            const secrets_scores = sortSecretsScore(
              secrets_custom_weightage_scores,
              respData?.secrets_score
            );

            return respData.deleted
              ? {
                  id: respData.id,
                  name: respData.name,
                  deleted: !!respData.deleted,
                  created_by_id: respData.created_by_id,
                  updatedAt: respData.updatedAt,
                }
              : {
                  id: respData.id,
                  name: respData.name,
                  user_with_access_count: respData.user_with_access_count,
                  created_by_id: respData.created_by_id,
                  asset_id: respData.asset_id,
                  secrets_scores,
                  secrets_score: respData.secrets_score,
                  secrets_strength_score: respData.secrets_strength_score,
                  secrets_upto_date_score: respData.secrets_upto_date_score,
                  linked_human_score: respData.linked_human_score,
                  linked_asset_score: respData.linked_asset_score,
                  secrets_type: respData.secrets_type,
                  updatedAt: respData.updatedAt,
                  access_role: respData.user_secret.access_role,
                  createdAt: respData.createdAt,
                  deleted: !!respData.deleted,
                  tags,
                };
          })
        ),
        totalCount,
      });
    } catch (err) {
      errorHandler(err);
      return res.status(500).json({
        valid: false,
        data: null,
        error: "Something went wrong",
        stack: err,
      });
    }
  },
  async getSecretsOfAsset(req, res) {
    try {
      const { user } = req;
      const { page, size } = req.query;
      const { asset_id } = req.params;
      const filter = JSON.parse(req.query?.filter || JSON.stringify({}));
      filter.asset_ids = [asset_id];
      filter.user_id = user.id;
      await secretsModel.destroy({
        where: {
          deleted: true,
          updatedAt: { [Op.lt]: moment().subtract(7, "days") },
        },
      });
      const attributesInclude = [
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM user_secrets WHERE user_secrets.secret_id=secrets.id )`
          ),
          "user_with_access_count",
        ],
      ];
      const { userSecrets, totalCount } = await getUserSecrets(
        user.id,
        page,
        size,
        filter,
        attributesInclude
      );

      res.status(StatusCodes.OK).send({
        secrets: await Promise.all(
          userSecrets.map(async (resp) => {
            const respData = JSON.parse(JSON.stringify(resp));
            const tags = await getSecretTagsByFilter({
              secret_id: resp.id,
            });
            const { secrets_custom_weightage_scores } = respData;
            delete respData.secrets_custom_weightage_scores;
            const secrets_scores = sortSecretsScore(
              secrets_custom_weightage_scores,
              respData?.secrets_score
            );

            return respData.deleted
              ? {
                  id: respData.id,
                  name: respData.name,
                  deleted: !!respData.deleted,
                  created_by_id: respData.created_by_id,
                  updatedAt: respData.updatedAt,
                }
              : {
                  id: respData.id,
                  name: respData.name,
                  user_with_access_count: respData.user_with_access_count,
                  created_by_id: respData.created_by_id,
                  asset_id: respData.asset_id,
                  secrets_scores,
                  secrets_score: respData.secrets_score,
                  secrets_strength_score: respData.secrets_strength_score,
                  secrets_upto_date_score: respData.secrets_upto_date_score,
                  linked_human_score: respData.linked_human_score,
                  linked_asset_score: respData.linked_asset_score,
                  secrets_type: respData.secrets_type,
                  updatedAt: respData.updatedAt,
                  access_role: respData.user_secret.access_role,
                  createdAt: respData.createdAt,
                  deleted: !!respData.deleted,
                  tags,
                };
          })
        ),
        totalCount,
      });
    } catch (err) {
      errorHandler(err);
      return res.status(500).json({
        valid: false,
        data: null,
        error: "Something went wrong",
        stack: err,
      });
    }
  },
  async getSecretsStatics(req, res) {
    try {
      const { user } = req;
      const filter = JSON.parse(req.query?.filter || JSON.stringify({}));
      await secretsModel.destroy({
        where: {
          deleted: true,
          updatedAt: { [Op.lt]: moment().subtract(7, "days") },
        },
      });

      const result = await getUserSecretsStatics(user.id, filter);

      res.status(StatusCodes.OK).send({
        ...result,
      });
    } catch (err) {
      errorHandler(err);
      return res.status(500).json({
        valid: false,
        data: null,
        error: "Something went wrong",
        stack: err,
      });
    }
  },
  async getSecretDetail(req, res) {
    try {
      const { user } = req;
      const { id } = req.params;

      const userSecrets = await secretsModel
        .findOne({
          where: {
            id,
            deleted: false,
          },
          include: [
            {
              model: UserSecretsModel,
              where: {
                user_id: user.id,
              },
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
          ],
          attributes: {
            include: [
              [
                sequelize.literal(
                  `(SELECT COUNT(*) FROM user_secrets WHERE user_secrets.secret_id=secrets.id )`
                ),
                "user_with_access_count",
              ],
              [
                sequelize.literal(
                  `(SELECT COUNT(*) FROM asset_secrets WHERE asset_secrets.secret_id=secrets.id )`
                ),
                "linked_assets_count",
              ],
            ],
          },
        })
        .then((resp) => JSON.parse(JSON.stringify(resp)));
      if (userSecrets?.id) {
        const { secrets_custom_weightage_scores } = userSecrets;
        delete userSecrets.secrets_custom_weightage_scores;
        const secret_scores = sortSecretsScore(
          secrets_custom_weightage_scores,
          userSecrets?.secrets_score
        );
        const secrets = await vault
          .getSecret(
            `/${userSecrets.created_by_id}/${userSecrets.secrets_type}/${userSecrets.id}`
          )
          .then((resp) => resp.data.data)
          .catch((err) => errorHandler(err));
        const tags = await getSecretTagsByFilter({
          secret_id: id,
        });
        const encryptSecrets = EncryptObject(secrets);

        res.status(StatusCodes.OK).send({
          ...userSecrets,
          secret_scores,
          secrets: encryptSecrets,
          tags,
        });
      } else {
        res.status(StatusCodes.NOT_FOUND).send({
          message: "Secret details not found",
        });
      }
    } catch (err) {
      errorHandler(err);
      return res.status(500).json({
        valid: false,
        data: null,
        error: "Something went wrong",
        stack: err,
      });
    }
  },
  async remove(req, res) {
    try {
      const { user } = req;
      const { secret_id } = req.params;

      const userSecrets = await secretsModel
        .findOne({
          where: {
            id: secret_id,
            deleted: false,
          },
          include: [
            {
              model: UserSecretsModel,
              where: {
                user_id: user.id,
                access_role: secretUserRoles.Admin,
              },
              required: true,
            },
          ],
        })
        .then((resp) => JSON.parse(JSON.stringify(resp)));
      if (userSecrets?.id) {
        await secretsModel.update(
          { deleted: true },
          { where: { id: secret_id } }
        );

        res
          .status(StatusCodes.OK)
          .send({ message: "secret deleted successfully" });
      } else {
        res.status(StatusCodes.FORBIDDEN).json({
          message: "You don't have access to delete it",
        });
      }
    } catch (err) {
      errorHandler(err);
      return res.status(500).json({
        error: "Something went wrong",
        message: err.message,
      });
    }
  },
  async revoke(req, res) {
    try {
      const { user } = req;
      const { secret_id } = req.params;

      const userSecrets = await secretsModel
        .findOne({
          where: {
            id: secret_id,
            deleted: true,
          },
          include: [
            {
              model: UserSecretsModel,
              where: {
                user_id: user.id,
                access_role: secretUserRoles.Admin,
              },
              required: true,
            },
          ],
        })
        .then((resp) => JSON.parse(JSON.stringify(resp)));
      if (userSecrets?.id) {
        await secretsModel.update(
          { deleted: false },
          { where: { id: secret_id } }
        );

        res
          .status(StatusCodes.OK)
          .send({ message: "secret revoke successfully" });
      } else {
        res.status(StatusCodes.FORBIDDEN).json({
          message: "You don't have access to delete it",
        });
      }
    } catch (err) {
      errorHandler(err);
      return res.status(500).json({
        error: "Something went wrong",
        message: err.message,
      });
    }
  },
};

export default secretController;
