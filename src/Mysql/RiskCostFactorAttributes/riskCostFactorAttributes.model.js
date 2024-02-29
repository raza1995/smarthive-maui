import { DataTypes, Sequelize } from "sequelize"
import sequelize from "../db"

const riskCostFactorAttributesModel = sequelize.define("risk_cost_factor_attributes", {
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
  attribute_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },

})

// ***************** relations **********************


export default riskCostFactorAttributesModel
