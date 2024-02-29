import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../postgresDb";

const OpenCVEsVendorsModel = sequelize.define(
  "vendors",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default OpenCVEsVendorsModel;
