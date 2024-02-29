import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../../Companies/company.model";
import sequelize from "../../db";
import humanSQLModel from "../../Human/human.model";

import ApplicationScoreWeightageModel from "../HumanScoreWeightage/HumanScoreWeightage.model";

const HumanCustomWeightageScoreModel = sequelize.define(
  "human_custom_weightage_scores",
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
    human_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    risk_score: {
      type: DataTypes.INTEGER,
    },
  }
);

// ***************** relation to company ********************

companyModel.hasMany(HumanCustomWeightageScoreModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
HumanCustomWeightageScoreModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

humanSQLModel.hasMany(HumanCustomWeightageScoreModel, {
  onDelete: "CASCADE",
  foreignKey: "human_id",
});
HumanCustomWeightageScoreModel.belongsTo(humanSQLModel, {
  foreignKey: "human_id",
});

// ***************** relation to assets custom ScoreWeightage Model  ********************

ApplicationScoreWeightageModel.hasMany(HumanCustomWeightageScoreModel, {
  onDelete: "CASCADE",
  foreignKey: "weightage_id",
});
HumanCustomWeightageScoreModel.belongsTo(ApplicationScoreWeightageModel, {
  foreignKey: "weightage_id",
});
export default HumanCustomWeightageScoreModel;
