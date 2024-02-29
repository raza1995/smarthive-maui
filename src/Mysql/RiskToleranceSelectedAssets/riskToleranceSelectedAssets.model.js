import { DataTypes, Sequelize } from "sequelize"
import assetSQLModel from "../Assets/assets.model"
import sequelize from "../db"
import riskToleranceSQLModel from "../RiskTolerance/riskTolerance.model"

const riskToleranceSelectedAssetsModel = sequelize.define("risk_tolerance_selected_assets", {
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
  asset_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },

})

// ***************** relations **********************

riskToleranceSQLModel.hasMany(riskToleranceSelectedAssetsModel, {
  onDelete:"CASCADE",
  foreignKey: {
    name: "risk_tolerance_id",
  },
})

riskToleranceSelectedAssetsModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

export default riskToleranceSelectedAssetsModel
