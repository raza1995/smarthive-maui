import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";
import userModel from "./users.model";

const userDetailsModel = sequelize.define("user_details", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  user_id: {
        type: Sequelize.UUID,
    },
  clients_count: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company_address_one: {
    type: DataTypes.STRING,
  },
  company_address_two: {
    type: DataTypes.STRING,
  },
});

userModel.hasOne(userDetailsModel, {
  foreignKey: {
    name: "user_id",
    allowNull: false,
  },
});
userDetailsModel.belongsTo(userModel, {
  foreignKey: "user_id",
});

export default userDetailsModel;
