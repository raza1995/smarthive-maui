import { DataTypes, Sequelize } from "sequelize"
import sequelize from "../db"
import humanSQLModel from "../Human/human.model"
import companyModel from "../Companies/company.model"

const humanRiskScoreHistoryModel = sequelize.define("human_risk_scores_history", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  company_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  human_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  security_awareness: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0.00
  },
  pishing: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0.00
  },
  asset: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0.00
  },
  mfa: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0.00
  },
  column_effected: {
    type: DataTypes.STRING
  },
  risk_score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0.00
  }

})

// ***************** relations **********************

humanSQLModel.hasMany(humanRiskScoreHistoryModel, {
  foreignKey: {
    name: "human_id",
  },
})

humanRiskScoreHistoryModel.belongsTo(humanSQLModel, {
  foreignKey: "human_id",
})

companyModel.hasMany(humanRiskScoreHistoryModel, {
  foreignKey: {
    name: "company_id",
  },
})
humanRiskScoreHistoryModel.belongsTo(companyModel, {
  foreignKey: "company_id",
})

export default humanRiskScoreHistoryModel
