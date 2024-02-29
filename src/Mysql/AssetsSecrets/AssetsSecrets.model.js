import { Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import sequelize from "../db";
import humanAssetsSQLModel from "../HumanAssets/humanAssets.model";
import secretsModel from "../secrets/secret.model";

const AssetSecretsModel = sequelize.define("asset_secrets", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    // defaultValue: Sequelize.literal('uuid_generate_v4()')
  },
  human_asset_id: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  asset_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  secret_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

// ***************** relation to assets ********************

secretsModel.hasMany(AssetSecretsModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "secret_id",
    allowNull: false,
  },
});
AssetSecretsModel.belongsTo(secretsModel, {
  foreignKey: "secret_id",
});
// ***************** relation to assets ********************

assetSQLModel.hasOne(AssetSecretsModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "asset_id",
    allowNull: false,
  },
});
AssetSecretsModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

// ***************** relation to human assets ********************

humanAssetsSQLModel.hasMany(AssetSecretsModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "human_asset_id",
    allowNull: false,
  },
});
AssetSecretsModel.belongsTo(humanAssetsSQLModel, {
  foreignKey: "human_asset_id",
});

export default AssetSecretsModel;
