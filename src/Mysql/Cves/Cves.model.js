import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";

const CVEsMysqlModel = sequelize.define("cves", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  cve: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  severity: {
    type: DataTypes.STRING,
  },
  summary: {
    type: DataTypes.STRING(10000),
    allowNull: false,
  },
  baseScore: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 0,
  },
  impactScore: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 0,
  },
  exploitabilityScore: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 0,
  },
  publishedDate: {
    type: DataTypes.DATE,
  },
});

export default CVEsMysqlModel;
