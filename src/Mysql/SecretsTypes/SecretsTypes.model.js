import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";

const SecretsTypesModel = sequelize.define("secrets_types", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default SecretsTypesModel;
