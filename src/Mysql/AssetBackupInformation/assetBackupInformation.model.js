import { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import IntegrationModel from "../Integration/integration.model";

const AssetBackupInformationModel = sequelize.define(
  "asset_backup_information",
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
    device_name: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    device_id: {
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
    upgrade_state: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    added_on: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    lastUpgradedOn: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    device_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },

    totalBackupData: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    totalBackupDataInBytes: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    lastConnected: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    deviceMarkedInactive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    snapshot_size: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    backup_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    backup_start_time: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    backup_end_time: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    files_backed_up: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    bytes_transferred: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    files_missed: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    system_settings_backed_up: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }
);
// ***************** relation to company ********************

companyModel.hasMany(AssetBackupInformationModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
AssetBackupInformationModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasMany(AssetBackupInformationModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
AssetBackupInformationModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

// ***************** relation to integration  ********************

IntegrationModel.hasOne(AssetBackupInformationModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "integration_id",
  },
});
AssetBackupInformationModel.belongsTo(IntegrationModel, {
  foreignKey: "integration_id",
});

export default AssetBackupInformationModel;
