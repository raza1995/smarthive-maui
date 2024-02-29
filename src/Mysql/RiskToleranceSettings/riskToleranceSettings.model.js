import { DataTypes, Sequelize } from "sequelize"
import { integrationCategoryType, toleranceType } from "../../utils/constants"
import sequelize from "../db"
import riskToleranceSQLModel from "../RiskTolerance/riskTolerance.model"

const riskToleranceSettingsModel = sequelize.define("risk_tolerance_settings", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true
  },
  risk_tolerance_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  integration_type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: [integrationCategoryType.backup, integrationCategoryType.patching, integrationCategoryType.endpoint, integrationCategoryType.lifecycle],
  },
  condition: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: [toleranceType.optimal, toleranceType.tolerance],
  },
  condition_value: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  score: {
    type: DataTypes.FLOAT,
  },

})

// ***************** relations **********************

riskToleranceSQLModel.hasMany(riskToleranceSettingsModel, {
  onDelete:"CASCADE",
  foreignKey: {
    name: "risk_tolerance_id",
  },
})

export default riskToleranceSettingsModel
