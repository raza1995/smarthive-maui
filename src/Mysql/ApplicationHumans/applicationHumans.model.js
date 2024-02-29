import { Sequelize } from "sequelize";
import sequelize from "../db";
import ApplicationSQLModel from "../Applications/application.model";
import companyModel from "../Companies/company.model";
import humanSQLModel from "../Human/human.model";

const ApplicationHumansSQLModel = sequelize.define("application_humans", {
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
  human_id: {
    type: Sequelize.UUID,
  },
  company_id: {
     type: Sequelize.UUID,
  },
});

// ***************** relation to company  ********************
companyModel.hasMany(ApplicationHumansSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "company_id",
});
ApplicationHumansSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// Relation to Application table
ApplicationSQLModel.hasMany(ApplicationHumansSQLModel, {
  foreignKey: "application_id",
  allowNull: false,
});
ApplicationHumansSQLModel.belongsTo(ApplicationSQLModel, {
  foreignKey: "application_id",
});

// Relation to Humans Table
humanSQLModel.hasMany(ApplicationHumansSQLModel, {
  foreignKey: "human_id",
  allowNull: false,
});
ApplicationHumansSQLModel.belongsTo(humanSQLModel, {
  foreignKey: "human_id",
});


export default ApplicationHumansSQLModel;
