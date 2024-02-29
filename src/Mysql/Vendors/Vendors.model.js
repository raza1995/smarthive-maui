import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";

const VendorsModel = sequelize.define("vendors", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    // defaultValue: Sequelize.literal('uuid_generate_v4()')
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});



export default VendorsModel;
