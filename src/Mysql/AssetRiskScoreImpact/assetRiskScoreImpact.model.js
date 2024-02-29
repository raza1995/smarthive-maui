import { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const assetRiskScoreImpactModel = sequelize.define("asset_risk_score_impact", {
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
  company_id: {
    type: Sequelize.UUID,
  },
  impact_by_source: {
    type: DataTypes.STRING,
  },
  source_risk_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_risk_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  impact_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_score_pure: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});
// ***************** relation to company ********************

companyModel.hasMany(assetRiskScoreImpactModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
assetRiskScoreImpactModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});
// ***************** relation for asset ********************

assetSQLModel.hasMany(assetRiskScoreImpactModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
assetRiskScoreImpactModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

export default assetRiskScoreImpactModel;
