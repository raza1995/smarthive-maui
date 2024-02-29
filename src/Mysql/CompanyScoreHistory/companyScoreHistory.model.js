import  { DataTypes, Sequelize } from "sequelize";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const companyScoreHistoryModel = sequelize.define("company_score_history", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  company_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  risk_score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0.00
  }
});

companyModel.hasMany(companyScoreHistoryModel, {
  foreignKey: {
    name: "company_id",
  },
})
companyScoreHistoryModel.belongsTo(companyModel, {
  foreignKey: "company_id",
})

export default companyScoreHistoryModel;
