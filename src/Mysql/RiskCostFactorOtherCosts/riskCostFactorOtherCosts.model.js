import { DataTypes, Sequelize } from "sequelize"
import sequelize from "../db"
import riskCostFactorSQLModel from "../RiskCostFactor/riskCostFactor.model";
import riskCostFactorAttributesModel from "../RiskCostFactorAttributes/riskCostFactorAttributes.model";

const riskCostFactorOtherCostsModel = sequelize.define("risk_cost_factor_other_costs", {
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
  risk_cost_factor_attribute_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  lower_bound: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  upper_bound: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

})

// ***************** relations **********************

riskCostFactorSQLModel.hasMany(riskCostFactorOtherCostsModel, {
  onDelete:"CASCADE",
  foreignKey: {
    name: "risk_cost_factor_id",
  },
})

// riskCostFactorOtherCostsModel.belongsTo(riskCostFactorAttributesModel, {
//   foreignKey: "risk_cost_factor_attribute_id",
// });

riskCostFactorOtherCostsModel.belongsTo(riskCostFactorAttributesModel, {
  foreignKey: "risk_cost_factor_attribute_id",
});

export default riskCostFactorOtherCostsModel
