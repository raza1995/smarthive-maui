import { DataTypes, Sequelize } from "sequelize";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import userModel from "../Users/users.model";

const invitationModel = sequelize.define("invitations", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  email: { type: DataTypes.STRING },
  invited_by: { type: Sequelize.UUID },
  invited_from: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  invited_to: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  invite_code: { type: DataTypes.STRING },
  is_expired: { type: DataTypes.BOOLEAN },
  role: { type: DataTypes.STRING },
  role_permissions: { type: DataTypes.JSON, allowNull: true, defaultValue: null },
  company_name: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  company_id: { type: Sequelize.UUID, allowNull: true, defaultValue: null },
  address: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  industry: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
});

// ***************** relation to User table for invited by ********************

userModel.hasOne(invitationModel, {
  foreignKey: {
    name: "invited_by",
    allowNull: false,
  },
});
invitationModel.belongsTo(userModel, {
  foreignKey: "invited_by",
});

companyModel.hasMany(invitationModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
invitationModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});


export default invitationModel;
