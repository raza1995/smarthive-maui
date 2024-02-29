import {
    DataTypes, Sequelize
} from "sequelize";
import sequelize from "../db";

const permissionsSQLModel = sequelize.define("permissions", {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true
    },
    module_name: {
        type: DataTypes.STRING,
    },
    slug: {
        type: DataTypes.STRING,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,        
    },
    actions: {
        type: DataTypes.JSON,
    },
    parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue:null
    },
});


permissionsSQLModel.belongsTo(permissionsSQLModel, {
  foreignKey: "parent_id",
  targetKey: "id",
  as: 'parent',
});


permissionsSQLModel.hasMany(permissionsSQLModel, {
  foreignKey: "parent_id",
  targetKey: "id",
  as: 'children',
});

export default permissionsSQLModel;