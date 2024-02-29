import { Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import sequelize from "../db";
import TagsModel from "../Tags/tags.model";

const AssetTagModel = sequelize.define("asset_tags", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    // defaultValue: Sequelize.literal('uuid_generate_v4()')
  },
  tag_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  asset_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

// ***************** relation to assets ********************

assetSQLModel.hasMany(AssetTagModel, {
  onDelete:"CASCADE",
  foreignKey: {
    name: "asset_id",
    allowNull: false,
  },
});
AssetTagModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});
// ***************** relation to tags ********************

TagsModel.hasMany(AssetTagModel, {
  onDelete:"CASCADE",
  foreignKey: {
    name: "tag_id",
    allowNull: false,
  },
});
AssetTagModel.belongsTo(TagsModel, {
  foreignKey: "tag_id",
});

export default AssetTagModel;
