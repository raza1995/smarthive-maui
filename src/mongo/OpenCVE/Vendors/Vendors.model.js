const mongoose = require("mongoose");

const OpenCVEVendorsSchema = mongoose.Schema(
  {
    id: String,
    name: String,
    human_name: String,
    products: Array,
  },
  {
    timestamps: true,
  }
);

const openCVEVendorsModel = mongoose.model("OpenCVE_Vendors", OpenCVEVendorsSchema);

export default openCVEVendorsModel;
