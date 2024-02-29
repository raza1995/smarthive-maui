import mongoose, { model, Schema } from "mongoose";

const automoxSoftwareSchema = Schema(
  {
    id: Number,
    company_id: String,
    server_id: Number,
    package_id: Number,
    software_id: Number,
    installed: Boolean,
    ignored: Boolean,
    group_ignored: Boolean,
    deferred_until: mongoose.Mixed,
    group_deferred_until: mongoose.Mixed,
    name: String,
    display_name: String,
    version: String,
    repo: String,
    cves: [],
    cve_score: String,
    agent_severity: String,
    severity: String,
    package_version_id: Number,
    os_name: String,
    os_version: String,
    os_version_id: Number,
    create_time: String,
    requires_reboot: Boolean,
    patch_classification_category_id: String,
    patch_scope: String,
    is_uninstallable: Boolean,
    secondary_id: String,
    is_managed: Boolean,
    impact: String,
    organization_id: Number,
  },
  {
    timestamps: true,
  }
);

const automoxSoftwareModel = model(
  "automox_devices_software",
  automoxSoftwareSchema
);
export default automoxSoftwareModel;
