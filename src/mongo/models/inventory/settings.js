import { Schema, model as _model, Types } from "mongoose";

const settingsSchema = Schema({
  user_id: { type: Types.ObjectId, required: true },
  patchUrl: { type: "string" },
});

const settingModel = _model("settings", settingsSchema);

export default settingModel;
