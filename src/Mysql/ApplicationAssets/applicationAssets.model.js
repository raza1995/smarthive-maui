import { Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import sequelize from "../db";
import ApplicationSQLModel from "../Applications/application.model";
import companyModel from "../Companies/company.model";

const ApplicationAssetsSQLModel = sequelize.define("application_assets", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  application_id: {
    type: Sequelize.UUID,
  },
  asset_id: {
    type: Sequelize.UUID,
  },
  company_id: {
     type: Sequelize.UUID,
  },
});

// ***************** relation to company  ********************
companyModel.hasMany(ApplicationAssetsSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "company_id",
});
ApplicationAssetsSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// Relation to Application table
ApplicationSQLModel.hasMany(ApplicationAssetsSQLModel, {
  foreignKey: "application_id",
  allowNull: false,
});
ApplicationAssetsSQLModel.belongsTo(ApplicationSQLModel, {
  foreignKey: "application_id",
});

// Relation to Assets Table
assetSQLModel.hasMany(ApplicationAssetsSQLModel, {
  foreignKey: "asset_id",
  allowNull: false,
});
ApplicationAssetsSQLModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});


export default ApplicationAssetsSQLModel;
