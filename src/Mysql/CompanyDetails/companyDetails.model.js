import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const companyDetailsModel = sequelize.define("company_details", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  company_id: {
        type: Sequelize.UUID,
    },
  clients_count: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company_address_one: {
    type: DataTypes.STRING,
  },
  company_address_two: {
    type: DataTypes.STRING,
  },
});

companyModel.hasOne(companyDetailsModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
companyDetailsModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

export default companyDetailsModel;
