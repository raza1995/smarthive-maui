import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";
import { integrationsNames } from "../../utils/constants";
// import assetSQLModel from "../Assets/assets.model";

const IntegrationBaseUrlsModel = sequelize.define("integrations_base_urls", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  integration_name: {
    type: DataTypes.ENUM,
    values: Object.keys(integrationsNames).map((key) => integrationsNames[key]),
    allowNull: false,
  },
  base_url: { type: DataTypes.STRING, allowNull: false },
  base_url_slug: { type: DataTypes.STRING, allowNull: false },
});

export default IntegrationBaseUrlsModel;
