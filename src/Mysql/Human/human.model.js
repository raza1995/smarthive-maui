import {
    DataTypes, Sequelize
} from "sequelize";
import { humansRiskTypes } from "../../utils/constants";
import companyModel from "../Companies/company.model";
import sequelize from "../db";
import userModel from "../Users/users.model";

const humanSQLModel = sequelize.define("humans", {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true
    },
    company_id: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    human_id: {
        type: DataTypes.STRING,
    },
    user_id: {
        type: Sequelize.UUID,
        allowNull: true,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    risk_level: {
        type: DataTypes.ENUM,
        values: Object.keys(humansRiskTypes).map((key, index) => humansRiskTypes[key]),
        allowNull: false,
        defaultValue: humansRiskTypes.medium
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    current_risk_score: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    job_title: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    region: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    groups: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
});
companyModel.hasMany(humanSQLModel, {
  foreignKey: {
    name: "company_id",
  },
})
humanSQLModel.belongsTo(companyModel, {
  foreignKey: "company_id",
})

userModel.hasOne(humanSQLModel, {
  foreignKey: {
    name: "user_id",
  },
})
humanSQLModel.belongsTo(userModel, {
  foreignKey: "user_id",
})

export default humanSQLModel;