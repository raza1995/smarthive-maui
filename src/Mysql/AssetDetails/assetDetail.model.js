import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const { DataTypes, Sequelize } = require("sequelize");

const AssetDetailModel = sequelize.define("asset_details", {
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
  custom_name: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true,
  },
  custom_location: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true,
  },
  risk_score: {
    type: DataTypes.FLOAT,
  },
});
// ***************** relation to company ********************

companyModel.hasOne(AssetDetailModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
AssetDetailModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasOne(AssetDetailModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
AssetDetailModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

export default AssetDetailModel;
