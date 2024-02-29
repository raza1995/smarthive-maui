import { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../../Assets/assets.model";
import companyModel from "../../Companies/company.model";
import sequelize from "../../db";
import assetsScoreWeightageModel from "../assetsScoreWeightage/assetsScoreWeightage.model";

const assetsCustomWeightageScoreModel = sequelize.define(
  "assets_custom_weightage_scores",
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
    asset_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    risk_score: {
      type: DataTypes.INTEGER,
    },
    pure_risk_score: {
      type: DataTypes.INTEGER,
    },
  }
);

// ***************** relation to company ********************

companyModel.hasMany(assetsCustomWeightageScoreModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
assetsCustomWeightageScoreModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasMany(assetsCustomWeightageScoreModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
assetsCustomWeightageScoreModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

// ***************** relation to assets custom ScoreWeightage Model  ********************

assetsScoreWeightageModel.hasMany(assetsCustomWeightageScoreModel, {
  onDelete: "CASCADE",
  foreignKey: "weightage_id",
});
assetsCustomWeightageScoreModel.belongsTo(assetsScoreWeightageModel, {
  foreignKey: "weightage_id",
});
export default assetsCustomWeightageScoreModel;
