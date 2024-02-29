import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";

const NotificationModel = sequelize.define("notifications", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  for: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  action_from_id: Sequelize.UUID,
  action_from_name: DataTypes.STRING,
  type: { type: DataTypes.STRING },
  heading: {
    type: DataTypes.STRING,
  },
  message: {
    type: DataTypes.STRING,
  },

  seen: { type: DataTypes.BOOLEAN, defaultValue: false },
  redirectLink: {
    type: DataTypes.STRING,
  },
});

export default NotificationModel;
