import  { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";

const CompaniesAverageScoreHistoryModel = sequelize.define("Companies_average_score_history", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  average_score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  }
});


export default CompaniesAverageScoreHistoryModel;
