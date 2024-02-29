import { DataTypes, Sequelize } from "sequelize"
import sequelize from "../db"
import riskToleranceSQLModel from "../RiskTolerance/riskTolerance.model"
import TagsModel from "../Tags/tags.model"

const riskToleranceSelectedTagsModel = sequelize.define("risk_tolerance_selected_tags", {
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
  tag_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },

})

// ***************** relations **********************

riskToleranceSQLModel.hasMany(riskToleranceSelectedTagsModel, {
  onDelete:"CASCADE",
  foreignKey: {
    name: "risk_tolerance_id",
  },
})

riskToleranceSelectedTagsModel.belongsTo(TagsModel, {
  foreignKey: "tag_id",
});

export default riskToleranceSelectedTagsModel
