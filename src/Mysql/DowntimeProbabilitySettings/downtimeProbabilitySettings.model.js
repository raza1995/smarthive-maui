import {
    DataTypes, Sequelize
} from "sequelize";
import sequelize from "../db";

const downtimeProbabilitySettingSQLModel = sequelize.define("downtime_probability_settings", {
    id: {
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        unique: true
    },
    downtime_probability_id: {
        type: Sequelize.UUID,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM,
        allowNull: false,
        defaultValue: "Patching",
        values: ["Patching", "Endpoint"],
    },
    condition: {
        type: DataTypes.ENUM,
        allowNull: false,
        defaultValue: "within",
        values: ["daily", "within"],
    },
    value: {
      type: DataTypes.STRING,
      allowNull: true,
    }

});

export default downtimeProbabilitySettingSQLModel;