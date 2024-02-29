import { DataTypes, Sequelize } from "sequelize";
import { companyIndustryTypes } from "../Companies/company.model";
import sequelize from "../db";

const CompaniesPeerScoreHistoryModel = sequelize.define(
  "companies_peer_score_history",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    peer_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    industry_type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: companyIndustryTypes,
    },
  }
);

export default CompaniesPeerScoreHistoryModel;
