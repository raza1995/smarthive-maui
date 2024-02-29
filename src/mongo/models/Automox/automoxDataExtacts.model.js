import mongoose, { model, Schema } from "mongoose";

const automoxReportDataSchema = Schema(
  {
    company_id: String,
    organization_id: String,
    device_id: String,
    device_name: String,
    device_custom_name: String,
    agent_version: String,
    group: String,
    package_id: String,
    device_ignored: String,
    group_ignored: String,
    patch_name: mongoose.Mixed,
    patch_version: String,
    patch_knowledge_base: String,
    operating_system_family: String,
    operating_system_name: String,
    operating_system_version: String,
    managed_patch: String,
    event_timestamp: String,
    patch_action: String,
    patch_available_timestamp: String,
    patch_installed_timestamp: String,
    exposure_time_hours: String,
    patch_severity: String,
    cves: Array,
    ip_address: String,
    policy_id: String,
    failure_reason: String,
    policy_type: String,
    patches: String,
  },
  {
    timestamps: true,
  }
);

const automoxPatchingReportModel = model(
  "automox_patching_reports",
  automoxReportDataSchema
);
export default automoxPatchingReportModel;
