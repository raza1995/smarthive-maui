import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";
import softwareSQLModel from "../Softwares/softwares.model";

const softwarePackagesQLModel = sequelize.define("software_packages", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  software_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  version: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  os_name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  os_version: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
});

// ***************** relation to software  ********************

softwareSQLModel.hasMany(softwarePackagesQLModel, {
  onDelete: "CASCADE",
  foreignKey: "software_id",
});
softwarePackagesQLModel.belongsTo(softwareSQLModel, {
  foreignKey: "software_id",
});

export default softwarePackagesQLModel;
