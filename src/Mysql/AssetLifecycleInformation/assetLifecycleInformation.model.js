import  { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import IntegrationModel from "../Integration/integration.model";

const AssetLifecycleInformationModel = sequelize.define(
  "asset_lifecycle_information",
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
    device_type: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    vendor: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    software_version: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    serial_number: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    risk_score: {
      type: DataTypes.FLOAT,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: null,
      allowNull: true,
    },
    firmware_version: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    last_updated_at: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    last_seen: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
    },
    online_status: {
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
    service_coverage_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    service_attachment_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    contract_renewal_availability: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    recommended_software_version: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    sales_availability: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    software_maintenance_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    security_software_maintenance_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    last_support_status: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
  }
);
// ***************** relation to company ********************

companyModel.hasMany(AssetLifecycleInformationModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
AssetLifecycleInformationModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasMany(AssetLifecycleInformationModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
AssetLifecycleInformationModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

// ***************** relation to integration  ********************

IntegrationModel.hasOne(AssetLifecycleInformationModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "integration_id",
  },
});
AssetLifecycleInformationModel.belongsTo(IntegrationModel, {
  foreignKey: "integration_id",
});

export default AssetLifecycleInformationModel;
