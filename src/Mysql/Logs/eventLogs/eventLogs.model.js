import { DataTypes } from "sequelize";
import assetSQLModel from "../../Assets/assets.model";
import companyModel from "../../Companies/company.model";
import sequelize from "../../db";
import userModel from "../../Users/users.model";
import activityModel from "../Activities/activity.madel";
import activityStatusModel from "../activityStatus/activityStatus.model";
import logsDb from "../logsDB";

const eventLogsModel = sequelize.define("logs_event", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  client_id: { type: DataTypes.UUID, allowNull: true },
  client_email: { type: DataTypes.STRING },
  user_id: { type: DataTypes.UUID, allowNull: true },
  asset_id: { type: DataTypes.UUID, allowNull: true },
  activity_code: { type: DataTypes.STRING },
  activity_id: { type: DataTypes.UUID },
  client_ip_address: { type: DataTypes.STRING },
  process: { type: DataTypes.STRING },
  status_code: { type: DataTypes.STRING },
  status_id: { type: DataTypes.UUID },
  error_reason: { type: DataTypes.STRING },
  company_id: { type: DataTypes.UUID },
  target_id: { type: DataTypes.UUID, allowNull: true },
  effected_table: { type: DataTypes.STRING, allowNull: true },
  is_system_log: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

companyModel.hasMany(eventLogsModel, { foreignKey: "company_id",  });

eventLogsModel.belongsTo(companyModel, { foreignKey: "company_id" });

userModel.hasMany(eventLogsModel, { foreignKey: "client_id", as: "Client" });

eventLogsModel.belongsTo(userModel, { foreignKey: "client_id", as: "Client" });

userModel.hasMany(eventLogsModel, { foreignKey: "user_id", as: "user" });

eventLogsModel.belongsTo(userModel, { foreignKey: "user_id", as: "user" });

assetSQLModel.hasMany(eventLogsModel, { foreignKey: "asset_id" });

eventLogsModel.belongsTo(assetSQLModel, { foreignKey: "asset_id" });

activityModel.hasMany(eventLogsModel, {
  foreignKey: "activity_id",
  as: "activity",
});

eventLogsModel.belongsTo(activityModel, {
  foreignKey: "activity_id",
  as: "activity",
});

activityStatusModel.hasMany(eventLogsModel, {
  foreignKey: "status_id",
  as: "activity_status",
});

eventLogsModel.belongsTo(activityStatusModel, {
  foreignKey: "status_id",
  as: "activity_status",
});

export default eventLogsModel;
