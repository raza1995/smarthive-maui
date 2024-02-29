import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const { DataTypes } = require("sequelize");

const AssetScoreLogsModel = sequelize.define("asset_scores_logs", {
  risk_score: {
    type: DataTypes.INTEGER,
  },
});
// ***************** relation to company ********************

companyModel.hasMany(AssetScoreLogsModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
AssetScoreLogsModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasMany(AssetScoreLogsModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
AssetScoreLogsModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

export default AssetScoreLogsModel;
