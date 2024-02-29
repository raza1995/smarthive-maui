import  { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import IntegrationModel from "../Integration/integration.model";


const AssetPatchingInformationModel = sequelize.define(
  "asset_patching_information",
  {
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
    integration_id: {
      type: Sequelize.UUID,
    },
    display_name: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    group: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    server_group_id: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    serial_number: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    os_family: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    os_name: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    os_version: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    risk_score: {
      type: DataTypes.FLOAT,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    device_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    agent_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    policy_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    connected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    compliant: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    exception: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_compatible: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    cpu: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    ram: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    volume: {
      type: DataTypes.JSON,
      defaultValue: null,
      allowNull: true,
    },
    last_logged_in_user: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    last_seen: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    last_scan_time: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    device_require_reboot: {
      type: DataTypes.BOOLEAN,
      defaultValue: null,
      allowNull: true,
    },
    next_patch_window: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    is_uptoDate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    number_of_patch_available: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    patch_severity: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    vendor: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    patching_available_from: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    all_patch_installed: {
      type: DataTypes.BOOLEAN,
      defaultValue: null,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: null,
      allowNull: true,
    },
    software_version: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    warranty_coverage_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    warranty_expiration_date: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
  }
);
// ***************** relation to company ********************

companyModel.hasMany(AssetPatchingInformationModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
AssetPatchingInformationModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasMany(AssetPatchingInformationModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
AssetPatchingInformationModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});


// ***************** relation to integration  ********************

IntegrationModel.hasOne(AssetPatchingInformationModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "integration_id",
  },
});
AssetPatchingInformationModel.belongsTo(IntegrationModel, {
  foreignKey: "integration_id",
});

export default AssetPatchingInformationModel;
