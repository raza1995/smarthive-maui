import { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const endpointSuspiciousActivityModel = sequelize.define(
  "endpoints_suspicious_activity",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    company_id: {
      type: Sequelize.UUID,
    },
    asset_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    source_suspicious_activity_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detection_id_list: {
      type: DataTypes.JSON,
    },
    status: {
      type: DataTypes.STRING,
    },
    timestamp: {
      type: DataTypes.STRING,
    },
    path: {
      type: DataTypes.STRING,
    },
    pc_hostname: {
      type: DataTypes.STRING,
    },
    machine_id: {
      type: DataTypes.STRING,
    },
    account_id: {
      type: DataTypes.STRING,
    },
    closed: {
      type: DataTypes.BOOLEAN,
    },
    level: {
      type: DataTypes.INTEGER,
    },
    detected_by_count: {
      type: DataTypes.INTEGER,
    },
  }
);
// ***************** relation to company ********************

companyModel.hasMany(endpointSuspiciousActivityModel, {
  foreignKey: {
    name: "company_id",
  },
});
endpointSuspiciousActivityModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasMany(endpointSuspiciousActivityModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
endpointSuspiciousActivityModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

export default endpointSuspiciousActivityModel;
