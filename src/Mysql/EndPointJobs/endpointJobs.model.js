import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../db";

const endpointJobsModel = sequelize.define("endoints_jobs", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
  },
  source_job_id: {
    type: DataTypes.STRING,
  },
  asset_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  company_id: {
    type: DataTypes.STRING,
  },
  account_id: {
    type: DataTypes.STRING,
  },
  account_name: {
    type: DataTypes.STRING,
  },
  command: {
    type: DataTypes.STRING,
  },
  data: {
    type: DataTypes.STRING,
  },
  expires_at: {
    type: DataTypes.STRING,
  },
  issued_at: {
    type: DataTypes.STRING,
  },
  issued_by: {
    type: DataTypes.STRING,
  },
  issued_by_email: {
    type: DataTypes.STRING,
  },
  issued_by_name: {
    type: DataTypes.STRING,
  },
  machine_id: {
    type: DataTypes.STRING,
  },
  machine_name: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.INTEGER,
  },
  updated_at: {
    type: DataTypes.DATE,
  },
  relay_state: {
    type: DataTypes.STRING,
  },
  tags: {
    type: DataTypes.JSON,
  },
});

export default endpointJobsModel;
