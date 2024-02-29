import { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const endpointQuarantineModel = sequelize.define("endpoints_quarantines", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  asset_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  source_quarantine_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company_id: {
     type: Sequelize.UUID,
    allowNull: false,
  },
  scan_id: {
    type: DataTypes.STRING,
  },
  machine_id: {
    type: DataTypes.STRING,
  },
  machine_name: {
    type: DataTypes.STRING,
  },
  group_id: {
    type: DataTypes.STRING,
  },
  detection_id: {
    type: DataTypes.STRING,
  },
  detection_id_from_endpoint: {
    type: DataTypes.STRING,
  },
  scanned_at: {
    type: DataTypes.STRING,
  },
  scanned_at_local: {
    type: DataTypes.STRING,
  },
  reported_at: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
  },
  threat_name: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.JSON,
  },
  path: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.STRING,
  },
  ip_address: {
    type: DataTypes.STRING,
  },
  url: {
    type: DataTypes.STRING,
  },
  port: {
    type: DataTypes.STRING,
  },
});
// ***************** relation to company ********************

companyModel.hasMany(endpointQuarantineModel, {
  foreignKey: {
    name: "company_id",
  },
});
endpointQuarantineModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasMany(endpointQuarantineModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
endpointQuarantineModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

export default endpointQuarantineModel;
