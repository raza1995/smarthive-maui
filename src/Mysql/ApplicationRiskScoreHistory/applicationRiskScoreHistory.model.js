import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";
import ApplicationSQLModel from "../Applications/application.model";
import companyModel from "../Companies/company.model";

const ApplicationRiskScoreHistorySQLModel = sequelize.define("application_risk_score_history", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  application_id: {
    type: Sequelize.UUID,
  },  
  company_id: {
     type: Sequelize.UUID,
  },
  risk_score: {
    type: DataTypes.FLOAT,
  },
  date: {
    type: DataTypes.DATE,
  },
});

// ***************** relation to company  ********************
companyModel.hasMany(ApplicationRiskScoreHistorySQLModel, {
  onDelete: "CASCADE",
  foreignKey: "company_id",
});
ApplicationRiskScoreHistorySQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// Relation to Application table
ApplicationSQLModel.hasMany(ApplicationRiskScoreHistorySQLModel, {
  foreignKey: "application_id",
  allowNull: false,
});
ApplicationRiskScoreHistorySQLModel.belongsTo(ApplicationSQLModel, {
  foreignKey: "application_id",
});


export default ApplicationRiskScoreHistorySQLModel;
