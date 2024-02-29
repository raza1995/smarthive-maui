import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../../Companies/company.model";
import sequelize from "../../db";
import secretsModel from "../../secrets/secret.model";
import privilegeAccessScoreWeightageModel from "../privilegeAccessScoreWeightage/privilegeAccessScoreWeightage.model";

const secretsCustomWeightageScoreModel = sequelize.define(
  "secrets_custom_weightage_scores",
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
    secret_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    risk_score: {
      type: DataTypes.INTEGER,
    },
  }
);

// ***************** relation to company ********************

companyModel.hasMany(secretsCustomWeightageScoreModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
secretsCustomWeightageScoreModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

secretsModel.hasMany(secretsCustomWeightageScoreModel, {
  onDelete: "CASCADE",
  foreignKey: "secret_id",
});
secretsCustomWeightageScoreModel.belongsTo(secretsModel, {
  foreignKey: "secret_id",
});

// ***************** relation to assets custom ScoreWeightage Model  ********************

privilegeAccessScoreWeightageModel.hasMany(secretsCustomWeightageScoreModel, {
  onDelete: "CASCADE",
  foreignKey: "weightage_id",
});
secretsCustomWeightageScoreModel.belongsTo(privilegeAccessScoreWeightageModel, {
  foreignKey: "weightage_id",
});
export default secretsCustomWeightageScoreModel;
