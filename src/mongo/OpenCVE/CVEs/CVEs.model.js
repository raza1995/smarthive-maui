const mongoose = require("mongoose");

const OpenCVEsSchema = mongoose.Schema(
  {
    id: String,
    cve_id: String,
    summary: String,
    detail: Object,
  },
  {
    timestamps: true,
  }
);

const openCVEsModel = mongoose.model("OpenCVE_cves", OpenCVEsSchema);

export default openCVEsModel;
