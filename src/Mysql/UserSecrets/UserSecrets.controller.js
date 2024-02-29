import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { secretUserRoles } from "../../utils/constants";
import { errorHandler } from "../../utils/errorHandler";
import { getAssetsAndAssetsCountOfCompanyByFilter } from "../Assets/assets.service";
import AssetSecretsModel from "../AssetsSecrets/AssetsSecrets.model";
import { linkAssetsWithSecret } from "../AssetsSecrets/AssetsSecrets.service";
import secretsModel from "../secrets/secret.model";
import { updateSecretsScore } from "../secrets/secret.service";
import userModel from "../Users/users.model";
import userService from "../Users/users.service";
import UserSecretsModel from "./UserSecrets.model";
import {
  getSecretUserBySecretId,
  updateOrCreateUserSecrets,
} from "./UserSecrets.service";

export const shareSecrets = async (req, res) => {
  try {
    const { users, secret_id } = req.body;
    const { user } = req;
    // const user = await userService.findUserByEmail(req.user.email);

    const userSecrets = await secretsModel
      .findOne({
        where: {
          id: secret_id,
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
      const usersToShareSecrets =
        users.length > 0
          ? users.map((item) => ({
              user_id: item.id,
              access_role: item?.access_role || "viewer",
            }))
          : [];
      console.log(usersToShareSecrets?.length);
      await updateOrCreateUserSecrets(
        usersToShareSecrets,
        // user.company_id,
        user,
        userSecrets,
        {
          client_id: user?.id,
          client_email: user?.email,
          full_name: user?.full_name,
          ipAddress: req.socket.remoteAddress,
          company_id: user.company_id,
        }
      );
      // await linkAssetsWithSecret(secret_id, userSecrets?.asset_id);
      res
        .status(StatusCodes.OK)
        .send({ message: "secret shared successfully" });
    } else {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "You don't have access to update it",
      });
    }
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

export const getSecretUsers = async (req, res) => {
  try {
    const { secret_id } = req.params;
    const { size, page } = req.query;

    const totalCount = await UserSecretsModel.count({
      where: {
        secret_id,
      },
    });

    const users = await getSecretUserBySecretId(secret_id, size, page);

    res.status(StatusCodes.OK).send({ users, totalCount });
  } catch (err) {
    errorHandler(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

export const getSecretAssets = async (req, res) => {
  try {
    const { secret_id } = req.params;
    const { size, page } = req.query;
    const { user } = req;

    const secretExits = await secretsModel.findOne({
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
    });

    if (secretExits?.id) {
      const humansAssetIds = await AssetSecretsModel.findAll({
        where: {
          secret_id,
        },
        attributes: ["asset_id"],
      }).then((resp) => resp.map((item) => item.asset_id));
      const result = await getAssetsAndAssetsCountOfCompanyByFilter(
        user.company_id,
        size,
        page,
        {
          included_ids: humansAssetIds || [],
        }
      );
      res.status(200).json({
        status: true,
        message: "Success",
        data: result?.Assets,
        totalCount: result?.totalAssetsCount || 0,
      });
    } else {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "You don't have access to update it",
      });
    }
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

export const deleteSecretUsers = async (req, res) => {
  try {
    const { user } = req;
    const { secret_id } = req.params;
    const { userIds } = req.body;

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
      if (userIds.length > 0) {
        const deleteUserSecrets = await UserSecretsModel.findAll({
          where: {
            secret_id: userSecrets.id,
            id: { [Op.in]: userIds },
            user_id: { [Op.not]: userSecrets.created_by_id },
          },
        });
        if (deleteUserSecrets?.length > 0) {
          await Promise.all(
            deleteUserSecrets.map(async (secret) => {
              await UserSecretsModel.destroy({
                where: {
                  [Op.and]: [
                    { id: secret.id },
                    { id: { [Op.not]: userSecrets.created_by_id } },
                  ],
                },
              });
            })
          );
        }

        console.log("deleted secrets users count", deleteUserSecrets?.length);
      }

      await updateSecretsScore(userSecrets?.id, {
        id: user?.id,
        email: user?.email,
        full_name: user?.full_name,
        ipAddress: req.socket.remoteAddress,
        company_id: user.company_id,
      }).catch((err) => {
        errorHandler(err);
      });
      res
        .status(StatusCodes.OK)
        .send({ message: "secret user deleted successfully" });
    } else {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "You don't have access to update it",
      });
    }
  } catch (err) {
    errorHandler(err);
    return res.status(500).json({
      error: "Something went wrong",
      message: err.message,
    });
  }
};
export const updateSecretUser = async (req, res) => {
  try {
    const { user } = req;
    const { secret_id } = req.params;
    const { access_role } = req.body;
    const secretsUser = await UserSecretsModel.findOne({
      where: {
        id: secret_id,
      },
    });
    const userSecrets = await secretsModel
      .findOne({
        where: {
          id: secretsUser.secret_id,
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
    if (userSecrets?.id && secretsUser.user_id !== user.id) {
      await UserSecretsModel.update(
        { access_role },
        { where: { id: secret_id } }
      );

      res
        .status(StatusCodes.OK)
        .send({ message: "secrets user updated successfully" });
    } else {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "You don't have access to update it",
      });
    }
  } catch (err) {
    errorHandler(err);
    return res.status(500).json({
      error: "Something went wrong",
      message: err.message,
    });
  }
};

export const getSecretAvailableUsers = async (req, res) => {
  try {
    const { secret_id } = req.params;
    const { size, page } = req.query;
    const { user } = req;
    const secretExits = await secretsModel.findOne({
      where: {
        id: secret_id,
        deleted: false,
      },
    });

    if (secretExits?.id) {
      const secretLinkedUsers = await UserSecretsModel.findAll({
        where: {
          secret_id,
        },
        attributes: ["id", "user_id"],
      })
        .then((resp) => JSON.parse(JSON.stringify(resp)))
        .catch((err) => {
          errorHandler(err);
          throw Error(err);
        });

      const userIds = secretLinkedUsers.map(
        (secretsUser) => secretsUser.user_id
      );
      let filter = {};
      if (req.query?.filter) {
        filter = JSON.parse(req.query.filter);
      }
      let sort = "DESC";
      let sortColumn = "createdAt";
      let role_id = "";
      if (filter?.role) {
        role_id = filter?.role;
      }
      if (filter?.sort) {
        sort = filter?.sort;
        sortColumn = "full_name";
      }
      const filterObj = {
        id: { [Op.notIn]: userIds },
        company_id: user.company_id,
      };
      if (filter?.status) {
        if (filter?.status === "active") {
          filterObj.is_active = true;
        } else {
          filterObj.is_active = false;
        }
      }
      if (filter?.search) {
        filterObj.full_name = { [Op.like]: `%${filter?.search}%` };
      }
      const users = await userService.getUsers(
        filterObj,
        {
          id: user.id,
          email: user.email,
          ipAddress: req.socket.remoteAddress,
          process: "Get secrets available users",
        },
        sort,
        sortColumn,
        role_id,
        page,
        size
      );
      const totalCount = await userModel.count({
        where: filterObj,
      });

      res.status(StatusCodes.OK).send({
        users: users.map((userData) => ({
          id: userData?.id,
          full_name: userData.full_name,
          access_role: secretUserRoles.Viewer,
          email: userData.email,
        })),
        totalCount,
      });
    }
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};
