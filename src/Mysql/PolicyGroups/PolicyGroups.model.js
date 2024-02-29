import { DataTypes, Sequelize } from "sequelize";
import patchingPoliciesSQLModel from "../PatchingPolicy/patchingPolicy.model";
import assetSQLModel from "../Assets/assets.model";
import sequelize from "../db";
import patchingtGroupsSQLModel from "../PatchingGroups/patchingGroups.model";

const PolicyGroupsSQLModel = sequelize.define("policy_groups", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  patching_group_id: {
    type: Sequelize.UUID,
  },
  patching_policy_id: {
    type: Sequelize.UUID,
  },
  company_id: {
     type: Sequelize.UUID,
  },
});

// ***************** relation to company ********************
patchingtGroupsSQLModel.hasOne(PolicyGroupsSQLModel, {
  foreignKey: "patching_group_id",
  allowNull: false,
});

PolicyGroupsSQLModel.belongsTo(patchingtGroupsSQLModel, {
  foreignKey: "patching_group_id",
});

patchingPoliciesSQLModel.hasMany(PolicyGroupsSQLModel, {
  foreignKey: "patching_policy_id",
  allowNull: false,
});
PolicyGroupsSQLModel.belongsTo(patchingPoliciesSQLModel, {
  foreignKey: "patching_policy_id",
});

export default PolicyGroupsSQLModel;
