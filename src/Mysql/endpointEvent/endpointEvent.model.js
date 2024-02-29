import { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const endpointEventModel = sequelize.define("endpoint_event", {
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
  company_id: {
     type: Sequelize.UUID,
  },
  machine_id: {
    type: DataTypes.STRING,
  },
  user_id: {
    type: DataTypes.STRING,
  },
  source_event_id: {
    type: DataTypes.STRING,
  },
  source_name: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.INTEGER,
  },
  type_name: {
    type: DataTypes.STRING,
  },
  friendly_type: {
    type: DataTypes.STRING,
  },
  severity: {
    type: DataTypes.INTEGER,
  },
  severity_name: {
    type: DataTypes.STRING,
  },
  details: {
    type: DataTypes.JSON,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

// ***************** relation to company ********************

companyModel.hasMany(endpointEventModel, {
  foreignKey: {
    name: "company_id",
  },
});
endpointEventModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// ***************** relation to asset  ********************

assetSQLModel.hasMany(endpointEventModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
endpointEventModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

export default endpointEventModel;
