import { Op } from "sequelize";
import { errorHandler } from "../../utils/errorHandler";
import humanSQLModel from "../Human/human.model";
import humanAssetsSQLModel from "../HumanAssets/humanAssets.model";
import secretsModel from "../secrets/secret.model";
import userModel from "../Users/users.model";
import UserSecretsModel from "../UserSecrets/UserSecrets.model";
import AssetSecretsModel from "./AssetsSecrets.model";

const createAnsUpdateAssetSecrets = async (secret_id, humanAsset) => {
  const assetSecretsInDB = await AssetSecretsModel.findOne({
    where: {
      secret_id,
      asset_id: humanAsset.asset_id,
    },
  });
  const assetSecretsData = {
    secret_id,
    asset_id: humanAsset.asset_id,
    human_asset_id: humanAsset.id,
  };
  if (assetSecretsInDB?.id) {
    await AssetSecretsModel.update(assetSecretsData, {
      where: {
        id: assetSecretsInDB.id,
      },
    });
  } else {
    await AssetSecretsModel.create(assetSecretsData);
  }
};
export const linkAssetsWithSecret = async (secret_id, asset_id) => {
  const secretLinkedUsers = await UserSecretsModel.findAll({
    where: {
      secret_id,
    },
    attributes: ["id"],
    include: [
      {
        model: userModel,
        attributes: ["id"],
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
  const humansAssets = await humanAssetsSQLModel.findAll({
    where: {
      human_id: { [Op.in]: humansIds },
    },
    attributes: ["id", "asset_id"],
  });
  if (asset_id) {
    humansAssets.push({ id: null, asset_id });
  }
  const oldAssetSecretsInDB = await AssetSecretsModel.findAll({
    where: {
      secret_id,
    },
    order: [["updatedAt", "DESC"]],
    limit: 2,
  });

  const LastUpdatedAtDate = oldAssetSecretsInDB?.[0]?.updatedAt;

  for await (const humanAsset of humansAssets) {
    await createAnsUpdateAssetSecrets(secret_id, humanAsset);
  }
  if (oldAssetSecretsInDB.length > 0) {
    const deleteAssets = await AssetSecretsModel.destroy({
      where: {
        secret_id,
        updatedAt: { [Op.lte]: LastUpdatedAtDate },
      },
    });
    console.log("No of delete secrets assets Source", deleteAssets);
  }
};

export const getUserSecretsAndLinkAssetsToSecrets = async (userId) => {
  console.log(userId);
  const UserSecrets = await UserSecretsModel.findAll({
    where: { user_id: userId },
    include: [
      {
        model: secretsModel,
      },
    ],
  });
  for await (const user of UserSecrets) {
    linkAssetsWithSecret(user.secret_id, user?.secret?.asset_id);
  }
};
