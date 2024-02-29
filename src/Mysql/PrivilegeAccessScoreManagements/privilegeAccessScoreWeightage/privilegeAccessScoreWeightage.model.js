import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../../Companies/company.model";
import sequelize from "../../db";
import userModel from "../../Users/users.model";

const privilegeAccessScoreWeightageModel = sequelize.define(
  "privilege_access_score_weightage",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      // defaultValue: Sequelize.literal('uuid_generate_v4()')
    },
    created_by_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    company_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    secrets_strength_weightage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    secrets_upto_date_weightage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    linked_assets_weightage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    linked_humans_weightage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    apply_on_all_secrets: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }
);

// ***************** relation to company ********************

companyModel.hasMany(privilegeAccessScoreWeightageModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
privilegeAccessScoreWeightageModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});
// ***************** relation to company ********************

userModel.hasMany(privilegeAccessScoreWeightageModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "created_by_id",
    allowNull: false,
  },
});
privilegeAccessScoreWeightageModel.belongsTo(userModel, {
  foreignKey: "created_by_id",
  as: "created_by",
});

export default privilegeAccessScoreWeightageModel;
