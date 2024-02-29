import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../../db";
import activityCategoryModel from "../ActivityCategories/activityCategories.model";
import logsDb from "../logsDB";

const activityModel = sequelize.define("logs_activities", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  label: { type: DataTypes.STRING },
  code: { type: DataTypes.STRING, unique: true },
  category_id: { type: DataTypes.UUID },
});

activityCategoryModel.hasMany(activityModel, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
  as: "activity_categories",
});

activityModel.belongsTo(activityCategoryModel, {
  foreignKey: "category_id",
  as: "activity_categories",
});

export default activityModel;
