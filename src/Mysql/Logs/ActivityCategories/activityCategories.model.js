import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../../db";
import logsDb from "../logsDB";

const activityCategoryModel = sequelize.define("logs_activity_categories", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  label: { type: DataTypes.STRING },
  code: { type: DataTypes.STRING, unique: true },
});

export default activityCategoryModel;
