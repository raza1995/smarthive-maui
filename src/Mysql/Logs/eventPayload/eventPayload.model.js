import { DataTypes } from "sequelize";
import sequelize from "../../db";
import eventLogsModel from "../eventLogs/eventLogs.model";
import logsDb from "../logsDB";

const eventPayloadModel = sequelize.define("logs_event_payloads", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  event_id: { type: DataTypes.UUID },
  activity_label: { type: DataTypes.STRING },
  table_effected: { type: DataTypes.STRING },
  effected_item_id: { type: DataTypes.STRING },
  attributes_effected: { type: DataTypes.JSON },
  old_values: { type: DataTypes.JSON },
  new_values: { type: DataTypes.JSON },
});

eventLogsModel.hasOne(eventPayloadModel, { foreignKey: "event_id" });

eventPayloadModel.belongsTo(eventLogsModel, { foreignKey: "event_id" });

export default eventPayloadModel;
