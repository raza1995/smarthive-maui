import { DataTypes, Sequelize } from "sequelize";
import ApplicationSQLModel from "../../Applications/application.model";
import companyModel from "../../Companies/company.model";
import sequelize from "../../db";

import ApplicationScoreWeightageModel from "../ApplicationScoreWeightage/ApplicationScoreWeightage.model";

const ApplicationCustomWeightageScoreModel = sequelize.define(
  "application_custom_weightage_scores",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      // defaultValue: Sequelize.literal('uuid_generate_v4()')
    },
    company_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    weightage_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    application_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    risk_score: {
      type: DataTypes.INTEGER,
    },
  }
);

// ***************** relation to company ********************

companyModel.hasMany(ApplicationCustomWeightageScoreModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
ApplicationCustomWeightageScoreModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

ApplicationSQLModel.hasMany(ApplicationCustomWeightageScoreModel, {
  onDelete: "CASCADE",
  foreignKey: "application_id",
});
ApplicationCustomWeightageScoreModel.belongsTo(ApplicationSQLModel, {
  foreignKey: "application_id",
});

// ***************** relation to assets custom ScoreWeightage Model  ********************

ApplicationScoreWeightageModel.hasMany(ApplicationCustomWeightageScoreModel, {
  onDelete: "CASCADE",
  foreignKey: "weightage_id",
});
ApplicationCustomWeightageScoreModel.belongsTo(ApplicationScoreWeightageModel, {
  foreignKey: "weightage_id",
});
export default ApplicationCustomWeightageScoreModel;
