import mongoose, { model, Schema } from "mongoose";

const automoxDeviceSchema = Schema(
  {
    id: String,
    company_id: String,
    agent_version: String,
    commands: [],
    compatibility_checks: {
      low_diskspace: Boolean,
    },
    compliant: Boolean,
    connected: Boolean,
    create_time: String,
    custom_name: String,
    deleted: Boolean,
    detail: {
      WMI_INTEGRITY_CHECK: String,
      LAST_USER_LOGON: Object,
      SECURE_TOKEN_ACCOUNT: String,
      NICS: [Object],
      IPS: [String],
      AUTO_UPDATE_OPTIONS: mongoose.Mixed,
      MODEL: String,
      RAM: String,
      VERSION: String,
      VENDOR: String,
      SERIAL: String,
      DISKS: [Object],
      FQDNS: [],
      PS_VERSION: String,
      SERVICETAG: String,
      VOLUME: [Object],
      UPDATE_SOURCE_CHECK: mongoose.Mixed,
      WSUS_CONFIG: mongoose.Mixed,
      CPU: String,
      DISTINGUISHED_NAME: String,
    },
    display_name: String,
    exception: Boolean,
    instance_id: String,
    ip_addrs: [String],
    ip_addrs_private: [String],
    is_compatible: Boolean,
    is_delayed_by_notification: Boolean,
    is_delayed_by_user: Boolean,
    last_disconnect_time: String,
    last_logged_in_user: String,
    last_process_time: String,
    last_refresh_time: String,
    last_scan_failed: Boolean,
    last_update_time: String,
    name: String,
    needs_attention: Boolean,
    needs_reboot: Boolean,
    next_patch_time: String,
    notification_count: Number,
    organization_id: Number,
    organizational_unit: String,
    os_family: String,
    os_name: String,
    os_version: String,
    os_version_id: Number,
    patch_deferral_count: Number,
    patches: Number,
    pending: Boolean,
    pending_patches: String,
    policy_status: [Object],
    reboot_deferral_count: Number,
    reboot_is_delayed_by_notification: Boolean,
    reboot_is_delayed_by_user: Boolean,
    reboot_notification_count: Number,
    refresh_interval: Number,
    serial_number: String,
    server_group_id: Number,
    server_policies: [],
    status: Object,
    tags: [],
    timezone: String,
    total_count: Number,
    uptime: String,
    uuid: String,
  },
  {
    timestamps: true,
  }
);

const automoxDeviceModel = model("automox_devices", automoxDeviceSchema);
export default automoxDeviceModel;