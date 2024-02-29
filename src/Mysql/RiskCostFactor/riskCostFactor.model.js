import {
    DataTypes, Sequelize
} from "sequelize";
import sequelize from "../db";

const riskCostFactorSQLModel = sequelize.define("risk_cost_factors", {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    base_range_lower_bound: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    base_range_upper_bound: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    has_peak_time: {
        type: DataTypes.ENUM,
        allowNull: false,
        defaultValue: "yes",
        values: ["yes", "no"],
    },
    peak_range_lower_bound: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    peak_range_upper_bound: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    // has_peak_all_days: {
    //     type: DataTypes.ENUM,
    //     allowNull: false,
    //     defaultValue: "no",
    //     values: ["yes", "no"],
    // },
    peak_range_from_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    peak_range_to_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    priority:{
      type: DataTypes.INTEGER,
      allowNull: false,
    }

});

export default riskCostFactorSQLModel;