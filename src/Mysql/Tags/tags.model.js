import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const TagsModel = sequelize.define("tags", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    // defaultValue: Sequelize.literal('uuid_generate_v4()')
  },
  company_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// ***************** relation to company ********************

companyModel.hasMany(TagsModel, {
  onDelete:"CASCADE",
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
TagsModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

export default TagsModel;
