import { DataTypes, Sequelize } from "sequelize";
import assetSQLModel from "../Assets/assets.model";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import patchSQLModel from "../Patch/patch.model";
import softwarePackagesQLModel from "../SoftwarePackages/softwarePackages.model";
import softwareSQLModel from "../Softwares/softwares.model";

const assetPatchSQLModel = sequelize.define("asset_patches", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  applied: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  patch_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});
// // ***************** relation to assets  ********************
// assetSQLModel.hasMany(assetPatchSQLModel, {
//   onDelete: "CASCADE",
//   foreignKey: "asset_id",
// });
assetPatchSQLModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});


// ***************** relation to software  ********************
softwareSQLModel.hasMany(assetPatchSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "software_id",
});
assetPatchSQLModel.belongsTo(softwareSQLModel, {
  foreignKey: "software_id",
});

// ***************** relation to company  ********************
companyModel.hasMany(assetPatchSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "company_id",
});
assetPatchSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// // // ***************** relation to patch  ********************
// patchSQLModel.hasMany(assetPatchSQLModel, {
//   onDelete: "CASCADE",
//   foreignKey: "patch_id",
//   // as: "assetPatches"
// });
assetPatchSQLModel.belongsTo(patchSQLModel, {
  foreignKey: "patch_id",
  // as: "assetPatches"
});

// ***************** relation to patch  ********************
// assetPatchSQLModel.hasOne(patchSQLModel, {
//   onDelete: "CASCADE",
//   foreignKey: "patch_id",
// });
// // assetPatchSQLModel.belongsTo(patchSQLModel, {
// //   foreignKey: "patch_id",
// // });

// ***************** relation to software packages  ********************
softwarePackagesQLModel.hasOne(assetPatchSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "package_id",
});
assetPatchSQLModel.belongsTo(softwarePackagesQLModel, {
  foreignKey: "package_id",
});

assetSQLModel.belongsToMany(patchSQLModel, {
  through: { model: assetPatchSQLModel },
  foreignKey: "asset_id",
  otherKey: "patch_id",

});
patchSQLModel.belongsToMany(assetSQLModel, {
  through: { model: assetPatchSQLModel },
  foreignKey: "patch_id",
  otherKey: "asset_id",
});

export default assetPatchSQLModel;
