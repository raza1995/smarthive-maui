import {
    DataTypes, Sequelize
} from "sequelize";
import { assetType } from "../../utils/constants";
import sequelize from "../db";

const riskToleranceSQLModel = sequelize.define("risk_tolerances", {
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
    asset_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: [assetType.network, assetType.nonNetwork],
    },
    tolerance_score: {
      type: DataTypes.FLOAT,
    },
    priority:{
      type: DataTypes.INTEGER,
      allowNull: false,
    }

});

export default riskToleranceSQLModel;