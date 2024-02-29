const mongoose = require("mongoose");

const deviceSchema = mongoose.Schema(
  {
    id: { type: "string", index: true },
    type: String,
    company_id: String,
    attributes: {},
    relationships: {},
    links: {},
  },
  {
    timestamps: true,
  }
);

const deviceDetailsModel = mongoose.model("auvik_device_details", deviceSchema);

module.exports = deviceDetailsModel;
