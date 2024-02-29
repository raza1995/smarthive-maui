import { DataTypes, Sequelize } from "sequelize";
import { integrationsNames } from "../../utils/constants";
import assetSQLModel from "../Assets/assets.model";
import sequelize from "../db";
import IntegrationModel from "../Integration/integration.model";

const assetSourcesModel = sequelize.define("asset_sources", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  asset_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  sources_type: {
    type: DataTypes.ENUM,
    values: Object.keys(integrationsNames).map((key, index) => integrationsNames[key]),
    allowNull: false,
  },
  device_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Storing asset id which comes from the API.",
  },
});

// ***************** relation to asset sources **********************

assetSQLModel.hasMany(assetSourcesModel, {
  foreignKey: {
    name: "asset_id",
    allowNull: false,
  },
});

assetSourcesModel.belongsTo(assetSQLModel, {
  foreignKey: "asset_id",
});

IntegrationModel.hasMany(assetSourcesModel, {
  foreignKey: {
    name: "integration_id",
  },
});
assetSourcesModel.belongsTo(IntegrationModel, {
  foreignKey: "integration_id",
});
export default assetSourcesModel;
