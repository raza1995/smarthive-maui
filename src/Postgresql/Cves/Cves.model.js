import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../postgresDb";

const OpenCVEsModel = sequelize.define(
  "cves",
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    cve_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    json: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    vendors: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    cwes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cvss2: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    cvss3: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
  },
  {
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default OpenCVEsModel;
