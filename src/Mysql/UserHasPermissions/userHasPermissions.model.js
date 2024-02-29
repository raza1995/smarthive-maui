import {
    DataTypes, Sequelize
} from "sequelize";
import sequelize from "../db";
import permissionsSQLModel from "../Permissions/permissions.model";
import userModel from "../Users/users.model";

const userHasPermissionsSQLModel = sequelize.define("user_has_permissions", {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true
    },
    permission_id: {
        type: Sequelize.UUID,
    },
    user_id: {
        type: Sequelize.UUID,        
    },
    actions: {
        type: DataTypes.JSON,
        allowNull: true,        
    }
});


// Relation to Roles model
userModel.hasMany(userHasPermissionsSQLModel, {
    foreignKey: {
    name: "user_id",
    allowNull: false,
  },
})
userHasPermissionsSQLModel.belongsTo(userModel, {
    foreignKey: "user_id",
});

// Relation to Permission model
permissionsSQLModel.hasMany(userHasPermissionsSQLModel, {
    foreignKey: {
    name: "permission_id",
    allowNull: false,
  },
})
userHasPermissionsSQLModel.belongsTo(permissionsSQLModel, {
    foreignKey: "permission_id",
});

export default userHasPermissionsSQLModel;