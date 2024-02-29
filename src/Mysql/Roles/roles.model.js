import {
    DataTypes, Sequelize
} from "sequelize";
import companyModel from "../Companies/company.model";
import sequelize from "../db";

const rolesSQLModel = sequelize.define("roles", {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true
    },
    company_id: {
        type: Sequelize.UUID,
        // allowNull: true,
    },
    name: {
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
    description: {
        type: DataTypes.TEXT,
    },
});

// Relation to Company model
companyModel.hasMany(rolesSQLModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
rolesSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

export default rolesSQLModel;