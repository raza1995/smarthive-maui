import { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const endpointDetectionsModel = sequelize.define("endpoints_detections", {
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
  source_detection_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  source_location: {
    type: DataTypes.JSON,
  },
  destination_location: {
    type: DataTypes.JSON,
  },
  group_id: {
    type: DataTypes.STRING,
  },
  is_root_detection: {
    type: DataTypes.BOOLEAN,
  },
  threat_name: {
    type: DataTypes.STRING,
  },
  machine_id: {
    type: DataTypes.STRING,
  },
  account_id: {
    type: DataTypes.STRING,
  },
  detection_id: {
    type: DataTypes.STRING,
  },
  scanned_at: {
    type: DataTypes.DATE,
  },
  scanned_at_offset_seconds: {
    type: DataTypes.INTEGER,
  },
  reported_at: {
    type: DataTypes.DATE,
  },
  category: {
    type: DataTypes.STRING,
  },
  is_rtp_stream_event: {
    type: DataTypes.BOOLEAN,
  },
  process_name: {
    type: DataTypes.STRING,
  },
  cleaned_at: {
    type: DataTypes.DATE,
  },
  machine_name: {
    type: DataTypes.STRING,
  },
  machine_ip: {
    type: DataTypes.STRING,
  },
  child_trace_count: {
    type: DataTypes.INTEGER,
  },
  account: {
    type: DataTypes.JSON,
  },
  type: {
    type: DataTypes.JSON,
  },
  path: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
  },
  last_user: {
    type: DataTypes.STRING,
  },
});

// ***************** relation to company ********************

companyModel.hasMany(endpointDetectionsModel, {
  foreignKey: {
    name: "company_id",
  },
});
endpointDetectionsModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasMany(endpointDetectionsModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
endpointDetectionsModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});
export default endpointDetectionsModel;
