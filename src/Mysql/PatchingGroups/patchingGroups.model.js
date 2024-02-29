import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const patchingtGroupsSQLModel = sequelize.define("patching_groups", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    // defaultValue: Sequelize.literal('uuid_generate_v4()')
  },
  // group_id: {
  //   type: DataTypes.STRING,
  // },
  server_group_id: {
    type: DataTypes.STRING,
  },
  // parent_server_group_id: {
  //   type: DataTypes.STRING,
  // },
  name: {
    type: DataTypes.STRING,
  },
  policies: {
    type: DataTypes.JSON,
  },
  ui_color: {
    type: DataTypes.STRING,
  },
  notes: {
    type: DataTypes.STRING,
  },
  enable_os_auto_update: {
    type: DataTypes.BOOLEAN,
  },
  enable_wsus: {
    type: DataTypes.BOOLEAN,
  },
  wsus_server: {
    type: DataTypes.STRING,
  },
  devices: {
    type: DataTypes.JSON,
  },
});

// ***************** relation to company ********************

companyModel.hasMany(patchingtGroupsSQLModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
patchingtGroupsSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

export default patchingtGroupsSQLModel;
