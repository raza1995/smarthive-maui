import  { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import IntegrationModel from "../Integration/integration.model";

const AssetEndpointInformationModel = sequelize.define(
  "asset_endpoint_information",
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
    location: {
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
    os_install_version: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    os_current_version: {
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
    remediation_required_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    remediation_required_infection_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  
    reboot_required_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    reboot_required_reasons_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    suspicious_activity_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    suspicious_activity_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },

    isolation_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isolation_process_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isolation_network_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isolation_desktop_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    scan_needed_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    scan_needed_last_seen_at: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    scan_needed_job_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    last_user: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    last_seen_at: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    last_updated_at: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    last_scan_time: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    account_id: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    // description: {
    //   type: DataTypes.TEXT,
    //   defaultValue: null,
    //   allowNull: true,
    // }
  }
);
// ***************** relation to company ********************

companyModel.hasMany(AssetEndpointInformationModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
AssetEndpointInformationModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasMany(AssetEndpointInformationModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
AssetEndpointInformationModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

// ***************** relation to integration  ********************

IntegrationModel.hasOne(AssetEndpointInformationModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "integration_id",
  },
});
AssetEndpointInformationModel.belongsTo(IntegrationModel, {
  foreignKey: "integration_id",
});

export default AssetEndpointInformationModel;
