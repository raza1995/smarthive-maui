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

const deviceWarrantyModel = mongoose.model(
  "auvik_device_warranty",
  deviceSchema
);

module.exports = deviceWarrantyModel;
