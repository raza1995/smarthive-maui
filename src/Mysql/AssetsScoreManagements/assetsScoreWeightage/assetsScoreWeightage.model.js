import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../../Companies/company.model";
import sequelize from "../../db";
import userModel from "../../Users/users.model";


const assetsScoreWeightageModel = sequelize.define("assets_score_weightage", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    // defaultValue: Sequelize.literal('uuid_generate_v4()')
  },
  created_by_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  company_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lifecycle_weightage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patching_weightage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  endpoint_weightage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  backup_weightage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  realtime_weightage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  filter: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  priority:{
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

// ***************** relation to company ********************

companyModel.hasMany(assetsScoreWeightageModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
assetsScoreWeightageModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});
// ***************** relation to company ********************

userModel.hasMany(assetsScoreWeightageModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "created_by_id",
    allowNull: false,
  },
  as: "created_by",
});
assetsScoreWeightageModel.belongsTo(userModel, {
  foreignKey: "created_by_id",
  as: "created_by",
});

export default assetsScoreWeightageModel;
