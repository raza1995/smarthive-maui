import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";
import companyModel from "../Companies/company.model";
import { integrationsNames } from "../../utils/constants";
import IntegrationBaseUrlsModel from "../IntegrationBaseUrls/IntegrationBaseUrls.model";
// import assetSQLModel from "../Assets/assets.model";

const IntegrationModel = sequelize.define("integrations", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  company_id: {
    type: Sequelize.UUID,
  },
  integration_category_type: { type: DataTypes.STRING, allowNull: false },
  integration_name: {
    type: DataTypes.ENUM,
    values: Object.keys(integrationsNames).map(
      (key, index) => integrationsNames[key]
    ),
    allowNull: false,
  },
  integration_values: { type: DataTypes.JSON, allowNull: false },
  integration_base_url_id: { type: Sequelize.UUID },
});
companyModel.hasMany(IntegrationModel, {
  foreignKey: {
    name: "company_id",
    allowNull: false,
  },
});
IntegrationModel.belongsTo(companyModel, {
  foreignKey: "company_id",
});

IntegrationBaseUrlsModel.hasMany(IntegrationModel, {
  foreignKey: {
    name: "integration_base_url_id",
  },
});
IntegrationModel.belongsTo(IntegrationBaseUrlsModel, {
  foreignKey: "integration_base_url_id",
});

export default IntegrationModel;
