import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";

const assetSQLModel = sequelize.define("asset", {

  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  company_id: {
    type: DataTypes.STRING,
  },
  asset_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ipaddress: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  asset_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  asset_sub_type: {
    type: DataTypes.STRING,
     allowNull: false,
  },
});

export default assetSQLModel;
