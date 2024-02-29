import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../../Companies/company.model";
import sequelize from "../../db";
import userModel from "../../Users/users.model";

const HumanScoreWeightageModel = sequelize.define(
  "human_score_weightage",
  {
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
    linked_assets_weightage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    security_awareness_weightage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pishing_weightage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mfa_weightage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    apply_on_all_human: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    human_risks: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }
);

// ***************** relation to company ********************

companyModel.hasMany(HumanScoreWeightageModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
HumanScoreWeightageModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});
// ***************** relation to company ********************

userModel.hasMany(HumanScoreWeightageModel, {
  onDelete: "CASCADE",
  foreignKey: {
    name: "created_by_id",
    allowNull: false,
  },
});
HumanScoreWeightageModel.belongsTo(userModel, {
  foreignKey: "created_by_id",
  as: "created_by",
});

export default HumanScoreWeightageModel;
