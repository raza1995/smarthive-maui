import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";

export const companyIndustryTypes = ["Financial", "SLED", "Medical"];
const companyModel = sequelize.define("companies", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company_domain: {
    type: DataTypes.STRING,
    // unique: true,
    allowNull: false,
  },
  industry_type: {
    type: DataTypes.ENUM,
    allowNull: false,
    defaultValue: "Financial",
    values: companyIndustryTypes,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "company",
  },
  company_score: {
    type: DataTypes.INTEGER,
  },
});

export default companyModel;
