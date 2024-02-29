import { DataTypes, Sequelize } from "sequelize";
import patchingtGroupsSQLModel from "../PatchingGroups/patchingGroups.model";
import assetSQLModel from "../Assets/assets.model";
import sequelize from "../db";

const GroupAssetsSQLModel = sequelize.define("group_assets", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  asset_id: {
    type: Sequelize.UUID,
  },
  patching_group_id: {
    type: Sequelize.UUID,
  },
  company_id: {
     type: Sequelize.UUID,
  },
});

// ***************** relation to company ********************

assetSQLModel.hasMany(GroupAssetsSQLModel, {
  foreignKey: "asset_id",
  allowNull: false,
});

GroupAssetsSQLModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

patchingtGroupsSQLModel.hasMany(GroupAssetsSQLModel, {
  foreignKey: "patching_group_id",
  allowNull: false,
});
GroupAssetsSQLModel.belongsTo(patchingtGroupsSQLModel, {
  foreignKey: "patching_group_id",
});

export default GroupAssetsSQLModel;
