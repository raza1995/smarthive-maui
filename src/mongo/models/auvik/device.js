const mongoose = require("mongoose");

const deviceSchema = mongoose.Schema(
  {
    id: { type: "string", index: true },
    type: String,
    attributes: {},
    relationships: {},
    links: {},
    company_id: String,
    supportEnd: String,
    firmwareLow: String,
    firmwareLatest: String,
  },
  {
    timestamps: true,
  }
);

const deviceModel = mongoose.model("auvik_devices", deviceSchema);

module.exports = deviceModel;
