import {
    DataTypes, Sequelize
} from "sequelize";
import sequelize from "../db";
import permissionsSQLModel from "../Permissions/permissions.model";
import rolesSQLModel from "../Roles/roles.model";

const roleHasPermissionsSQLModel = sequelize.define("role_has_permissions", {
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
    role_id: {
        type: Sequelize.UUID,        
    },
    actions: {
        type: DataTypes.JSON,
        allowNull: true,        
    }
});


// Relation to Roles model
rolesSQLModel.hasMany(roleHasPermissionsSQLModel, {
    foreignKey: {
    name: "role_id",
    allowNull: false,
  },
})
roleHasPermissionsSQLModel.belongsTo(rolesSQLModel, {
    foreignKey: "role_id",
});

// Relation to Permission model
permissionsSQLModel.hasMany(roleHasPermissionsSQLModel, {
    foreignKey: {
    name: "permission_id",
    allowNull: false,
  },
})
roleHasPermissionsSQLModel.belongsTo(permissionsSQLModel, {
    foreignKey: "permission_id",
});

export default roleHasPermissionsSQLModel;