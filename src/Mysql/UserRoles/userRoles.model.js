import {
    Sequelize
} from "sequelize";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import rolesSQLModel from "../Roles/roles.model";
import userModel from "../Users/users.model";

const userRolesSQLModel = sequelize.define("user_roles", {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true
    },
    company_id: {
        type: Sequelize.UUID,
    },
    user_id: {
        type: Sequelize.UUID,
    },
    role_id: {
        type: Sequelize.UUID,        
    }
});

// Relation to Company model
companyModel.hasMany(userRolesSQLModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
userRolesSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

// Relation to User model
userModel.hasMany(userRolesSQLModel, {
  foreignKey: {
    name: "user_id",
    allowNull: false,
  },
});
userRolesSQLModel.belongsTo(userModel, {
    foreignKey: "user_id",
});

// Relation to Roles model
rolesSQLModel.hasMany(userRolesSQLModel, {
    foreignKey: {
    name: "role_id",
    allowNull: false,
  },
})
userRolesSQLModel.belongsTo(rolesSQLModel, {
    foreignKey: "role_id",
});

export default userRolesSQLModel;