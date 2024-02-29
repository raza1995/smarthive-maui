import {
    DataTypes, Sequelize
} from "sequelize";
import sequelize from "../db";

const downtimeProbabilitySQLModel = sequelize.define("downtime_probabilities", {
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
    asset_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    default_downtime_probability_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    default_downtime_probability_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    modified_downtime_probability_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    modified_downtime_probability_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }

});

export default downtimeProbabilitySQLModel;