const mongoose = require("mongoose");

const OpenCWEsSchema = mongoose.Schema(
  {
    id: String,
    cwe_id: String,
    name: String,
    description: String,

  },
  {
    timestamps: true,
  }
);

const openCveCWEsModel = mongoose.model("OpenCVE_CWEs", OpenCWEsSchema);

export default openCveCWEsModel;
