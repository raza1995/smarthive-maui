import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const ApplicationSQLModel = sequelize.define(
  "applications",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    custom_methodology_risk_score: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "N/A",
    },
    default_risk_score: {
      type: DataTypes.INTEGER,
    },
    company_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    risk_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    linked_human_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    linked_asset_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: null,
      allowNull: true,
    },
    is_shared_service: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    is_using_other_services: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
  },
  {
    hooks: {
      async afterSave(application, options) {
        const risk_score =
          application.custom_methodology_risk_score === "N/A"
            ? application.default_risk_score
            : parseInt(application.custom_methodology_risk_score, 10);
        if (risk_score !== application.risk_score) {
          console.log(
            "application risk score updated",
            { new: risk_score },
            application.risk_score,
            options.fields
          );
          await application.update({ risk_score });
        }
        return true;
      },
    },
  }
);

// ***************** relation to company  ********************
companyModel.hasMany(ApplicationSQLModel, {
  onDelete: "CASCADE",
  foreignKey: "company_id",
});
ApplicationSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

export default ApplicationSQLModel;
