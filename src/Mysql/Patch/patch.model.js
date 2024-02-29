import { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import softwarePackagesQLModel from "../SoftwarePackages/softwarePackages.model";
import softwareSQLModel from "../Softwares/softwares.model";

const patchSQLModel = sequelize.define("patches", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  patch_name: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  os_family: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  os_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  os_version: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patch_available_timestamp: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  patch_knowledge_base: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  patch_version: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  requires_reboot: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// ***************** relation to software packages ****************

softwarePackagesQLModel.hasOne(patchSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "package_id",
});
patchSQLModel.belongsTo(softwarePackagesQLModel, {
  foreignKey: "package_id",
});

// ***************** relation to assets  ********************
// assetSQLModel.hasMany(patchSQLModel, {
//     onDelete: "CASCADE",
//     foreignKey: "asset_id"
// });
// patchSQLModel.belongsTo(assetSQLModel, {
//     foreignKey: "asset_id"
// })

// ***************** relation to software  ********************
softwareSQLModel.hasMany(patchSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "software_id",
});
patchSQLModel.belongsTo(softwareSQLModel, {
  foreignKey: "software_id",
});

export default patchSQLModel;
