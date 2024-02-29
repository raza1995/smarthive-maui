import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../../db";
import activityModel from "../Activities/activity.madel";
import logsDb from "../logsDB";

const activityStatusModel = sequelize.define("logs_activity_status", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  label: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  code: { type: DataTypes.STRING, unique: true },
  activity_id: { type: DataTypes.UUID },
  severity: { type: DataTypes.STRING },
});

activityModel.hasMany(activityStatusModel, {
  foreignKey: "activity_id",
  onDelete: "CASCADE",
});

activityStatusModel.belongsTo(activityModel, { foreignKey: "activity_id" });

export default activityStatusModel;
