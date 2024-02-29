import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";
import VendorsModel from "../Vendors/Vendors.model";

const softwareSQLModel = sequelize.define("softwares", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vendor_name: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  vendor_id: {
    type: Sequelize.UUID,
    allowNull: true,
  },
  is_uninstallable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: "1=>'able to uninstall', 0=>'not able to uninstall'	",
  },
});

VendorsModel.hasMany(softwareSQLModel, {
  onDelete: "SET NULL",
  foreignKey: "vendor_id",
});

softwareSQLModel.belongsTo(VendorsModel, {
  foreignKey: "vendor_id",
});

export default softwareSQLModel;
