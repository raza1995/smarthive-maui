import { DataTypes, Sequelize } from "sequelize"
import assetSQLModel from "../Assets/assets.model"
import sequelize from "../db"
import riskCostFactorSQLModel from "../RiskCostFactor/riskCostFactor.model"

const riskCostFactorSelectedAssetsModel = sequelize.define("risk_cost_factor_selected_assets", {
  // id: {
  //   type: DataTypes.INTEGER,
  //   primaryKey: true,
  //   autoIncrement: true,
  //   allowNull: false,
  // },
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true
  },
  risk_cost_factor_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  asset_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  asset_score: {
    type: DataTypes.FLOAT,
  },
  difference_from_baseline: {
    type: DataTypes.FLOAT,
  },
  downtime_cost: {
    type: DataTypes.FLOAT,
  },
  dynamic_costs: {
    type: DataTypes.JSON
  },
  financial_loss: {
    type: DataTypes.FLOAT,
  }

})

// ***************** relations **********************

riskCostFactorSQLModel.hasMany(riskCostFactorSelectedAssetsModel, {
  onDelete:"CASCADE",
  foreignKey: {
    name: "risk_cost_factor_id",
  },
})

riskCostFactorSelectedAssetsModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

export default riskCostFactorSelectedAssetsModel
