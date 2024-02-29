import { Sequelize } from "sequelize";
import sequelize from "../db";
import ApplicationSQLModel from "../Applications/application.model";
import companyModel from "../Companies/company.model";

const ApplicationServicesSQLModel = sequelize.define("application_services", {
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
  service_id: {
     type: Sequelize.UUID,
  },
});

// ***************** relation to company  ********************
companyModel.hasMany(ApplicationServicesSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "company_id",
});
ApplicationServicesSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// Relation to Application table
ApplicationSQLModel.hasMany(ApplicationServicesSQLModel, {
  foreignKey: "application_id",
  allowNull: false,
});
ApplicationServicesSQLModel.belongsTo(ApplicationSQLModel, {
  foreignKey: "application_id",
});

// Relation to Application table
ApplicationSQLModel.hasMany(ApplicationServicesSQLModel, {
  foreignKey: "service_id",
  allowNull: false,
});
ApplicationServicesSQLModel.belongsTo(ApplicationSQLModel, {
  foreignKey: "service_id",
});


export default ApplicationServicesSQLModel;
