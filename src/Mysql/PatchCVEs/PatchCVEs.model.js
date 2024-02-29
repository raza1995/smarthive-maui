import { Sequelize } from "sequelize";
import CVEsModel from "../Cves/Cves.model";
import sequelize from "../db";
import patchSQLModel from "../Patch/patch.model";

const PatchCVEsModel = sequelize.define("patch_cves", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    // defaultValue: Sequelize.literal('uuid_generate_v4()')
  },
  cve_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  patch_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

// ***************** relation to assets ********************

// CVEsModel.hasMany(PatchCVEsModel, {
//   onDelete:"CASCADE",
//   foreignKey: {
//     name: "cve_id",
//     allowNull: false,
//   },
// });
PatchCVEsModel.belongsTo(CVEsModel, {
  foreignKey: "cve_id",
});
// ***************** relation to tags ********************

// patchSQLModel.hasMany(PatchCVEsModel, {
//   onDelete:"CASCADE",
//   foreignKey: {
//     name: "patch_id",
//     allowNull: false,
//   },
// });
PatchCVEsModel.belongsTo(patchSQLModel, {
  foreignKey: "patch_id",
});

CVEsModel.belongsToMany(patchSQLModel, {
  through: { model: PatchCVEsModel },
  foreignKey: "cve_id",
  otherKey: "patch_id",

});
patchSQLModel.belongsToMany(CVEsModel, {
  through: { model: PatchCVEsModel },
  foreignKey: "patch_id",
  otherKey: "cve_id",
});
export default PatchCVEsModel;
