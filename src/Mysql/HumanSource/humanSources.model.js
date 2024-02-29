import { DataTypes, Sequelize } from "sequelize"
import { integrationsNames } from "../../utils/constants"
import sequelize from "../db"
import IntegrationModel from "../Integration/integration.model"
import humanSQLModel from "../Human/human.model"

const humanSourcesModel = sequelize.define("human_sources", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  human_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  human_source_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sources_type: {
    type: DataTypes.ENUM,
    values: Object.keys(integrationsNames).map((key, index) => integrationsNames[key]),
    allowNull: false,
  },
  integration_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
})

// ***************** relation to asset sources **********************

humanSQLModel.hasMany(humanSourcesModel, {
  foreignKey: {
    name: "human_id",
  },
})

humanSourcesModel.belongsTo(humanSQLModel, {
  foreignKey: "human_id",
})

IntegrationModel.hasMany(humanSourcesModel, {
  foreignKey: {
    name: "integration_id",
  },
})
humanSourcesModel.belongsTo(IntegrationModel, {
  foreignKey: "integration_id",
})

export default humanSourcesModel
