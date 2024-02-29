import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../../Companies/company.model";
import sequelize from "../../db";
import userModel from "../../Users/users.model";

const ApplicationScoreWeightageModel = sequelize.define(
  "applications_score_weightage",
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
    linked_assets_weightage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    linked_humans_weightage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    apply_on_all_application: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    application_ids: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }
);

// ***************** relation to company ********************

companyModel.hasMany(ApplicationScoreWeightageModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
ApplicationScoreWeightageModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});
// ***************** relation to company ********************

userModel.hasMany(ApplicationScoreWeightageModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "created_by_id",
    allowNull: false,
  },
});
ApplicationScoreWeightageModel.belongsTo(userModel, {
  foreignKey: "created_by_id",
  as: "created_by",
});

export default ApplicationScoreWeightageModel;
