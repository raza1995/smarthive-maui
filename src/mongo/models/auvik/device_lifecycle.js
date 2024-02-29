const mongoose = require("mongoose");

const deviceSchema = mongoose.Schema(
  {
    id: { type: "string", index: true },
    type: String,
    attributes: {},
    company_id: String,
    relationships: {},
    links: {},
  },
  {
    timestamps: true,
  }
);

const deviceLifecycleModel = mongoose.model(
  "auvik_device_lifecycle",
  deviceSchema
);

module.exports = deviceLifecycleModel;
