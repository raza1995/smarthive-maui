import { DataTypes, Sequelize } from "sequelize"
import assetSQLModel from "../Assets/assets.model"
import sequelize from "../db"
import riskCostFactorSQLModel from "../RiskCostFactor/riskCostFactor.model"
import TagsModel from "../Tags/tags.model"

const riskCostFactorSelectedTagsModel = sequelize.define("risk_cost_factor_selected_tags", {
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
  tag_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },

})

// ***************** relations **********************

riskCostFactorSQLModel.hasMany(riskCostFactorSelectedTagsModel, {
  onDelete:"CASCADE",
  foreignKey: {
    name: "risk_cost_factor_id",
  },
})

riskCostFactorSelectedTagsModel.belongsTo(TagsModel, {
  foreignKey: "tag_id",
});

export default riskCostFactorSelectedTagsModel
