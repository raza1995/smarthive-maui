import { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import softwarePackagesQLModel from "../SoftwarePackages/softwarePackages.model";
import softwareSQLModel from "../Softwares/softwares.model";

const assetSoftwareSQLModel = sequelize.define("asset_softwares", {
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
    allowNull: false,
  },
  software_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  package_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  software_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

// ********************* many to many relation between assets and software *******************************
assetSQLModel.belongsToMany(softwareSQLModel, {
  through: { model: assetSoftwareSQLModel },
  foreignKey: "asset_id",
  otherKey: "software_id",
});
softwareSQLModel.belongsToMany(assetSQLModel, {
  through: { model: assetSoftwareSQLModel },
  foreignKey: "software_id",
  otherKey: "asset_id",
});

// ***************** relation to company  ********************
companyModel.hasMany(assetSoftwareSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "company_id",
});
assetSoftwareSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

softwarePackagesQLModel.hasMany(assetSoftwareSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "package_id",
});

// ***************** relation to assets  ********************
assetSQLModel.hasMany(assetSoftwareSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "asset_id",
});
assetSoftwareSQLModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});
// ***************** relation to software  ********************
softwareSQLModel.hasMany(assetSoftwareSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "software_id",
});

// ********************* many to many relation between assets and software *******************************
assetSoftwareSQLModel.belongsTo(softwareSQLModel, {
  foreignKey: "software_id",
});
assetSoftwareSQLModel.belongsTo(softwarePackagesQLModel, {
  foreignKey: "package_id",
});
export default assetSoftwareSQLModel;
