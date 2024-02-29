import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const patchingPoliciesSQLModel = sequelize.define("patching_policies", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  // policy_id: {
  //   type: Sequelize.UUID,
  //   allowNull: true,
  //   defaultValue: null,
  // },
  company_id: {
    type: Sequelize.UUID,
  },
  name: {
    type: DataTypes.STRING,
  },
  policy_type_name: {
    type: DataTypes.STRING,
  },
  configuration: {
    type: DataTypes.JSON,
  },
  // organization_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  //   defaultValue: null,
  // },
  schedule_days: {
    type: DataTypes.INTEGER,
  },
  schedule_time: {
    type: DataTypes.STRING,
  },
  schedule_weeks_of_month: {
    type: DataTypes.INTEGER,
  },
  schedule_months: {
    type: DataTypes.INTEGER,
  },
  server_groups: {
    type: DataTypes.JSON,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Active",
  },
});

// ***************** relation to company ********************

companyModel.hasMany(patchingPoliciesSQLModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
patchingPoliciesSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

export default patchingPoliciesSQLModel;
