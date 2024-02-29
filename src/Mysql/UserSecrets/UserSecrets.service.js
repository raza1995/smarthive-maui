import { Op } from "sequelize";
import { NotificationType } from "../../utils/constants";
import emailService from "../../utils/EmailServices/emailService";
import { errorHandler } from "../../utils/errorHandler";
import humanSQLModel from "../Human/human.model";
import humanRiskScoreModel from "../HumanRiskScores/humanRiskScore.model";
import { secretsSharedActivity } from "../Logs/ActivitiesType/SecretsActivityType";
import { addEventLog } from "../Logs/eventLogs/eventLogs.controller";
import { addNotification } from "../Notification/notification.service";
import secretsModel from "../secrets/secret.model";
import { updateSecretsScore } from "../secrets/secret.service";
import userModel from "../Users/users.model";
import { linkAssetsWithSecret } from "../AssetsSecrets/AssetsSecrets.service";
import { getUserByFilter } from "../Users/users.service";
import UserSecretsModel from "./UserSecrets.model";
import { getTotalPartnerCompanies } from "../PartnerCompanies/partnerCompanies.service";

export const updateUserSecretsScore = async (user_id, client) => {
  try {
    if (user_id) {
      const secretsIds = await secretsModel
        .findAll({
          attributes: ["id", "name"],
          include: [
            {
              model: UserSecretsModel,
              where: { user_id },
              attributes: [],
              required: true,
            },
          ],
        })
        .then((resp) =>
          JSON.parse(JSON.stringify(resp))?.map((item) => item.id)
        )
        .catch((err) => {
          errorHandler(err);
          throw Error(err);
        });
      for await (const secretsId of secretsIds) {
        await updateSecretsScore(secretsId, {
          id: client?.id,
          email: client?.email,
          full_name: client?.full_name,
          ipAddress: client.ipAddress,
          company_id: client.company_id,
        }).catch((err) => {
          errorHandler(err);
        });
      }
    }
  } catch (err) {
    errorHandler(err);
  }
};
export const updateOrCreateSecret = async (userSecret, client, userInDB) => {
  const userSecretInDB = await UserSecretsModel.findOne({
    where: { user_id: userSecret.user_id, secret_id: userSecret.secret_id },
  });
  if (userSecretInDB) {
    await UserSecretsModel.update(userSecret, {
      where: {
        id: userSecretInDB.id,
        user_id: { [Op.not]: client?.client_id },
      },
    });
  } else {
    const newUserSecret = await UserSecretsModel.create(userSecret, {
      hooks: true,
    });
    if (userInDB.id !== client?.client_id) {
      addNotification(
        userInDB.id,
        { id: client?.client_id, full_name: client?.full_name },
        NotificationType.secretsShared
      );
      emailService.sendShareSecretsEmail(userInDB.email, {
        id: client?.client_id,
        full_name: client?.full_name,
      });
      await addEventLog(
        {
          id: client?.client_id,
          email: client?.client_email,
          ipAddress: client?.ipAddress,
          process: `Secrets shared with "${userInDB.full_name}" `,
          user_id: userInDB.id,
          target_id: newUserSecret.secret_id,
          company_id: client?.company_id,
          isSystemLog: false,
          effected_table: UserSecretsModel.tableName,
        },
        secretsSharedActivity.status.secretsSharedSuccessfully.code,
        null
      );
    }
  }
  return true;
};
export const updateOrCreateUserSecrets = async (
  usersToShareSecrets,
  user,
  userSecrets,
  client
) => {
  const secret_id = userSecrets?.id;
  if (secret_id) {
    for await (const userToShareSecrets of usersToShareSecrets) {
      let userInDB = {};
      if (
        (user.role === "partner" || user.role === "super_admin") &&
        user.id === userToShareSecrets.user_id
      ) {
        userInDB = await getUserByFilter({
          id: userToShareSecrets.user_id,
          // company_id: user.company_id,
        });
      } else {
        userInDB = await getUserByFilter({
          id: userToShareSecrets.user_id,
          company_id: user.company_id,
        });
      }
      if (userInDB?.id) {
        await updateOrCreateSecret(
          {
            user_id: userToShareSecrets.user_id,
            secret_id,
            access_role: userToShareSecrets.access_role,
          },
          client,
          userInDB
        );
      }
    }
    await linkAssetsWithSecret(secret_id, userSecrets?.asset_id);
    await updateSecretsScore(secret_id, client).catch((err) => {
      errorHandler(err);
    });
    return true;
  }
  throw Error("Secret not found");
};

export const getSecretUserBySecretId = async (
  secret_id,
  size = 10,
  page = 0
) => {
  const secretExits = await secretsModel.findOne({
    where: {
      id: secret_id,
      deleted: false,
    },
  });

  if (secretExits?.id) {
    const offsetObj = {};
    if (size !== "all") {
      offsetObj.offset = (page - 1) * size;
      offsetObj.limit = +size;
    }
    const secretUsers = await UserSecretsModel.findAll({
      where: {
        secret_id,
      },
      attributes: ["id", "access_role", "CreatedAt"],
      include: [
        {
          model: userModel,
          attributes: ["id", "full_name", "email"],
          required: true,
          include: [
            {
              model: humanSQLModel,
              attributes: ["id", "department", "region"],
              include: [
                {
                  model: humanRiskScoreModel,
                  attributes: ["risk_score"],
                },
              ],
            },
          ],
        },
      ],
      order: [["CreatedAt", "ASC"]],
      ...offsetObj,
    });
    return secretUsers;
  }
  throw Error("Secret not found");
};
